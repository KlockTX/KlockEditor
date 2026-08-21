import assert from 'node:assert/strict';
import { parseMarkdown, serializeMarkdown, detectUnsupportedMarkdown } from '../src/wysiwyg-controller.js';

const fixtures = [
  '# Heading\n\nParagraph with **bold**, *italic*, ~~strike~~, and `code`.',
  '> Quote\n\n- one\n- two\n\n1. first\n2. second',
  '```js\nconst x = 1;\n```\n\n[link](https://example.com)\n\n![alt](/image.png)',
  '---\n\n## End',
];
for (const markdown of fixtures) {
  const output = serializeMarkdown(parseMarkdown(markdown));
  assert.ok(output.length > 0, 'round-trip must produce Markdown');
  assert.deepEqual(detectUnsupportedMarkdown(markdown), [], 'supported fixture must not be rejected');
}
assert.deepEqual(detectUnsupportedMarkdown('- [ ] todo'), ['任务列表']);
assert.deepEqual(detectUnsupportedMarkdown('| a | b |\n| --- | --- |\n| 1 | 2 |'), ['表格']);
assert.deepEqual(detectUnsupportedMarkdown('[^1]: note'), ['脚注']);
assert.deepEqual(detectUnsupportedMarkdown('$x$'), ['数学公式']);
assert.deepEqual(detectUnsupportedMarkdown('<script>x</script>'), ['原始 HTML']);
console.log('wysiwyg round-trip: ' + fixtures.length + ' fixtures passed');
