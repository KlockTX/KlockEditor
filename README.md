# KlockEditor

**独立 Markdown 编辑器 · 分屏实时预览 · 零依赖**

**Standalone Markdown editor · Split live preview · Zero dependencies**

---

## 中文

### 简介

KlockEditor 是一个独立的 Markdown 编辑器组件，提供 **源码编辑、Markdown 原生所见即所得与实时预览**。v3.0.0 的 WYSIWYG 使用 ProseMirror 文档树，但对外输入、保存、回调和 API 始终只使用 Markdown 字符串；它不是旧版 HTML 富文本模式。需要历史 HTML 双模式请使用 v1.0.2。

### 特性

- **双编辑表面**：源码 textarea（原文保真）与 Markdown 原生 WYSIWYG（ProseMirror transaction/history）一键切换，公共数据始终是 Markdown
- **编辑手感**：列表/引用回车自动续行（有序列表自动编号）、任务列表 `- [ ]`、删除线 `~~ ~~`、粘贴 URL 自动成链
- **状态感知**：工具栏按钮随光标位置高亮；底部状态栏实时统计字符 / 词 / 行
- **实时预览**：渲染器三级可插拔（自定义函数 → 服务端 → 内置迷你渲染器，服务端失败自动回退）
- **图片上传**：拖拽 / 粘贴 / 工具栏三种入口，自动插入光标处
- **视图三态**：仅编辑 / 分屏 / 仅预览，另有全屏模式（Esc 退出）
- **快捷键**：`Ctrl/Cmd+B` 粗体 · `Ctrl/Cmd+I` 斜体 · `Ctrl/Cmd+K` 链接 · `Ctrl/Cmd+S` 保存 · `Tab` 缩进
- **自动深色**：跟随系统 `prefers-color-scheme`，也可 `theme` 选项或 `data-theme` 属性强制
- **主题化**：全部样式走 `.klock-editor-root` 作用域内的 `--klock-*` CSS 变量，覆盖即定制
- **UMD 导出**：浏览器全局 `window.KlockEditor` 与 CommonJS 均可
- **图标内联**：工具栏图标为内联 SVG，无需图标字体或外部图标库
- **TypeScript**：附 `klock-editor.d.ts` 类型声明，CommonJS 引入与 `window.KlockEditor` 全局均有类型
- **单元测试**：`npm test`（零依赖 Node 断言，覆盖迷你渲染器语法与 XSS 阻断）

### 目录结构

```
KlockEditor/
├── klock-editor.js        核心脚本（唯一必需文件）
├── klock-editor.css       配套样式（唯一必需文件）
├── klock-editor.d.ts      TypeScript 类型声明
├── demo.html              演示页（双击即可离线体验）
├── package.json           npm 包信息与测试脚本
├── test/                  零依赖单元测试（npm test）
├── CHANGELOG.md           变更日志
├── LICENSE                MIT 全文
└── server/                可选服务端（PHP）
    ├── preview.php          Markdown 预览渲染端点
    ├── upload.php           图片上传端点
    └── lib/                 Parsedown / ParsedownExtended（MIT 协议第三方库）
```

### 快速开始

**1. 纯前端（零后端，使用内置迷你渲染器）**

```html
<link rel="stylesheet" href="klock-editor.css">
<div id="editor"></div>
<script src="klock-editor.js"></script>
<script>
  var editor = KlockEditor.create(document.getElementById('editor'), {
    content: '# 你好',           // 初始内容
    onChange: function (content) { /* 内容变化 */ },
    onSave:   function () { /* Ctrl/Cmd+S */ }
  });
</script>
```

**2. 接入 PHP 服务端（预览与上传）**

```js
var editor = KlockEditor.create(document.getElementById('editor'), {
  previewUrl: 'server/preview.php',   // POST {content} → {success, html}
  uploadUrl:  'server/upload.php'     // POST FormData{file} → {success, url}
});
```

### 发行版选择

当前 v2.x 提供两个 ZIP 发行版；二者使用同一套前端 API，Full 不是 HTML 富文本版：

| 发行版 | 内容 | 适用场景 |
|---|---|---|
| **Editor-only** | JS/CSS/TS 声明、ProseMirror WYSIWYG bundle、内置安全兜底渲染器、离线 demo、文档 | 静态站点、前端项目、无需 PHP |
| **Full** | Editor-only 全部内容 + `server/preview.php`、`server/upload.php`、Parsedown 与许可证 | PHP 服务端完整 Markdown 渲染和图片上传 |

构建命令：`npm run build:wysiwyg` 后执行 `npm run package:editor`、`npm run package:full` 或 `npm run package`。Editor-only 不包含 PHP；Full 需要通过 PHP Web 服务器访问，`server/uploads/` 需要写权限。两个端点默认无鉴权，生产环境请自行加入登录态、CSRF、限流、配额及 HTML 净化。WYSIWYG 默认通过 `klock-editor-wysiwyg.js` 延迟加载。任务列表、表格、脚注、数学公式和原始 HTML 等不可逆扩展会阻止切换并保留源码模式。HTML 富文本双模式的最后版本是 [v1.0.2](https://github.com/KlockTX/KlockEditor/releases/tag/v1.0.2)。

预览优先级为 `previewFn → previewUrl → 内置 miniMarkdown`；`previewFn` 和服务端返回的 HTML 必须已经过可信净化。上传优先级为 `uploadFn → uploadUrl`。

### 配置项

| 选项 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `content` | string | `''` | 初始内容（Markdown 文本） |
| `placeholder` | string | 内置 | Markdown 编辑区占位文案 |
| `height` | number | `400` | 编辑区最小高度（px） |
| `theme` | string | 自动 | `'dark'` / `'light'`，缺省跟随系统 |
| `statusBar` | boolean | `true` | 设为 `false` 隐藏底部字数统计状态栏 |
| `editorMode` | string | `'source'` | `'source'` 或 `'wysiwyg'`；WYSIWYG 只支持可逆 Markdown 子集 |
| `wysiwygUrl` | string | `'klock-editor-wysiwyg.js'` | 自包含 WYSIWYG bundle 地址 |
| `previewUrl` | string | — | 服务端预览端点 |
| `previewFn` | function | — | 客户端渲染函数 `(md) => html`（优先于 previewUrl） |
| `uploadUrl` | string | — | 图片上传端点 |
| `uploadFn` | function | — | 自定义上传 `(file) => Promise<url>`（优先于 uploadUrl） |
| `csrfToken` | string | — | 附加到预览/上传请求的 CSRF 令牌 |
| `onChange` | function | — | `(content)` 内容变化回调 |
| `onSave` | function | — | `(content)` Ctrl/Cmd+S 回调 |

### 实例 API

| 方法 | 返回 | 说明 |
|---|---|---|
| `getContent()` | string | 当前 Markdown 文本 |
| `setContent(v)` | — | 设置内容、刷新预览并触发 `onChange` |
| `getEditorMode()` | string | `'source'` 或 `'wysiwyg'` |
| `setEditorMode(mode)` | — | 切换源码 / Markdown 原生 WYSIWYG；无法可逆的扩展语法会拒绝切换 |
| `focus()` | — | 聚焦编辑区 |
| `destroy()` | — | 移除 DOM 与所有事件监听 |

### 主题定制

```css
.klock-editor-root {
  --klock-primary: #e11d48;      /* 主色 */
  --klock-radius-md: 4px;        /* 圆角 */
  --klock-glass-blur: 0px;       /* 玻璃模糊（0 = 关闭） */
  --klock-font-mono: "JetBrains Mono", monospace;
}
```

### 许可证

- 本项目（klock-editor.js / klock-editor.css / demo.html / server 端点）采用 **MIT** 协议，版权所有 © 2026 KlockTX。全文见 [LICENSE](LICENSE)。
- `server/lib/` 内的 Parsedown 与 ParsedownExtended 为第三方组件，同样采用 **MIT** 协议，版权归其原作者所有，许可全文分别见 [Parsedown-LICENSE.txt](server/lib/Parsedown-LICENSE.txt) 与 [ParsedownExtended-LICENSE.txt](server/lib/ParsedownExtended-LICENSE.txt)。
- MIT 意味着：你可以自由使用、修改、分发本组件（含闭源商用），仅需保留版权声明与许可全文。

---

## English

### Introduction

KlockEditor is a standalone Markdown editor with **source editing, Markdown-native WYSIWYG, split view, and live preview**. v3.0.0 uses a ProseMirror document tree internally, but the public input, saved content, callbacks, and API remain Markdown strings. This is not the old HTML rich-text mode; use v1.0.2 for that historical behavior.

### Features

- **Markdown-only**: textarea selection manipulation + 300ms debounced live preview; toolbar edits are undoable (`Ctrl+Z` works)
- **Editing feel**: Enter continues lists/quotes (ordered lists auto-number), task lists `- [ ]`, strikethrough `~~ ~~`, paste-URL-over-selection makes a link
- **State awareness**: toolbar buttons highlight at the cursor; status bar shows live char/word/line counts
- **Live preview**: pluggable renderer chain (custom function → server endpoint → built-in mini renderer, with automatic fallback)
- **Image upload**: drag-and-drop, paste, and toolbar; inserted at the cursor automatically
- **Three view states**: edit-only / split / preview-only, plus fullscreen (Esc to exit)
- **Shortcuts**: `Ctrl/Cmd+B` bold · `Ctrl/Cmd+I` italic · `Ctrl/Cmd+K` link · `Ctrl/Cmd+S` save · `Tab` indent
- **Auto dark mode**: follows the system `prefers-color-scheme`; force via the `theme` option or `data-theme` attribute
- **Themeable**: everything is driven by `--klock-*` CSS variables scoped to `.klock-editor-root`
- **UMD export**: works as `window.KlockEditor` and under CommonJS
- **Inline icons**: toolbar icons are inline SVG — no icon font, no icon library
- **TypeScript**: ships `klock-editor.d.ts`, covering both CommonJS imports and the `window.KlockEditor` global
- **Unit tests**: `npm test` (zero-dependency Node assertions covering mini-renderer syntax and XSS blocking)

### Directory Layout

```
KlockEditor/
├── klock-editor.js        Core script (the only required file)
├── klock-editor.css       Companion styles (the only required file)
├── klock-editor.d.ts      TypeScript declarations
├── demo.html              Demo page (double-click for offline experience)
├── package.json           npm metadata and test script
├── test/                  Zero-dependency unit tests (npm test)
├── CHANGELOG.md           Changelog
├── LICENSE                Full MIT text
└── server/                Optional PHP backend
    ├── preview.php          Markdown preview rendering endpoint
    ├── upload.php           Image upload endpoint
    └── lib/                 Parsedown / ParsedownExtended (MIT third-party libs)
```

### Quick Start

**1. Frontend-only (no backend, built-in mini renderer)**

```html
<link rel="stylesheet" href="klock-editor.css">
<div id="editor"></div>
<script src="klock-editor.js"></script>
<script>
  var editor = KlockEditor.create(document.getElementById('editor'), {
    content: '# Hello',          // initial content
    onChange: function (content) { /* content changed */ },
    onSave:   function () { /* Ctrl/Cmd+S */ }
  });
</script>
```

**2. With the PHP backend (preview & upload)**

```js
var editor = KlockEditor.create(document.getElementById('editor'), {
  previewUrl: 'server/preview.php',   // POST {content} → {success, html}
  uploadUrl:  'server/upload.php'     // POST FormData{file} → {success, url}
});
```

### Distribution choices

v2.x ships two ZIP distributions with the same frontend API. Full is **not** the old HTML rich-text mode:

| Distribution | Contents | Use case |
|---|---|---|
| **Editor-only** | JS/CSS/TypeScript declarations, ProseMirror WYSIWYG bundle, safe built-in fallback renderer, offline demo, docs | Static sites and frontend projects without PHP |
| **Full** | Everything in Editor-only plus `server/preview.php`, `server/upload.php`, Parsedown and licenses | PHP server-side Markdown rendering and image uploads |

Build with `npm run package:editor`, `npm run package:full`, or `npm run package`. Editor-only contains no PHP. Full requires a PHP web server and a writable `server/uploads/` directory. Both endpoints are unauthenticated by default; production deployments must add authentication, CSRF, rate limiting, quotas, and HTML sanitization. The last HTML dual-mode release is [v1.0.2](https://github.com/KlockTX/KlockEditor/releases/tag/v1.0.2).

Preview priority is `previewFn → previewUrl → built-in miniMarkdown`; `previewFn` and server-returned HTML must be trusted/sanitized. Upload priority is `uploadFn → uploadUrl`.

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `content` | string | `''` | Initial content (Markdown text) |
| `placeholder` | string | built-in | Placeholder for the Markdown pane |
| `height` | number | `400` | Minimum editor height (px) |
| `theme` | string | auto | `'dark'` / `'light'`; defaults to system |
| `statusBar` | boolean | `true` | `false` hides the bottom char/word/line status bar |
| `previewUrl` | string | — | Server-side preview endpoint |
| `previewFn` | function | — | Client-side renderer `(md) => html` (takes precedence over previewUrl) |
| `uploadUrl` | string | — | Image upload endpoint |
| `uploadFn` | function | — | Custom upload `(file) => Promise<url>` (takes precedence over uploadUrl) |
| `csrfToken` | string | — | CSRF token appended to preview/upload requests |
| `onChange` | function | — | `(content)` fired on content change |
| `onSave` | function | — | `(content)` fired on Ctrl/Cmd+S |

### Instance API

| Method | Returns | Description |
|---|---|---|
| `getContent()` | string | Current Markdown text |
| `setContent(v)` | — | Set content and refresh preview |
| `focus()` | — | Focus the editor |
| `destroy()` | — | Remove DOM and all event listeners |

### Theming

```css
.klock-editor-root {
  --klock-primary: #e11d48;      /* accent color */
  --klock-radius-md: 4px;        /* corner radius */
  --klock-glass-blur: 0px;       /* glass blur (0 = off) */
  --klock-font-mono: "JetBrains Mono", monospace;
}
```

### License

- This project (klock-editor.js / klock-editor.css / demo.html / server endpoints) is licensed under the **MIT** License, Copyright © 2026 KlockTX. See [LICENSE](LICENSE) for the full text.
- Parsedown and ParsedownExtended inside `server/lib/` are third-party components also under the **MIT** License, copyright their respective authors. License texts: [Parsedown-LICENSE.txt](server/lib/Parsedown-LICENSE.txt) and [ParsedownExtended-LICENSE.txt](server/lib/ParsedownExtended-LICENSE.txt).
- MIT means you are free to use, modify, and redistribute this component (including closed-source commercial use), as long as the copyright notice and the license text are retained.

---

© 2026 KlockTX · MIT License
