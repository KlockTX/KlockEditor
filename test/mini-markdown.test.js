/**
 * 内置迷你 Markdown 渲染器单元测试（零依赖，node test/mini-markdown.test.js）
 * 覆盖：XSS 阻断（URL 协议白名单）、常用语法渲染、代码块转义
 */
'use strict';

var K = require('../klock-editor.js');
var md = K.miniMarkdown;
var passed = 0, failed = 0;

function t(name, cond) {
    if (cond) { passed++; console.log('  pass: ' + name); }
    else { failed++; console.error('  FAIL: ' + name); }
}

console.log('miniMarkdown 测试:');

// —— XSS 阻断 ——
t('javascript: 链接被阻断', md('[x](javascript:alert(1))').indexOf('javascript:') === -1);
t('大小写混合 javascript: 被阻断', md('[x](JaVaScRiPt:alert(1))').toLowerCase().indexOf('javascript:') === -1);
t('data: 图片被阻断', md('![i](data:text/html;base64,xxx)').indexOf('data:') === -1);
t('vbscript: 被阻断', md('[x](vbscript:msgbox)').indexOf('vbscript:') === -1);

// —— 白名单放行 ——
t('https 链接保留', md('[ok](https://example.com/a)').indexOf('href="https://example.com/a"') !== -1);
t('http 链接保留', md('[ok](http://example.com)').indexOf('href="http://example.com"') !== -1);
t('相对路径保留', md('[rel](/path/x)').indexOf('href="/path/x"') !== -1);
t('锚点保留', md('[a](#sec)').indexOf('href="#sec"') !== -1);
t('mailto 保留', md('[m](mailto:a@b.c)').indexOf('href="mailto:a@b.c"') !== -1);

// —— 常用语法 ——
t('标题渲染', md('# T').indexOf('<h1>T</h1>') !== -1 && md('## T').indexOf('<h2>') !== -1 && md('### T').indexOf('<h3>') !== -1);
t('粗体/斜体/行内码', md('**b** *i* `c`').indexOf('<strong>b</strong>') !== -1 && md('**b** *i* `c`').indexOf('<em>i</em>') !== -1 && md('**b** *i* `c`').indexOf('<code>c</code>') !== -1);
t('无序/有序列表', md('- a\n- b\n\n1. c\n2. d').indexOf('<ul>') !== -1 && md('- a\n- b\n\n1. c\n2. d').indexOf('<ol>') !== -1);
t('引用块', md('> q').indexOf('<blockquote>') !== -1);
t('分隔线', md('---').indexOf('<hr>') !== -1);
t('表格', md('| a | b |\n|---|---|\n| 1 | 2 |').indexOf('<table>') !== -1);
t('图片 alt 保留', md('![alt x](/i.png)').indexOf('alt="alt x"') !== -1);

// —— 代码块与转义 ——
var cb = md('```js\nvar x = "<script>";\n```');
t('代码块带语言 class', cb.indexOf('class="language-js"') !== -1);
t('代码块内 HTML 被转义', cb.indexOf('&lt;script&gt;') !== -1 && cb.indexOf('<script>') === -1);
t('正文 HTML 被转义', md('a < b & c').indexOf('&lt;') !== -1);

// —— 版本 ——
t('VERSION = 2.0.0', K.VERSION === '2.0.0');

console.log('\n结果: ' + passed + ' 通过, ' + failed + ' 失败');
process.exitCode = failed ? 1 : 0;
