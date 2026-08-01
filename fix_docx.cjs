const fs = require('fs');
let code = fs.readFileSync('src/fileHandlers.ts', 'utf8');

const regex = /export function exportToDocx\(title: string, contentHtml: string\) \{[\s\S]*?\}\n\nexport function exportToHtmlFile/;

const replacement = `export async function exportToDocx(title: string, contentHtml: string) {
  const htmlString = \`<!DOCTYPE html><html><head><meta charset="utf-8"><title>\${title}</title></head><body><h1>\${title}</h1>\${contentHtml}</body></html>\`;
  try {
    const fileBuffer = await HTMLtoDOCX(htmlString, null, {
      title: title,
      orientation: 'portrait',
    });
    const blob = new Blob([fileBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    triggerDownload(blob, \`\${(title || 'document').replace(/[\\\\/:*?"<>|]/g, '')}.docx\`);
  } catch (err) {
    console.error('DOCX export error:', err);
  }
}

export function exportToHtmlFile`;

code = code.replace(regex, replacement);

fs.writeFileSync('src/fileHandlers.ts', code);
