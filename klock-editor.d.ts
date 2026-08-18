/**
 * KlockEditor TypeScript 类型声明
 * KlockEditor — Standalone dual-mode editor (Markdown + HTML rich text)
 * © 2026 KlockTX · MIT
 */

export type KlockEditorType = 'markdown' | 'html';

export interface KlockEditorOptions {
    /** 初始模式，默认 'markdown' */
    type?: KlockEditorType;
    /** 初始内容（Markdown 文本或 HTML） */
    content?: string;
    /** Markdown 编辑区占位文案 */
    placeholder?: string;
    /** 编辑区最小高度（px），默认 400 */
    height?: number;
    /** 'dark' / 'light'，缺省跟随系统 */
    theme?: 'dark' | 'light';
    /** 服务端预览端点：POST {content} → {success, html} */
    previewUrl?: string;
    /** 客户端渲染函数 (md) => html，优先于 previewUrl */
    previewFn?: (markdown: string) => string;
    /** 图片上传端点：POST FormData{file} → {success, url} */
    uploadUrl?: string;
    /** 自定义上传 (file) => Promise<url>，优先于 uploadUrl */
    uploadFn?: (file: File) => Promise<string>;
    /** 附加到预览/上传请求的 CSRF 令牌 */
    csrfToken?: string;
    /** 内容或模式变化回调 */
    onChange?: (content: string, type: KlockEditorType) => void;
    /** Ctrl/Cmd+S 回调 */
    onSave?: (content: string, type: KlockEditorType) => void;
}

export interface KlockEditorInstance {
    /** 当前内容（MD 模式返回 MD 文本，HTML 模式返回 HTML） */
    getContent(): string;
    /** 设置内容并刷新预览 */
    setContent(value: string): void;
    /** 当前模式 */
    getType(): KlockEditorType;
    /** 切换 'markdown' / 'html' */
    setType(type: KlockEditorType): void;
    /** 聚焦当前编辑区 */
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
