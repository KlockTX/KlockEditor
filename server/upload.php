<?php
/**
 * KlockEditor — 服务端图片上传端点（可选件）
 * KlockEditor — Server-side image upload endpoint (optional)
 *
 * Copyright (c) 2026 KlockTX
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * 用途：配置 KlockEditor.create(el, { uploadUrl: 'server/upload.php' })
 * 接收 POST multipart 中的 file 字段，保存至 uploads/，返回 {success, url}。
 *
 * 安全提示：
 *   - 已含扩展名白名单、MIME 黑名单、大小上限；
 *   - 默认无鉴权，生产环境请自行加登录态/CSRF 校验；
 *   - uploads/ 目录需可写，且 Web 服务器需允许直接访问（或自行改为流式输出）；
 *   - uploads/.htaccess 提供纵深防御（禁脚本执行、活动内容强制下载），非 Apache 环境请自行等效配置。
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$maxSize = 10 * 1024 * 1024; // 10MB

/**
 * 返回给前端的 URL 前缀。
 * 默认根据本次请求的 URI 自动推导（端点与 uploads/ 目录同级，
 * 如 POST /KlockEditor/server/upload.php → /KlockEditor/server/uploads/xxx.png），
 * 部署到虚拟主机子路径或 CDN 时可改为常量覆盖，例如 'https://cdn.example.com/kb/'。
 */
$urlPrefix = null; // 例：'https://cdn.example.com/kb/'
if ($urlPrefix === null) {
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    $dir = rtrim(str_replace('\\', '/', dirname(parse_url($uri, PHP_URL_PATH) ?? '')), '/');
    $urlPrefix = ($dir === '' ? '' : $dir) . '/uploads/';
}

// 不放行 svg：SVG 可内嵌脚本，直存直出会形成存储型 XSS（uploads/.htaccess 提供纵深防御）
$allowExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp', 'ico'];

// 禁止直传的 HTML 容器型 MIME
$denyMime = ['text/html', 'application/xhtml+xml', 'application/x-httpd-php', 'image/svg+xml'];

if (empty($_FILES['file'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '未接收到文件']);
    exit;
}

$file = $_FILES['file'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '上传失败（code ' . $file['error'] . '）']);
    exit;
}
if ($file['size'] <= 0 || $file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '文件大小超出限制（≤10MB）']);
    exit;
}

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
if (!in_array($ext, $allowExt, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => '不支持的文件类型：' . $ext]);
    exit;
}

// 有 fileinfo 扩展时校验真实 MIME
if (function_exists('finfo_open')) {
    $fi = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($fi, $file['tmp_name']);
    finfo_close($fi);
    if (in_array($mime, $denyMime, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => '非法文件类型']);
        exit;
    }
}

$dir = __DIR__ . '/uploads';
if (!is_dir($dir) && !@mkdir($dir, 0755, true)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => '上传目录创建失败']);
    exit;
}

// 随机文件名防覆盖 / 防路径穿越
$name = date('Ymd') . '-' . bin2hex(random_bytes(8)) . '.' . $ext;
$dest = $dir . '/' . $name;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => '保存失败']);
    exit;
}

echo json_encode([
    'success' => true,
    'url'     => $urlPrefix . $name,
], JSON_UNESCAPED_SLASHES);
