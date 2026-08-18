<?php
/**
 * KlockEditor — 服务端 Markdown 预览端点（可选件）
 * KlockEditor — Server-side Markdown preview endpoint (optional)
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
 * 用途：配置 KlockEditor.create(el, { previewUrl: 'server/preview.php' })
 * 渲染逻辑：ParsedownExtended + 数学公式保护 + 实体修复 + 脚注。
 *
 * 安全提示：
 *   - 本文件默认无鉴权，仅渲染不落盘。生产环境若编辑内容涉密，
 *     请自行加登录态/CSRF 校验后再放行。
 *   - 输出 HTML 未过滤（编辑器作者即内容作者场景）。若面向多用户，
 *     建议接入 HTML 净化器（如 purifier）后再输出。
 */

require_once __DIR__ . '/lib/Parsedown.php';
require_once __DIR__ . '/lib/ParsedownExtended.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$content = $_POST['content'] ?? '';

/** preg_replace_callback 安全包装：PCRE 超限返回 null 时保留原值 */
function klocke_preg_safe($result, string $original): string {
    return $result ?? $original;
}

function klocke_markdown_to_html(string $content): string {
    static $parsedown = null;
    if ($parsedown === null) {
        $parsedown = new \BenjaminHoegh\ParsedownExtended\ParsedownExtended([
            'emphasis' => [
                'subscript'   => true,
                'superscript' => true,
            ],
            'smartypants' => ['enabled' => true],
            'footnotes' => false,
            'quotes' => false,
            'lists' => ['tasks' => true],
        ]);
        $parsedown->setSafeMode(false);
        $parsedown->setBreaksEnabled(true);
        $parsedown->setUrlsLinked(true);
    }

    $content = htmlspecialchars_decode($content, ENT_QUOTES);
    $content = str_replace(["\r\n", "\r"], "\n", $content);
    $content = str_replace("｜", "|", $content);

    // 预提取脚注定义
    $footnotes = [];
    $content = klocke_preg_safe(preg_replace_callback('/^\[\^([^\]]+)\]:\s*(.+)$/m', function ($m) use (&$footnotes) {
        $footnotes[$m[1]] = trim($m[2]);
        return '';
    }, $content), $content);

    // 保护数学公式（KaTeX 渲染）
    $mathStore = [];
    $protectMath = function ($m) use (&$mathStore) {
        $id = count($mathStore);
        $mathStore[$id] = $m[0];
        return '<!--MATH' . $id . '-->';
    };
    $content = klocke_preg_safe(preg_replace_callback('/\$\$(.+?)\$\$/s', $protectMath, $content), $content);
    $content = klocke_preg_safe(preg_replace_callback('/(?<!\$)\$(?!\$)([^\$\n]+?)\$(?!\$)/', $protectMath, $content), $content);
    $content = klocke_preg_safe(preg_replace_callback('/\\\\\[(.+?)\\\\\]/s', $protectMath, $content), $content);
    $content = klocke_preg_safe(preg_replace_callback('/\\\\\((.+?)\\\\\)/s', $protectMath, $content), $content);

    try {
        $html = $parsedown->text($content);

        $html = klocke_preg_safe(preg_replace_callback('/<!--MATH(\d+)-->/', function ($m) use (&$mathStore) {
            return $mathStore[(int)$m[1]];
        }, $html), $html);

        // 修复 Parsedown 实体二次编码（不影响 code 内）
        $html = klocke_preg_safe(preg_replace_callback(
            '/<code[^>]*>.*?<\/code>(*SKIP)(*FAIL)|&amp;([a-zA-Z][a-zA-Z0-9]{1,20}|#[0-9]{1,7}|#x[0-9a-fA-F]{1,6});/s',
            function ($m) {
                return '&' . $m[1] . ';';
            },
            $html
        ), $html);

        if (!empty($footnotes)) {
            $footnoteIndex = 0;
            $html = klocke_preg_safe(preg_replace_callback('/\[\^([^\]]+)\]/', function ($m) use (&$footnotes, &$footnoteIndex) {
                $id = $m[1];
                if (isset($footnotes[$id])) {
                    $footnoteIndex++;
                    $eid = htmlspecialchars($id, ENT_QUOTES, 'UTF-8');
                    return '<sup class="footnote-ref" id="fnref-' . $eid . '"><a href="#fn-' . $eid . '">[' . $footnoteIndex . ']</a></sup>';
                }
                return $m[0];
            }, $html), $html);

            $footnoteIndex = 0;
            $fnHtml = "\n<div class=\"footnotes\">\n<hr>\n<ol>\n";
            foreach ($footnotes as $id => $text) {
                $footnoteIndex++;
                $eid = htmlspecialchars($id, ENT_QUOTES, 'UTF-8');
                // 正文走与主文档相同的渲染管线，保持同等信任级别
                $fnHtml .= '<li id="fn-' . $eid . '">' . $parsedown->text($text) . ' <a href="#fnref-' . $eid . '" class="footnote-back">&#8617;</a></li>' . "\n";
            }
            $fnHtml .= "</ol>\n</div>\n";
            $html .= $fnHtml;
        }
    } catch (Throwable $e) {
        $html = '<pre>' . htmlspecialchars($content, ENT_QUOTES, 'UTF-8') . '</pre>';
    }

    return $html;
}

echo json_encode([
    'success' => true,
    'html'    => klocke_markdown_to_html($content),
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
