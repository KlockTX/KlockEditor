# KlockEditor

**独立 Markdown 编辑器 · 分屏实时预览 · 零依赖**

**Standalone Markdown editor · Split live preview · Zero dependencies**

---

## 中文

### 简介

KlockEditor 是一个独立的 Markdown 编辑器组件，提供 **分屏编辑与实时预览**，不依赖任何第三方框架（无 jQuery / Lucide / React），两个文件即可集成。（v2.0.0 起专注 Markdown，此前的 HTML 富文本模式已移除，需要双模式请用 v1.0.2）

### 特性

- **纯 Markdown**：textarea 选区操作 + 300ms 防抖实时预览，工具栏写入可撤销（`Ctrl+Z` 有效）
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

### 配置项

| 选项 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `content` | string | `''` | 初始内容（Markdown 文本） |
| `placeholder` | string | 内置 | Markdown 编辑区占位文案 |
| `height` | number | `400` | 编辑区最小高度（px） |
| `theme` | string | 自动 | `'dark'` / `'light'`，缺省跟随系统 |
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
| `setContent(v)` | — | 设置内容并刷新预览 |
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

KlockEditor is a standalone Markdown editor component with **split-pane editing and live preview**, zero third-party framework dependencies (no jQuery / Lucide / React). Two files are all you need. (v2.0.0 is Markdown-only; the HTML rich-text mode was removed — use v1.0.2 if you need it.)

### Features

- **Markdown-only**: textarea selection manipulation + 300ms debounced live preview; toolbar edits are undoable (`Ctrl+Z` works)
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

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `content` | string | `''` | Initial content (Markdown text) |
| `placeholder` | string | built-in | Placeholder for the Markdown pane |
| `height` | number | `400` | Minimum editor height (px) |
| `theme` | string | auto | `'dark'` / `'light'`; defaults to system |
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
