const fs = require('fs');
let code = fs.readFileSync('src/fileHandlers.ts', 'utf8');

// Fix PDF
code = code.replace(
  "container.style.lineHeight = '1.7';",
  "container.style.lineHeight = '1.7';\n  container.style.boxSizing = 'border-box';\n  container.style.wordWrap = 'break-word';\n  container.style.whiteSpace = 'pre-wrap';\n  container.style.textAlign = 'justify';"
);

// Fix DOCX
const docxRegex = /export function exportToDocx\(title: string, contentHtml: string\) \{[\s\S]*?const blob = new Blob\(\['\\ufeff' \+ wordDocument\], \{ type: 'application\/msword' \}\);/m;
const docxReplacement = `export function exportToDocx(title: string, contentHtml: string) {
  const wordDocument = \`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="utf-8"><title>\${title}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.54cm; }
  body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 12pt; line-height: 1.5; color: #333; text-align: justify; }
  h1 { font-size: 18pt; font-weight: bold; margin-bottom: 12pt; color: #111; text-align: left; }
  h2 { font-size: 14pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; color: #222; text-align: left; }
  p { margin: 0 0 12pt 0; text-align: justify; }
</style>
</head><body><h1>\${title}</h1>\${contentHtml}</body></html>\`;
  const blob = new Blob(['\\ufeff' + wordDocument], { type: 'application/msword' });`;

code = code.replace(docxRegex, docxReplacement);

fs.writeFileSync('src/fileHandlers.ts', code);
