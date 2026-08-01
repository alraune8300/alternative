const fs = require('fs');
let code = fs.readFileSync('src/fileHandlers.ts', 'utf8');

const regex = /container\.innerHTML = \`<h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">\$\{title\}<\/h1>\$\{contentHtml\}\`;/g;

const replacement = `container.innerHTML = \`<style>
  * { box-sizing: border-box; }
  p, h1, h2, h3, h4, h5, h6, li { white-space: pre-wrap; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; }
</style><div style="width: 100%; max-width: 100%;"><h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">\${title}</h1>\${contentHtml}</div>\`;`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/fileHandlers.ts', code);
