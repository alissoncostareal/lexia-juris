const fs = require('fs');
const path = require('path');
const vm = require('vm');

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

// Escape any <script or </script occurrences inside JS strings so the HTML parser does not close/break script tags
const safeJsCode = rawJsCode
  .replace(/<script/gi, '\\x3cscript')
  .replace(/<\/script/gi, '<\\/script');

console.log('2. Reading template index.html...');
let templateHtml = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');

// Make tailwind.config safe if offline
templateHtml = templateHtml.replace(
  '<script id="tailwind-config">',
  '<script id="tailwind-config">\n      window.tailwind = window.tailwind || {};'
);

// Inline local tailwind.js if available
const tailwindFile = path.join(assetsDir, 'tailwind.js');
if (fs.existsSync(tailwindFile)) {
  console.log('Embedding local tailwind.js...');
  const tailwindCode = fs.readFileSync(tailwindFile, 'utf8')
    .replace(/<script/gi, '\\x3cscript')
    .replace(/<\/script/gi, '<\\/script');
  
  templateHtml = templateHtml.replace(
    '<script src="https://cdn.tailwindcss.com"></script>',
    () => `<script>\n${tailwindCode}\n</script>`
  );
}

// 3. Inline main JS bundle using FUNCTION callback to avoid $& / $$ substitution bugs
console.log('Inlining JS bundle into HTML...');
const scriptRegex = /<script type="module" crossorigin src="[^"]+"><\/script>/;
const inlinedHtml = templateHtml.replace(scriptRegex, () => {
  return `<script>\n${safeJsCode}\n</script>`;
});

// 4. Validate script syntax with Node VM
console.log('Validating script syntax in generated HTML...');
const inlineScriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
let match, count = 0;
while ((match = inlineScriptRegex.exec(inlinedHtml)) !== null) {
  count++;
  try {
    new vm.Script(match[1]);
    console.log(`  Script #${count} (${(match[1].length / 1024).toFixed(1)} KB): SYNTAX OK!`);
  } catch (err) {
    throw new Error(`Syntax error in script #${count}: ${err.message}`);
  }
}

// 5. Write to docs/index.html
fs.writeFileSync(path.join(docsDir, 'index.html'), inlinedHtml, 'utf8');
console.log(`Generated docs/index.html (${(inlinedHtml.length / 1024).toFixed(1)} KB)`);

// 6. Copy assets, icon, manifest to docs/
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

console.log('\nSUCCESS! Inlined HTML built and validated cleanly without any syntax errors.');
