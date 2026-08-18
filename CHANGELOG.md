# Changelog

## 1.0.1 (2026-08-18)

### 安全

- `server/upload.php` 不再放行 SVG（内嵌脚本会导致存储型 XSS），并新增 `server/uploads/.htaccess` 纵深防御：禁脚本执行、禁目录列举、活动内容强制按纯文本下载
- `server/preview.php` 脚注 id 做 HTML 转义、脚注正文统一走渲染管线，修复属性注入
- 内置迷你渲染器增加 URL 协议白名单（http/https、相对路径、锚点、mailto），阻断 `javascript:` / `data:` 协议注入

### 修复

- HTML 源码模式切换后富文本区不隐藏的问题（CSS `display:flex` 覆盖了 `[hidden]` 属性）
- `previewUrl` 请求失败或响应异常时自动回退内置迷你渲染器，离线双击 `demo.html` 仍可预览
- 全屏模式支持 Esc 退出
- 有序 / 无序列表按钮支持多行选区批量添加前缀
- `destroy()` 在最后一个实例销毁时清理全局 toast 容器

## 1.0.0 (2026-08-15)

- 初始发布：独立双模式编辑器（Markdown + HTML 富文本），MIT 协议
