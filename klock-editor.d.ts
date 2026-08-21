/**
 * KlockEditor TypeScript 类型声明
 * KlockEditor — Standalone Markdown editor
 * © 2026 KlockTX · MIT
 */

export type KlockEditorMode = 'source' | 'wysiwyg';

export interface KlockEditorOptions {
    /** 初始内容（Markdown 文本） */
    content?: string;
    /** Markdown 编辑区占位文案 */
    placeholder?: string;
    /** 编辑区最小高度（px），默认 400 */
    height?: number;
    /** 'dark' / 'light'，缺省跟随系统 */
    theme?: 'dark' | 'light';
    /** 设为 false 隐藏底部字数统计状态栏，默认显示 */
    statusBar?: boolean;
    /** 编辑表面：源码 textarea（默认）或 Markdown 原生所见即所得 */
    editorMode?: KlockEditorMode;
    /** WYSIWYG 自包含 bundle 地址，默认 klock-editor-wysiwyg.js */
    wysiwygUrl?: string;
    /** 自定义预览函数；返回已净化 HTML 或 Promise<string>。不可信 HTML 必须由调用方净化。 */
    previewFn?: (markdown: string) => string | Promise<string>;
    /** 服务端预览端点：POST {content} → {success, html} */
    previewUrl?: string;
    /** 图片上传端点：POST FormData{file} → {success, url} */
    uploadUrl?: string;
    /** 自定义上传 (file) => Promise<url>，优先于 uploadUrl */
    uploadFn?: (file: File) => Promise<string>;
    /** 附加到预览/上传请求的 CSRF 令牌 */
    csrfToken?: string;
    /** 内容变化回调 */
    onChange?: (content: string) => void;
    /** Ctrl/Cmd+S 回调 */
    onSave?: (content: string) => void;
}

export interface KlockEditorInstance {
    /** 当前 Markdown 文本 */
    getContent(): string;
    /** 设置内容并刷新预览 */
    setContent(value: string): void;
    /** 恒返回 'markdown'（v2.0.0 起为纯 Markdown 编辑器） */
    getType(): 'markdown';
    /** 当前编辑表面 */
    getEditorMode(): KlockEditorMode;
    /** 切换 source / Markdown-native WYSIWYG */
    setEditorMode(mode: KlockEditorMode): void;
    /** v2.0.0 起为兼容性空操作（HTML 富文本模式已移除） */
    setType(type: 'markdown'): void;
    /** 聚焦编辑区 */
    focus(): void;
    /** 移除 DOM 与所有事件监听 */
    destroy(): void;
}

/** 创建编辑器实例 */
export function create(container: HTMLElement, options?: KlockEditorOptions): KlockEditorInstance;

/** 内置迷你 Markdown 渲染器（离线兜底预览用） */
export function miniMarkdown(source: string): string;

/** 当前版本号 */
export const VERSION: string;

declare global {
    interface Window {
        KlockEditor: {
            create: typeof create;
            miniMarkdown: typeof miniMarkdown;
            VERSION: typeof VERSION;
        };
    }
}
