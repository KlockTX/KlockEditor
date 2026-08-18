# Changelog

## 1.0.2 (2026-08-18)

### 修复

- **撤销栈**：Markdown 工具栏操作（加粗/列表/表格等）改用 `execCommand('insertText')` 写入（计入浏览器撤销栈，工具栏操作后 `Ctrl+Z` 可正常撤销，不支持时回退 `setRangeText`），不再直接赋 `value` 清空撤销栈；HTML 源码模式插图同理
- **IME 组合输入守卫**：拼音/假名组词期间不再误触发 `onChange` 与预览刷新，中文输入不再产生半截拼音的自动保存（`compositionstart`/`compositionend` 守卫，兼容 Safari 事件顺序）
- HTML 源码模式插入图片后补触发 `onChange`

### 新增

- **工具栏状态同步**：HTML 富文本模式下光标处于粗体/斜体/下划线/删除线内时，对应按钮自动高亮（`selectionchange` + `queryCommandState`），`destroy()` 时移除 document 级监听
- **TypeScript 类型声明** `klock-editor.d.ts`（同时覆盖 CommonJS 引入与 `window.KlockEditor` 全局）
- **单元测试** `test/mini-markdown.test.js`（零依赖，`npm test` 运行），新增 `package.json`

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
