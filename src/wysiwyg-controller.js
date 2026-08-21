import { Schema, DOMParser as PMDOMParser } from 'prosemirror-model';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { history, undo, redo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark, setBlockType, wrapIn } from 'prosemirror-commands';
import { inputRules, smartQuotes, emDash, ellipsis } from 'prosemirror-inputrules';
import { addListNodes, wrapInList, splitListItem, liftListItem } from 'prosemirror-schema-list';
import { MarkdownParser, MarkdownSerializer, defaultMarkdownParser } from 'prosemirror-markdown';
import MarkdownIt from 'markdown-it';
import { schema as basicSchema } from 'prosemirror-schema-basic';

const nodes = addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block');
const marks = basicSchema.spec.marks.addToEnd('strike', {
  parseDOM: [{ tag: 's' }, { tag: 'del' }, { style: 'text-decoration=line-through' }],
  toDOM() { return ['del', 0]; },
});
export const schema = new Schema({ nodes, marks });

const markdownIt = new MarkdownIt('commonmark', { html: false });
markdownIt.enable(['strikethrough']);
const parserTokens = Object.assign({}, defaultMarkdownParser.tokens, {
  s: { mark: 'strike' },
  del: { mark: 'strike' },
});
export const markdownParser = new MarkdownParser(schema, markdownIt, parserTokens);

const serializerNodes = Object.assign({}, defaultMarkdownParser ? {} : {});
export const markdownSerializer = new MarkdownSerializer({
  blockquote(state, node) { state.wrapBlock('> ', null, node, () => state.renderContent(node)); },
  code_block(state, node) { state.write('```' + (node.attrs.params || '') + '\n'); state.text(node.textContent, false); state.ensureNewLine(); state.write('```'); state.closeBlock(node); },
  heading(state, node) { state.write(state.repeat('#', node.attrs.level) + ' '); state.renderInline(node, false); state.closeBlock(node); },
  horizontal_rule(state, node) { state.write('---'); state.closeBlock(node); },
  bullet_list(state, node) { state.renderList(node, '  ', () => '- '); },
  ordered_list(state, node) { const start = node.attrs.order || 1; const maxW = String(start + node.childCount - 1).length; state.renderList(node, ' '.repeat(maxW + 2), i => (start + i) + '. '); },
  list_item(state, node) { state.renderContent(node); },
  paragraph(state, node) { state.renderInline(node); state.closeBlock(node); },
  image(state, node) { state.write('![' + state.esc(node.attrs.alt || '') + '](' + state.esc(node.attrs.src || '') + (node.attrs.title ? ' "' + state.esc(node.attrs.title) + '"' : '') + ')'); },
  hard_break(state, node, parent, index) { for (let i = index + 1; i < parent.childCount; i++) if (parent.child(i).type !== node.type) { state.write('\\n'); return; } },
  text(state, node) { state.text(node.text, !state.inAutoLink); },
}, {
  em: { open: '*', close: '*', mixable: true, expelEnclosingWhitespace: true },
  strong: { open: '**', close: '**', mixable: true, expelEnclosingWhitespace: true },
  link: { open: '[', close(state, mark) { return '](' + state.esc(mark.attrs.href) + (mark.attrs.title ? ' "' + state.esc(mark.attrs.title) + '"' : '') + ')'; }, mixable: true },
  code: { open: '`', close: '`', escape: false },
  strike: { open: '~~', close: '~~', mixable: true, expelEnclosingWhitespace: true },
});

const unsupportedPatterns = [
  { pattern: /(^|\n)\[\^[^\]]+\]:/m, label: '脚注' },
  { pattern: /\$\$[\s\S]*?\$\$|(^|[^\\])\$[^$\n]+\$/m, label: '数学公式' },
  { pattern: /<\/?[A-Za-z][^>]*>/, label: '原始 HTML' },
  { pattern: /^\|.+\|\n\|[-:| ]+\|/m, label: '表格' },
  { pattern: /^\s*[-*+]\s+\[[ xX]\]\s+/m, label: '任务列表' },
];

export function detectUnsupportedMarkdown(markdown) {
  return unsupportedPatterns.filter(item => item.pattern.test(markdown)).map(item => item.label);
}

export function parseMarkdown(markdown) {
  return markdownParser.parse(markdown || '');
}

export function serializeMarkdown(doc) {
  return markdownSerializer.serialize(doc).replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '');
}

function buildMenuCommand(command) {
  return (state, dispatch) => command(state, dispatch);
}

export class WysiwygController {
  constructor(options) {
    this.host = options.host;
    this.onCommit = options.onCommit;
    this.onFocus = options.onFocus || (() => {});
    this.composing = false;
    this.suppressCommit = false;
    this.savedSelection = null;
    this.view = new EditorView(this.host, {
      state: EditorState.create({
        doc: parseMarkdown(options.markdown || ''),
        plugins: [
          history(),
          inputRules({ rules: smartQuotes.concat([emDash, ellipsis]) }),
          keymap({
            'Mod-z': undo,
            'Shift-Mod-z': redo,
            'Mod-y': redo,
            Enter: splitListItem(schema.nodes.list_item),
            Backspace: liftListItem(schema.nodes.list_item),
          }),
          keymap(baseKeymap),
          new Plugin({
            props: {
              handleDOMEvents: {
                compositionstart: () => { this.composing = true; return false; },
                compositionend: () => { this.composing = false; this.commit(); return false; },
                focus: () => { this.onFocus(); return false; },
              },
            },
          }),
        ],
      }),
      dispatchTransaction: tr => {
        const state = this.view.state.apply(tr);
        this.view.updateState(state);
        if (tr.selectionSet) this.savedSelection = state.selection;
        if (tr.docChanged && !this.composing && !this.suppressCommit) this.commit();
      },
    });
  }

  commit() {
    this.onCommit(serializeMarkdown(this.view.state.doc));
  }

  setMarkdown(markdown) {
    const doc = parseMarkdown(markdown || '');
    this.suppressCommit = true;
    this.view.updateState(EditorState.create({ doc, plugins: this.view.state.plugins }));
    this.suppressCommit = false;
  }

  focus() { this.view.focus(); }
  destroy() { this.view.destroy(); }

  saveSelection() { this.savedSelection = this.view.state.selection; }
  restoreSelection() {
    if (this.savedSelection) this.view.dispatch(this.view.state.tr.setSelection(this.savedSelection));
    this.focus();
  }

  run(command) {
    this.restoreSelection();
    return command(this.view.state, this.view.dispatch, this.view);
  }

  toggleBold() { return this.run(buildMenuCommand(toggleMark(schema.marks.strong))); }
  toggleItalic() { return this.run(buildMenuCommand(toggleMark(schema.marks.em))); }
  toggleStrike() { return this.run(buildMenuCommand(toggleMark(schema.marks.strike))); }
  toggleCode() { return this.run(buildMenuCommand(toggleMark(schema.marks.code))); }
  heading(level) { return this.run(buildMenuCommand(setBlockType(schema.nodes.heading, { level }))); }
  quote() { return this.run(buildMenuCommand(wrapIn(schema.nodes.blockquote))); }
  bulletList() { return this.run(buildMenuCommand(wrapInList(schema.nodes.bullet_list))); }
  orderedList() { return this.run(buildMenuCommand(wrapInList(schema.nodes.ordered_list))); }
  insertRule() {
    this.restoreSelection();
    this.view.dispatch(this.view.state.tr.replaceSelectionWith(schema.nodes.horizontal_rule.create()).scrollIntoView());
  }

  insertLink(href, text) {
    this.restoreSelection();
    const { state } = this.view;
    const selected = state.selection.empty ? (text || href) : state.doc.textBetween(state.selection.from, state.selection.to, ' ');
    const tr = state.tr.replaceSelectionWith(schema.text(selected, [schema.marks.link.create({ href })]), false);
    this.view.dispatch(tr);
  }

  insertImage(src, alt = '') {
    this.restoreSelection();
    this.view.dispatch(this.view.state.tr.replaceSelectionWith(schema.nodes.image.create({ src, alt }), false));
  }

  getState() { return this.view.state; }

  stateForToolbar() {
    const { state } = this.view;
    const { $from } = state.selection;
    const has = name => !!schema.marks[name] && !!schema.marks[name].isInSet(state.storedMarks || $from.marks());
    return {
      bold: has('strong'), italic: has('em'), strike: has('strike'), code: has('code'),
      h1: $from.parent.type === schema.nodes.heading && $from.parent.attrs.level === 1,
      h2: $from.parent.type === schema.nodes.heading && $from.parent.attrs.level === 2,
      h3: $from.parent.type === schema.nodes.heading && $from.parent.attrs.level === 3,
      quote: !!$from.node(-1) && $from.node(-1).type === schema.nodes.blockquote,
      ul: !!$from.node(-1) && $from.node(-1).type === schema.nodes.bullet_list,
      ol: !!$from.node(-1) && $from.node(-1).type === schema.nodes.ordered_list,
    };
  }
}
