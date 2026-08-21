/*!
 * KlockEditor — 独立 Markdown 编辑器
 * KlockEditor — Standalone Markdown editor
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
 * 快速使用 / Quick start：
 *   <div id="editor"></div>
 *   <link rel="stylesheet" href="klock-editor.css">
 *   <script src="klock-editor.js"></script>
 *   <script>
 *     var editor = KlockEditor.create(document.getElementById('editor'), {
 *         content: '# 你好',
 *         previewUrl: '/server/preview.php',    // 可选：服务端渲染（POST content → {html}）
 *         uploadUrl:  '/server/upload.php',     // 可选：图片上传（POST FormData → {url}）
 *         onChange: function(content) {},       // 内容变化
 *         onSave:   function() {}               // Ctrl/Cmd+S
 *     });
 *     editor.getContent();   // 获取 Markdown 文本
 *     editor.setContent(x);  // 设置内容
 *     editor.destroy();      // 移除 DOM 与事件
 *   </script>
 *
 * v2.0.0 起为纯 Markdown 编辑器（移除 HTML 富文本模式）。
 * 预览渲染优先级：previewFn（客户端函数）> previewUrl（服务端）> 内置迷你渲染器
 * 图片上传优先级：uploadFn（自定义 Promise）> uploadUrl（服务端）> 禁用
 * 未配置 previewUrl/previewFn 时使用内置迷你 Markdown 渲染器（纯客户端，离线可用）。
 */
(function () {
    'use strict';

    var VERSION = '2.1.0';

    // ====================== 内联图标（Lucide 风格，24x24 描边） ======================

    var ICONS = {
        bold: '<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>',
        italic: '<line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/>',
        strike: '<path d="M16 4c-.5-2-2-3-4-3s-4 1-4 3c0 1.5 1 2.5 3 3"/><path d="M12 20c3.5 0 6-1.5 6-4 0-1-.5-2-2-3"/><line x1="4" x2="20" y1="14" y2="14"/>',
        checkSquare: '<path d="M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5"/><path d="m9 11 3 3L22 4"/>',
        h1: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17 12l3-2v8"/>',
        h2: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>',
        h3: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17.5 17.5c1.7 1 3.5 0 3.5-1.5a2 2 0 0 0-2-2"/>',
        quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
        code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
        list: '<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>',
        listOrdered: '<line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
        link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
        image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
        minus: '<path d="M5 12h14"/>',
        table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
        pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
        columns: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>',
        eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
        maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
        minimize: '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>',
        fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>'
    };

    function icon(name, size) {
        var s = size || 16;
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
            'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="' + s + '" height="' + s + '" aria-hidden="true">' +
            (ICONS[name] || '') + '</svg>';
    }

    // ====================== 内置极简 Toast ======================

    var toastContainer = null;
    var activeEditors = 0;
    function showToast(msg, type) {
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'klock-editor-toast-container';
            document.body.appendChild(toastContainer);
        }
        var el = document.createElement('div');
        el.className = 'klock-editor-toast klock-editor-toast-' + (type || 'info');
        el.textContent = msg;
        toastContainer.appendChild(el);
        setTimeout(function () { el.classList.add('out'); }, 2200);
        setTimeout(function () {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 2600);
    }

    // ====================== 工具函数 ======================

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    /**
     * 可撤销写入：优先 execCommand('insertText')（计入浏览器撤销栈，Ctrl+Z 可撤销），
     * 不支持时退回 setRangeText（值仍正确，但可能不进撤销栈）。
     * 直接赋 value 或仅用 setRangeText 会绕过编辑事务，工具栏操作将无法撤销。
     */
    function undoableInsert(ta, start, end, text) {
        ta.focus();
        try { ta.setSelectionRange(start, end); } catch (e) { /* 旧浏览器忽略 */ }
        var ok = false;
        try { ok = document.execCommand('insertText', false, text); } catch (e) { ok = false; }
        if (!ok) ta.setRangeText(text, start, end, 'end');
        return ok;
    }

    // ====================== 内置迷你 Markdown 渲染器（离线兜底预览） ======================
    // 覆盖常用语法：标题/粗斜体/行内码/代码块/链接/图片/引用/列表/分隔线/表格/段落。
    // 生产项目建议接 previewUrl 或 previewFn 以获得与后端一致的完整渲染。

    function miniMarkdown(src) {
        if (!src) return '';
        src = String(src).replace(/\r\n?/g, '\n');

        var codeBlocks = [];
        src = src.replace(/```([\w+-]*)\n([\s\S]*?)```/g, function (_, lang, code) {
            codeBlocks.push('<pre><code class="language-' + escapeHtml(lang) + '">' + escapeHtml(code) + '</code></pre>');
            return '\u0000CB' + (codeBlocks.length - 1) + '\u0000';
        });

        var lines = escapeHtml(src).split('\n');
        var out = [], i = 0, m;

        function safeUrl(u) {
            return /^(https?:|\/|#|mailto:)/i.test(u) ? u : '';
        }

        function inline(s) {
            return s
                .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_, alt, u) {
                    return '<img src="' + safeUrl(u) + '" alt="' + alt + '">';
                })
                .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, text, u) {
                    return '<a href="' + safeUrl(u) + '">' + text + '</a>';
                })
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                .replace(/~~([^~]+)~~/g, '<del>$1</del>');
        }

        while (i < lines.length) {
            var line = lines[i];

            var cb = line.match(/^\u0000CB(\d+)\u0000$/);
            if (cb) { out.push(codeBlocks[+cb[1]]); i++; continue; }
            if (/^\s*$/.test(line)) { i++; continue; }
            if (/^###\s+/.test(line)) { out.push('<h3>' + inline(line.replace(/^###\s+/, '')) + '</h3>'); i++; continue; }
            if (/^##\s+/.test(line)) { out.push('<h2>' + inline(line.replace(/^##\s+/, '')) + '</h2>'); i++; continue; }
            if (/^#\s+/.test(line)) { out.push('<h1>' + inline(line.replace(/^#\s+/, '')) + '</h1>'); i++; continue; }
            if (/^\s*---+\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
            if (/^&gt;\s?/.test(line)) {
                var buf = [];
                while (i < lines.length && /^&gt;\s?/.test(lines[i])) { buf.push(lines[i].replace(/^&gt;\s?/, '')); i++; }
                out.push('<blockquote><p>' + buf.map(inline).join('<br>') + '</p></blockquote>'); continue;
            }
            if ((m = line.match(/^\s*[-*]\s+(.*)$/))) {
                var items = [];
                while (i < lines.length && (m = lines[i].match(/^\s*[-*]\s+(.*)$/))) {
                    // 任务列表：- [ ] / - [x]
                    var tm = m[1].match(/^\[([ xX])\]\s+(.*)$/);
                    if (tm) {
                        items.push('<li class="klock-task"><input type="checkbox" disabled' +
                            (tm[1] !== ' ' ? ' checked' : '') + '> ' + inline(tm[2]) + '</li>');
                    } else {
                        items.push('<li>' + inline(m[1]) + '</li>');
                    }
                    i++;
                }
                out.push('<ul>' + items.join('') + '</ul>'); continue;
            }
            if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) {
                var ol = [];
                while (i < lines.length && (m = lines[i].match(/^\s*\d+[.)]\s+(.*)$/))) { ol.push('<li>' + inline(m[1]) + '</li>'); i++; }
                out.push('<ol>' + ol.join('') + '</ol>'); continue;
            }
            if (line.indexOf('|') > -1 && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])) {
                var head = line.split('|').map(function (c) { return c.trim(); }).filter(function (c, idx, a) { return !(c === '' && (idx === 0 || idx === a.length - 1)); });
                i += 2;
                var rows = [];
                while (i < lines.length && lines[i].indexOf('|') > -1 && !/^\s*$/.test(lines[i])) {
                    rows.push(lines[i].split('|').map(function (c) { return c.trim(); }).filter(function (c, idx, a) { return !(c === '' && (idx === 0 || idx === a.length - 1)); }));
                    i++;
                }
                var html = '<table><thead><tr>' + head.map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
                rows.forEach(function (r) {
                    html += '<tr>' + r.map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>';
                });
                out.push(html + '</tbody></table>'); continue;
            }
            var para = [line];
            i++;
            while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,3}\s|&gt;|\s*[-*]\s|\s*\d+[.)]\s|\u0000CB)/.test(lines[i])) {
                para.push(lines[i]); i++;
            }
            out.push('<p>' + inline(para.join('<br>')) + '</p>');
        }
        return out.join('\n');
    }

    // ====================== 工厂 ======================

    var uid = 0;

    function create(container, options) {
        if (!container) throw new Error('KlockEditor.create: container is required');
        var opts = options || {};
        activeEditors++;

        var id = 'klocke' + (++uid);
        var previewTimer = null;
        var lastPreview = null;
        var destroyed = false;

        // ---------- DOM 构建 ----------

        var root = document.createElement('div');
        root.className = 'klock-editor-root';
        root.innerHTML =
            '<div class="klock-editor-wrap klocke-md">' +
            '  <div class="klock-editor-toolbar">' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="bold" title="粗体 (Ctrl+B)">' + icon('bold') + '</button>' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="italic" title="斜体 (Ctrl+I)">' + icon('italic') + '</button>' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="strike" title="删除线 (Ctrl+Shift+X)">' + icon('strike') + '</button>' +
            '    <span class="klock-editor-divider"></span>' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="h1" title="一级标题">' + icon('h1') + '</button>' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="h2" title="二级标题">' + icon('h2') + '</button>' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="h3" title="三级标题">' + icon('h3') + '</button>' +
            '    <span class="klock-editor-divider"></span>' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="link" title="链接 (Ctrl+K)">' + icon('link') + '</button>' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="image" title="图片">' + icon('image') + '</button>' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="code" title="代码块">' + icon('code') + '</button>' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="quote" title="引用">' + icon('quote') + '</button>' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="ul" title="无序列表">' + icon('list') + '</button>' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="ol" title="有序列表">' + icon('listOrdered') + '</button>' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="task" title="任务列表">' + icon('checkSquare') + '</button>' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="hr" title="分隔线">' + icon('minus') + '</button>' +
            '    <button type="button" class="klock-editor-btn" data-md-btn="table" title="表格">' + icon('table') + '</button>' +
            '    <span class="klock-editor-divider"></span>' +
            '    <button type="button" class="klock-editor-btn" data-md-view="edit" title="仅编辑">' + icon('pencil') + '</button>' +
            '    <button type="button" class="klock-editor-btn active" data-md-view="split" title="分屏">' + icon('columns') + '</button>' +
            '    <button type="button" class="klock-editor-btn" data-md-view="preview" title="仅预览">' + icon('eye') + '</button>' +
            '    <button type="button" class="klock-editor-btn" data-md-fullscreen title="全屏">' + icon('maximize') + '</button>' +
            '  </div>' +
            '  <div class="klock-editor-body split">' +
            '    <div class="klock-editor-pane"><textarea class="klock-editor-textarea" name="klock_editor_markdown" aria-label="Markdown 编辑区" placeholder="' + escapeHtml(opts.placeholder || '在此输入 Markdown 正文... 支持拖拽/粘贴图片上传') + '"></textarea></div>' +
            '    <div class="klock-editor-pane"><div class="klock-editor-preview klock-markdown"><div class="klock-editor-muted">实时预览区...</div></div></div>' +
            '  </div>' +
            '  <div class="klock-editor-status">' +
            '    <span class="klocke-stat-chars">0 字符</span>' +
            '    <span class="klocke-stat-words">0 词</span>' +
            '    <span class="klocke-stat-lines">1 行</span>' +
            '  </div>' +
            '</div>';

        container.appendChild(root);

        var mdWrap = root.querySelector('.klocke-md');
        var textarea = root.querySelector('.klock-editor-textarea');
        var preview = root.querySelector('.klock-editor-preview');
        var mdBody = root.querySelector('.klock-editor-body');
        var statusBar = root.querySelector('.klock-editor-status');
        var statChars = root.querySelector('.klocke-stat-chars');
        var statWords = root.querySelector('.klocke-stat-words');
        var statLines = root.querySelector('.klocke-stat-lines');

        if (opts.statusBar === false) statusBar.style.display = 'none';

        if (opts.height) {
            mdBody.style.minHeight = opts.height + 'px';
        }
        if (opts.theme === 'dark' || opts.theme === 'light') {
            root.setAttribute('data-theme', opts.theme);
        }

        // ---------- 预览 ----------

        function renderPreview(content) {
            if (typeof opts.previewFn === 'function') {
                preview.innerHTML = opts.previewFn(content) || '';
                return;
            }
            if (opts.previewUrl) {
                var fd = new FormData();
                fd.append('content', content);
                if (opts.csrfToken) fd.append('csrf_token', opts.csrfToken);
                fetch(opts.previewUrl, {
                    method: 'POST',
                    body: fd,
                    credentials: 'same-origin',
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                }).then(function (r) {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.json();
                }).then(function (j) {
                    if (destroyed) return;
                    preview.innerHTML = (j && j.html) ? j.html : miniMarkdown(content);
                }).catch(function () {
                    // 服务端不可用或响应异常时回退内置渲染器，保证离线可用
                    if (!destroyed) preview.innerHTML = miniMarkdown(content);
                });
                return;
            }
            preview.innerHTML = miniMarkdown(content);
        }

        // ---------- 统计 / 工具栏状态 ----------

        function updateStats() {
            if (!statChars) return;
            var v = textarea.value;
            // 词数 = 拉丁词 + CJK 字（中日韩表意文字与假名按字计）
            var words = (v.match(/[A-Za-z0-9_'’-]+/g) || []).length +
                (v.match(/[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7af]/g) || []).length;
            statChars.textContent = v.length + ' 字符';
            statWords.textContent = words + ' 词';
            statLines.textContent = (v ? v.split('\n').length : 1) + ' 行';
        }

        // 光标所在位置推断 Markdown 语法状态，同步工具栏按钮高亮
        // 行内标记（**/*/~~/`）用「光标前出现奇数次即在内」的启发式判断
        function syncMdToolbarState() {
            if (destroyed) return;
            var pos = textarea.selectionStart;
            var before = textarea.value.slice(0, pos);
            var lineStart = before.lastIndexOf('\n') + 1;
            var nl = textarea.value.indexOf('\n', lineStart);
            var lineText = textarea.value.slice(lineStart, nl === -1 ? textarea.value.length : nl);
            var states = {
                bold: ((before.split('**').length - 1) % 2) === 1,
                italic: ((before.replace(/\*\*/g, '').split('*').length - 1) % 2) === 1,
                strike: ((before.split('~~').length - 1) % 2) === 1,
                code: ((before.split('`').length - 1) % 2) === 1,
                h1: /^#(?!#)\s/.test(lineText),
                h2: /^##(?!#)\s/.test(lineText),
                h3: /^###\s/.test(lineText),
                quote: /^\s*>/.test(lineText),
                ul: /^\s*[-*+]\s/.test(lineText),
                ol: /^\s*\d+[.)]\s/.test(lineText),
                task: /^\s*[-*+]\s\[[ xX]\]\s/.test(lineText)
            };
            root.querySelectorAll('[data-md-btn]').forEach(function (b) {
                if (b.dataset.mdBtn in states) b.classList.toggle('active', !!states[b.dataset.mdBtn]);
            });
        }

        function triggerPreview(force) {
            updateStats();
            syncMdToolbarState();
            var content = textarea.value;
            if (!force && content === lastPreview) return;
            lastPreview = content;
            if (previewTimer) clearTimeout(previewTimer);
            previewTimer = setTimeout(function () {
                if (destroyed) return;
                if (!textarea.value.trim()) {
                    preview.innerHTML = '<div class="klock-editor-muted">实时预览区...</div>';
                    return;
                }
                renderPreview(textarea.value);
            }, 300);
        }

        // ---------- Markdown 选区工具 ----------

        function getSel() {
            return {
                start: textarea.selectionStart,
                end: textarea.selectionEnd,
                value: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
            };
        }

        function setSel(start, end) {
            textarea.focus();
            try { textarea.setSelectionRange(start, end); } catch (e) { /* 旧浏览器忽略 */ }
        }

        function wrap(before, after) {
            var s = getSel();
            var v = s.value || '文本';
            undoableInsert(textarea, s.start, s.end, before + v + after);
            setSel(s.start + before.length, s.start + before.length + v.length);
            triggerPreview();
            fireChange();
        }

        function prefix(p) {
            var s = getSel();
            var ls = textarea.value.lastIndexOf('\n', s.start - 1) + 1;
            undoableInsert(textarea, ls, ls, p);
            setSel(s.start + p.length, s.end + p.length);
            triggerPreview();
            fireChange();
        }

        function prefixLines(make) {
            var s = getSel();
            var ls = textarea.value.lastIndexOf('\n', s.start - 1) + 1;
            var le = textarea.value.indexOf('\n', s.end);
            if (le === -1) le = textarea.value.length;
            var out = textarea.value.substring(ls, le).split('\n')
                .map(function (line, i) { return make(i) + line; }).join('\n');
            undoableInsert(textarea, ls, le, out);
            setSel(ls, ls + out.length);
            triggerPreview();
            fireChange();
        }

        function insert(text) {
            var s = getSel();
            undoableInsert(textarea, s.start, s.end, text);
            setSel(s.start + text.length, s.start + text.length);
            triggerPreview();
            fireChange();
        }

        function mdCommand(cmd) {
            switch (cmd) {
                case 'bold': wrap('**', '**'); break;
                case 'italic': wrap('*', '*'); break;
                case 'strike': wrap('~~', '~~'); break;
                case 'h1': prefix('# '); break;
                case 'h2': prefix('## '); break;
                case 'h3': prefix('### '); break;
                case 'code': wrap('\n```\n', '\n```\n'); break;
                case 'quote': prefix('> '); break;
                case 'ul': prefixLines(function () { return '- '; }); break;
                case 'ol': prefixLines(function (i) { return (i + 1) + '. '; }); break;
                case 'task': toggleTask(); break;
                case 'hr': insert('\n---\n'); break;
                case 'table': insert('\n| 列1 | 列2 |\n|---|---|\n| 内容 | 内容 |\n'); break;
                case 'link': {
                    var url = prompt('请输入链接 URL：', 'https://');
                    if (url) wrap('[', '](' + url + ')');
                    break;
                }
                case 'image': {
                    var img = prompt('请输入图片 URL（留空可拖拽/粘贴上传）：', '');
                    if (img) insert('![图片](' + img + ')');
                    break;
                }
            }
        }

        // ---------- 列表 / 引用自动续行 ----------
        // Enter 继承当前行的列表/引用前缀；空列表项回车退出列表；代码块内不干预

        function handleEnterContinuation() {
            var s = getSel();
            if (s.start !== s.end) return false;
            // 代码块内（光标前 ``` 出现奇数次）不续行
            if (((textarea.value.slice(0, s.start).match(/```/g) || []).length % 2) === 1) return false;
            var ls = textarea.value.lastIndexOf('\n', s.start - 1) + 1;
            var line = textarea.value.slice(ls, s.start);
            var m = line.match(/^(\s*)([-*+]\s(?:\[[ xX]\]\s)?|\d+[.)]\s|>\s?)([\s\S]*)$/);
            if (!m) return false;
            if (m[3].trim() === '') {
                // 空列表项 / 空引用：删除前缀，退出该结构
                undoableInsert(textarea, ls, s.start, '');
                triggerPreview();
                fireChange();
                return true;
            }
            var next;
            var om = m[2].match(/^(\d+)([.)])\s$/);
            if (om) next = (parseInt(om[1], 10) + 1) + om[2] + ' ';
            else if (m[2] === '>' || m[2] === '> ') next = '> ';
            else {
                var tm = m[2].match(/^([-*+])\s(\[[ xX]\]\s)$/);
                next = tm ? tm[1] + ' [ ] ' : m[2];
            }
            undoableInsert(textarea, s.start, s.end, '\n' + m[1] + next);
            triggerPreview();
            fireChange();
            return true;
        }

        // ---------- 任务列表 ----------

        function toggleTask() {
            var s = getSel();
            var ls = textarea.value.lastIndexOf('\n', s.start - 1) + 1;
            var le = textarea.value.indexOf('\n', s.end);
            if (le === -1) le = textarea.value.length;
            var out = textarea.value.slice(ls, le).split('\n').map(function (line) {
                var m = line.match(/^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$/);
                var indent = m ? m[1] : '';
                var content = m ? m[2] : line;
                var tm = content.match(/^\[[ xX]\]\s+(.*)$/);
                if (tm) return indent + '- ' + tm[1];          // 已是任务 → 还原为普通列表
                return indent + '- [ ] ' + content;             // 普通行 → 转为任务
            }).join('\n');
            undoableInsert(textarea, ls, le, out);
            setSel(ls, ls + out.length);
            triggerPreview();
            fireChange();
        }

        // ---------- 视图模式 / 全屏 ----------

        function setViewMode(mode) {
            mdBody.classList.remove('split', 'preview-only');
            if (mode === 'split') mdBody.classList.add('split');
            else if (mode === 'preview') mdBody.classList.add('preview-only');
            mdWrap.querySelectorAll('[data-md-view]').forEach(function (b) {
                b.classList.toggle('active', b.dataset.mdView === mode);
            });
            if (mode !== 'edit') triggerPreview(true);
        }

        function toggleFullscreen() {
            mdWrap.classList.toggle('is-fullscreen');
            var i = mdWrap.querySelector('[data-md-fullscreen] svg');
            if (i) {
                var fs = mdWrap.classList.contains('is-fullscreen');
                i.innerHTML = fs ? ICONS.minimize : ICONS.maximize;
            }
        }

        // ---------- 上传 ----------

        function uploadFile(file) {
            if (!file || !/^image\//.test(file.type || '')) return;
            var doUpload = null;
            if (typeof opts.uploadFn === 'function') doUpload = opts.uploadFn;
            else if (opts.uploadUrl) {
                doUpload = function (f) {
                    return new Promise(function (resolve, reject) {
                        var fd = new FormData();
                        fd.append('file', f);
                        if (opts.csrfToken) fd.append('csrf_token', opts.csrfToken);
                        var xhr = new XMLHttpRequest();
                        xhr.open('POST', opts.uploadUrl, true);
                        xhr.withCredentials = true;
                        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                        xhr.onload = function () {
                            try {
                                var j = JSON.parse(xhr.responseText);
                                if (j && j.success && j.url) resolve(j.url);
                                else reject(new Error((j && j.message) || '上传失败'));
                            } catch (e) { reject(new Error('响应解析失败')); }
                        };
                        xhr.onerror = function () { reject(new Error('网络错误')); };
                        xhr.send(fd);
                    });
                };
            }
            if (!doUpload) { showToast('未配置上传接口（uploadUrl / uploadFn）', 'info'); return; }
            showToast('上传图片中...', 'info');
            doUpload(file).then(function (url) {
                if (destroyed) return;
                insert('\n![图片](' + url + ')\n');
                showToast('图片已插入', 'success');
            }).catch(function (err) {
                showToast((err && err.message) || '上传失败', 'error');
            });
        }

        function bindUploadDnd(el) {
            el.addEventListener('dragover', function (e) { e.preventDefault(); });
            el.addEventListener('drop', function (e) {
                if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
                e.preventDefault();
                Array.prototype.slice.call(e.dataTransfer.files).forEach(uploadFile);
            });
            el.addEventListener('paste', function (e) {
                if (!e.clipboardData) return;
                // 图片文件 → 上传
                if (e.clipboardData.items) {
                    for (var i = 0; i < e.clipboardData.items.length; i++) {
                        var item = e.clipboardData.items[i];
                        if (item.kind === 'file' && /^image\//.test(item.type)) {
                            var f = item.getAsFile();
                            if (f) { e.preventDefault(); uploadFile(f); return; }
                        }
                    }
                }
                // 粘贴纯 URL 且编辑区有选区 → 自动包裹为 [选中文本](URL)
                var s = getSel();
                if (!s.value) return;
                var text = e.clipboardData.getData('text/plain');
                if (text && /^https?:\/\/\S+$/i.test(text.trim())) {
                    e.preventDefault();
                    insert('[' + s.value + '](' + text.trim() + ')');
                }
            });
        }

        // ---------- 变更回调 ----------

        function fireChange() {
            if (typeof opts.onChange === 'function') opts.onChange(textarea.value);
        }

        function fireSave() {
            if (typeof opts.onSave === 'function') opts.onSave(textarea.value);
        }

        // ---------- 事件绑定 ----------

        root.addEventListener('click', function (e) {
            var btn = e.target.closest('button');
            if (!btn) return;
            if (btn.dataset.mdBtn) { mdCommand(btn.dataset.mdBtn); return; }
            if (btn.dataset.mdView) { setViewMode(btn.dataset.mdView); return; }
            if (btn.hasAttribute('data-md-fullscreen')) { toggleFullscreen(); return; }
        });

        root.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mdWrap.classList.contains('is-fullscreen')) toggleFullscreen();
        });

        function handleMdKeys(e) {
            // IME 组合输入期间不拦截任何按键（Enter 确认候选词等）
            if (e.isComposing || e.keyCode === 229) return;
            if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
                if (handleEnterContinuation()) { e.preventDefault(); return; }
            }
            if (e.key === 'Tab') { e.preventDefault(); insert('    '); return; }
            if (!(e.ctrlKey || e.metaKey)) return;
            var k = e.key.toLowerCase();
            if (k === 'b') { e.preventDefault(); mdCommand('bold'); }
            else if (k === 'i') { e.preventDefault(); mdCommand('italic'); }
            else if (k === 'x' && e.shiftKey) { e.preventDefault(); mdCommand('strike'); }
            else if (k === 'k') { e.preventDefault(); mdCommand('link'); }
            else if (k === 's') { e.preventDefault(); fireSave(); }
        }

        // ---------- IME 组合输入守卫：拼音/假名组词期间不触发 onChange 与预览 ----------
        // Safari 的 input 先于 compositionend 触发（被守卫拦下），故 end 时补触发一次；
        // Chrome 随后的 input 会再触发一次相同内容，双发无害（预览有 300ms 防抖）。
        var composing = false;
        textarea.addEventListener('compositionstart', function () { composing = true; });
        textarea.addEventListener('compositionend', function () {
            composing = false;
            triggerPreview();
            fireChange();
        });
        textarea.addEventListener('input', function () {
            if (composing) return;
            triggerPreview();
            fireChange();
        });

        textarea.addEventListener('keydown', handleMdKeys);
        bindUploadDnd(textarea);

        // 光标移动（无输入）时同步工具栏状态
        function onDocSelectionChange() {
            if (destroyed || document.activeElement !== textarea) return;
            syncMdToolbarState();
        }
        document.addEventListener('selectionchange', onDocSelectionChange);

        // ---------- 初始化内容 ----------

        if (opts.content) textarea.value = opts.content;
        triggerPreview(true);

        // ---------- 实例 API ----------

        return {
            getContent: function () { return textarea.value; },
            setContent: function (v) {
                textarea.value = v || '';
                triggerPreview(true);
            },
            getType: function () { return 'markdown'; },
            // v2.0.0 起为纯 Markdown 编辑器；setType 保留为兼容性空操作
            setType: function (t) {
                if (t !== 'markdown' && typeof console !== 'undefined' && console.warn) {
                    console.warn('KlockEditor v2: HTML rich-text mode was removed; setType("' + t + '") is a no-op.');
                }
            },
            focus: function () { textarea.focus(); },
            destroy: function () {
                destroyed = true;
                activeEditors--;
                document.removeEventListener('selectionchange', onDocSelectionChange);
                if (previewTimer) clearTimeout(previewTimer);
                if (root.parentNode) root.parentNode.removeChild(root);
                if (activeEditors === 0 && toastContainer && toastContainer.parentNode) {
                    toastContainer.parentNode.removeChild(toastContainer);
                    toastContainer = null;
                }
            }
        };
    }

    // UMD 风格导出（浏览器全局 + CommonJS）
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { create: create, miniMarkdown: miniMarkdown, VERSION: VERSION };
    } else {
        window.KlockEditor = { create: create, miniMarkdown: miniMarkdown, VERSION: VERSION };
    }
})();
