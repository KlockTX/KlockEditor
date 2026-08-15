# 官网设计文档（KlockEditor Official Website）

日期：2026-08-16 · 状态：已批准

## 目标

为 KlockEditor 构建一个多页原生静态官网：详细介绍产品、提供完整开发文档、内嵌真实编辑器供访客直接体验。风格为扁平风混合 Fluent UI，中英双语。

## 范围

- 新建 `官网/` 目录（与 `server/` 平级），纯 HTML/CSS/JS，零构建、零依赖，双击即可打开。
- 复制 `klock-editor.js` / `klock-editor.css` 到 `官网/vendor/`，官网完全自包含、离线可用。
- 中英双语切换：`data-i18n` 字典 + localStorage 记忆，默认跟随浏览器语言。
- 主题：浅/深色跟随系统（`prefers-color-scheme`），切换按钮可强制。

## 信息架构

```
官网/
├── index.html              落地页：Hero + 特性 + 模式演示 + 代码示例 + 许可
├── playground.html         体验页：内嵌真实编辑器
├── docs.html               文档首页（导航网格）
├── docs/
│   ├── quickstart.html     快速开始（零后端 / PHP 接入）
│   ├── config.html         配置项参考
│   ├── api.html            实例 API 参考
│   ├── theming.html        主题定制
│   └── server.html         服务端部署
├── assets/
│   ├── css/site.css        共用样式
│   ├── js/site.js          导航、主题、语言切换
│   └── js/i18n.js          双语字典
└── vendor/
    ├── klock-editor.js
    └── klock-editor.css
```

## 视觉规范（扁平 × Fluent UI）

- 色板：Fluent 中性灰层级——页面底 `#f3f2f1`、卡片 `#ffffff`、正文 `#323130`、次要文字 `#605e5c`；品牌强调色 `#e11d48`（玫瑰红，与组件默认主色一致），辅助色 Fluent 蓝 `#0f6cbd`。深色模式对应 `#1b1a19` 底 / `#252423` 卡 / `#f3f2f1` 正文。
- 字体栈：`Segoe UI, "Segoe UI Variable", system-ui, sans-serif`；代码 `Cascadia Code, Consolas, monospace`。
- 元素：扁平卡片（无重阴影）、4px 圆角、1px 分割线、hover 浅色填充、active 按压反馈。
- 组件：固定顶部导航（logo + 链接 + 语言/主题切换）、文档页左侧目录侧边栏、深色代码块带复制按钮、键盘快捷键 badge。

## 页面设计

### index.html（落地页）
- Hero：项目名 + 一句话标语（中英）+ 双 CTA（立即体验 / 阅读文档）+ 简洁产品视觉
- 特性区：6 张卡片（双模式 / 实时预览 / 图片上传 / 视图三态 / 快捷键 / 自动深色主题）
- 模式演示：内嵌真实编辑器实例（Markdown 分屏），访客可实际输入
- 代码示例：两段（纯前端接入 / PHP 接入），带复制按钮
- 许可与页脚：MIT、GitHub 链接

### playground.html（体验页）
- 内嵌真实编辑器实例（复制自 `vendor/`）
- 控制条：模式切换（markdown/html）、主题切换（浅/深/自动）
- 内容回显：实时 JSON 显示 `getContent()` / `getType()`
- 可直接复制的初始化代码

### docs/ 各页
- 共用左侧目录侧边栏（当前页高亮，站内链接）
- quickstart：两套接入方式，逐步代码
- config：配置项表格（与 README 一致）
- api：实例 API 表格 + 示例
- theming：CSS 变量说明 + 定制示例
- server：PHP 部署说明（preview/upload 端点契约）
- 代码块深色主题 + 复制按钮

## 技术要点

- 页面间共享 header/footer：每页静态 HTML 内联相同结构（无构建，不做模板注入），样式集中 `site.css`。
- 双语：`data-i18n="key"` 的节点由 `i18n.js` 切换；文档正文用 `data-lang="zh"/"en"` 块切换；语言偏好存 `localStorage('klock-lang')`，缺省 `navigator.language`。
- 主题：`data-theme` 属性于 `<html>`，三态（light/dark/auto），auto 跟随系统，存 `localStorage('klock-theme')`。
- 体验页初始化代码与落地页模式演示共用 `assets/js/site.js` 中的 helper。
- 无障碍：语义化标签、键盘可操作、`aria-label`、`prefers-reduced-motion`。

## 非目标

- 不做构建工具、不做服务端渲染、不上线部署（静态托管由用户自行选择）。
- 不改动项目根目录现有文件（仅复制 vendor）。
- 不做站点搜索、不做版本化文档。
