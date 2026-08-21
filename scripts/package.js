'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const dist = path.join(root, 'dist');
const stageRoot = path.join(root, '.package-staging');
const common = ['klock-editor.js', 'klock-editor-wysiwyg.js', 'klock-editor.css', 'klock-editor.d.ts', 'demo.html', 'README.md', 'CHANGELOG.md', 'LICENSE', 'THIRD-PARTY-NOTICES.txt'];
const server = ['server/preview.php', 'server/upload.php', 'server/uploads/.htaccess', 'server/lib/Parsedown.php', 'server/lib/ParsedownExtended.php', 'server/lib/Parsedown-LICENSE.txt', 'server/lib/ParsedownExtended-LICENSE.txt'];

function rm(p) { fs.rmSync(p, { recursive: true, force: true }); }
function cp(rel, dest) {
  const src = path.join(root, rel);
  if (!fs.existsSync(src)) throw new Error('Missing package file: ' + rel);
  const out = path.join(dest, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.copyFileSync(src, out);
}
function psQuote(s) { return s.replace(/'/g, "''"); }
function zip(name, files) {
  const stage = path.join(stageRoot, name.replace(/\.zip$/, ''));
  rm(stage); fs.mkdirSync(stage, { recursive: true });
  files.forEach(f => cp(f, stage));
  if (!files.includes('klock-editor-wysiwyg.js')) throw new Error('WYSIWYG bundle missing from package');
  if (!files.includes('THIRD-PARTY-NOTICES.txt')) throw new Error('Third-party notices missing from package');
  fs.mkdirSync(dist, { recursive: true });
  const out = path.join(dist, name);
  rm(out);
  if (process.platform === 'win32') {
    const cmd = `Compress-Archive -Path '${psQuote(stage)}\\*' -DestinationPath '${psQuote(out)}' -Force`;
    execFileSync('powershell.exe', ['-NoProfile', '-Command', cmd], { stdio: 'inherit' });
  } else {
    execFileSync('zip', ['-qr', out, '.'], { cwd: stage, stdio: 'inherit' });
  }
  return out;
}

const target = process.argv[2] || 'all';
if (!['editor', 'full', 'all'].includes(target)) throw new Error('Usage: node scripts/package.js [editor|full|all]');
rm(stageRoot);
const outputs = [];
if (target === 'editor' || target === 'all') outputs.push(zip(`KlockEditor-v${version}-editor.zip`, common));
if (target === 'full' || target === 'all') outputs.push(zip(`KlockEditor-v${version}-full.zip`, common.concat(server)));
console.log('Created:', outputs.join(', '));
rm(stageRoot);
