# Changelog

## 3.0.0 (2026-08-21)

### 架构

- 将 ProseMirror + `prosemirror-markdown` 构建为自包含 `klock-editor-wysiwyg.js`，Editor-only 与 Full 共用同一前端 bundle
- 新增 `src/wysiwyg-controller.js`、Markdown bridge 和 round-trip fixtures
- 新增 `THIRD-PARTY-NOTICES.txt`，列出打包进 WYSIWYG bundle 的 MIT 依赖


### Markdown 原生 WYSIWYG

- 新增 ProseMirror + `prosemirror-markdown` Markdown 原生所见即所得模式
- 新增 `editorMode: 'source' | 'wysiwyg'`、`getEditorMode()`、`setEditorMode()`；默认源码模式保持 v2 行为
- WYSIWYG 内部使用文档树/transaction/history，公共 API、表单镜像、回调和保存格式始终是 Markdown 字符串
- 支持标题、段落、粗体、斜体、删除线、代码、代码块、链接、图片、引用、有序/无序列表、分隔线
- 对任务列表、表格、脚注、数学公式、原始 HTML 等暂不完全可逆语法，切换前明确提示并保留源码模式，不静默丢失
- 新增自包含 `klock-editor-wysiwyg.js` bundle 和第三方 MIT 依赖 NOTICE

### 兼容性

- `getType()` 仍返回 `'markdown'`，`setType('html')` 仍为历史兼容 no-op；v1.0.2 仍是旧 HTML 双模式版本
- Editor-only 与 Full 发行版共用同一 WYSIWYG 前端 bundle；Full 仅增加 PHP/Parsedown 服务端适配

## 2.2.0 (2026-08-20)

### 双发行版

- 新增可重复构建的双 ZIP 发行：`KlockEditor-v2.2.0-editor.zip`（纯前端）与 `KlockEditor-v2.2.0-full.zip`（前端 + PHP Parsedown 预览/上传）
- Editor 包不含 PHP、Parsedown 或运行时上传文件；Full 包包含服务端端点、第三方解析器及许可证
- 新增 `npm run package:editor`、`npm run package:full`、`npm run package`

### 稳定性与安全

- 预览请求使用 AbortController + 请求序号，旧响应不再覆盖新内容
- `setContent()` 现在触发 `onChange`，与用户输入保持一致
- 宿主 `onChange` / `onSave` 异常被隔离并记录，不再打断编辑器事件
- Full 预览端点移除整段 `htmlspecialchars_decode()`，默认开启 Parsedown SafeMode，并限制 Markdown 请求体 2MB
- Full 上传端点改为严格扩展名/真实 MIME 图片白名单，缺少 fileinfo 时拒绝上传
- 类型声明明确 `previewFn` 必须返回已净化 HTML（可异步 Promise）

## 2.1.0 (2026-08-20)

### 新增（编辑手感六件套）

- **列表 / 引用自动续行**：回车自动继承 `- ` / `1. ` / `> ` 前缀（有序列表自动递增编号），空列表项回车退出列表；代码块内不干预，IME 组合输入期间不拦截回车
- **Markdown 工具栏状态同步**：光标位于 `**粗体**`、`*斜体*`、`~~删除线~~`、`` `代码` `` 内或标题 / 列表 / 引用行上时，对应按钮自动高亮（纯文本分析 + `selectionchange`，`destroy()` 移除监听）
- **任务列表**：`- [ ]` / `- [x]` 语法，工具栏按钮批量转换（普通列表 ⇄ 任务列表），预览区渲染只读 checkbox
- **删除线**：`~~text~~` 语法渲染 + 工具栏按钮 + `Ctrl/Cmd+Shift+X` 快捷键
- **字数统计状态栏**：底部实时显示字符 / 词 / 行数（拉丁按词、中日韩按字），`statusBar: false` 可隐藏
- **粘贴 URL 自动成链**：编辑区有选中文本时粘贴纯 URL，自动包裹为 `[选中文本](URL)`

## 2.0.0 (2026-08-20)

### 破坏性变更

- **移除 HTML 富文本模式，专注 Markdown**。KlockEditor 现在是纯 Markdown 编辑器（textarea + 分屏预览），删除了 contenteditable 编辑区、HTML 工具栏、源码模式与 Markdown/HTML 模式切换标签
- `type` 配置项与 `setType('html')` 不再生效：`setType` 保留为兼容性空操作（传非 `'markdown'` 值时在控制台输出警告），`getType()` 恒返回 `'markdown'`
- `onChange` / `onSave` 回调签名从 `(content, type)` 简化为 `(content)`
- 需要旧版双模式行为的用户请继续使用 v1.0.2

### 收益

- 核心体积缩减约 27%（js 782 → 571 行；css 517 → 440 行）
- 移除 `document.execCommand` 富文本命令路径及其跨浏览器行为差异（工具栏可撤销写入仍使用 `execCommand('insertText')`，该用法各浏览器行为一致且计入撤销栈）
- 删除 `selectionchange` document 级监听与 `queryCommandState` 状态同步逻辑

### 保留能力

- Markdown 工具栏全量命令、三视图（编辑/分屏/预览）、全屏（Esc 退出）、Tab 缩进、Ctrl/Cmd+B/I/K/S 快捷键
- 撤销栈友好写入、IME 组合输入守卫、预览三级渲染链（previewFn → previewUrl → 内置迷你渲染器，服务端失败自动回退）
- 拖拽/粘贴图片上传（uploadFn → uploadUrl）、CSRF 令牌、深色模式、CSS 变量主题化、UMD + CommonJS + TypeScript 声明、`npm test`（20 项断言）

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
