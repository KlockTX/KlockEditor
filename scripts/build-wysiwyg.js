'use strict';
const esbuild = require('esbuild');
esbuild.buildSync({
  entryPoints: ['src/index.js'], bundle: true, format: 'iife',
  globalName: 'KlockWysiwygBundle', outfile: 'klock-editor-wysiwyg.js',
  minify: true, sourcemap: false, target: ['es2019'], legalComments: 'eof'
});
console.log('Built klock-editor-wysiwyg.js');
