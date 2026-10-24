const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = 'c:\\dev\\projetos\\leis-estudo-app';
const publicDir = path.join(rootDir, 'public');
const docsDir = path.join(rootDir, 'docs');
const assetsDir = path.join(publicDir, 'assets');

console.log('1. Reading JS bundle...');
const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js') && f.startsWith('index-'));
if (jsFiles.length === 0) {
  throw new Error('No JS bundle found in public/assets');
}
const jsFile = jsFiles[0];
const rawJsCode = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');

// Escape any <script or </script occurrences inside JS strings so HTML parser does not close script tags
const safeJsCode = rawJsCode
  .replace(/<script/gi, '\\x3cscript')
  .replace(/<\/script/gi, '<\\/script');

console.log('2. Reading template index.html...');
let html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');

// Ensure tailwind config doesn't throw if offline
html = html.replace(
  '<script id="tailwind-config">',
  '<script id="tailwind-config">\n      window.tailwind = window.tailwind || {};'
);

// Use local tailwind with CDN fallback
html = html.replace(
  '<script src="https://cdn.tailwindcss.com"></script>',
  `<script src="./assets/tailwind.js"></script>\n    <script>if(typeof tailwind==='undefined'){document.write('<script src="https://cdn.tailwindcss.com"><\\/script>');}</script>`
);

// Remove the external module script from <head>
html = html.replace(/<script type="module" crossorigin src="[^"]+"><\/script>\s*/, '');

// 3. INSERT THE APP SCRIPT RIGHT BEFORE </body> USING PURE SLICE (PREVENTS ANY .replace() PATTERN BUGS!)
const bodyCloseIdx = html.lastIndexOf('</body>');
if (bodyCloseIdx === -1) throw new Error('Could not find </body> in template');

const inlinedScript = `\n    <script>\n${safeJsCode}\n    </script>\n`;
html = html.slice(0, bodyCloseIdx) + inlinedScript + html.slice(bodyCloseIdx);

// 4. Write to docs/index.html
fs.writeFileSync(path.join(docsDir, 'index.html'), html, 'utf8');
console.log(`Generated docs/index.html (${(html.length / 1024).toFixed(1)} KB)`);

// 5. Copy assets, icon, manifest to docs/
if (fs.existsSync(path.join(publicDir, 'icon.svg'))) {
  fs.copyFileSync(path.join(publicDir, 'icon.svg'), path.join(docsDir, 'icon.svg'));
}
if (fs.existsSync(path.join(publicDir, 'manifest.json'))) {
  fs.copyFileSync(path.join(publicDir, 'manifest.json'), path.join(docsDir, 'manifest.json'));
}

const docsAssets = path.join(docsDir, 'assets');
if (!fs.existsSync(docsAssets)) fs.mkdirSync(docsAssets, { recursive: true });
for (const file of fs.readdirSync(assetsDir)) {
  fs.copyFileSync(path.join(assetsDir, file), path.join(docsAssets, file));
}

// 6. Verify rendering with headless Edge
console.log('Validating with headless Edge...');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const testHtmlUrl = 'file:///' + path.join(docsDir, 'index.html').replace(/\\/g, '/');
const dumpedHtml = execSync(`"${edgePath}" --headless=new --dump-dom "${testHtmlUrl}"`, { encoding: 'utf8' });

const rootIdx = dumpedHtml.indexOf('id="root"');
const rootSlice = dumpedHtml.substring(rootIdx, rootIdx + 400);

if (rootSlice.includes('LexIA') || rootSlice.includes('CF/88') || rootSlice.includes('<header') || rootSlice.includes('min-h-screen')) {
  console.log('\n🎉 SUCESSO COMPLETO! A interface React foi montada e renderizada perfeitamente no DOM!');
} else {
  throw new Error('Falha na renderização: o elemento #root permaneceu vazio.');
}
