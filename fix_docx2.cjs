const fs = require('fs');
let code = fs.readFileSync('src/fileHandlers.ts', 'utf8');

const regex = /export async function exportToDocx\(title: string, contentHtml: string\) \{[\s\S]*?\}\n\nexport function exportToHtmlFile/;

const replacement = `export function exportToDocx(title: string, contentHtml: string) {
  const wordDocument = \`<!DOCTYPE html><html><head><meta charset="utf-8"><title>\${title}</title><style>body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #333; margin: 1in; }h1 { font-size: 18pt; font-weight: bold; margin-bottom: 12pt; color: #111; }h2 { font-size: 14pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; color: #222; }p { margin-bottom: 10pt; }</style></head><body><h1>\${title}</h1>\${contentHtml}</body></html>\`;
  const blob = new Blob(['\\ufeff' + wordDocument], { type: 'application/msword' });
  triggerDownload(blob, \`\${(title || 'document').replace(/[\\\\/:*?"<>|]/g, '')}.doc\`);
}

export function exportToHtmlFile`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/fileHandlers.ts', code);
