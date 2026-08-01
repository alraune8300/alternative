import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import mammoth from 'mammoth';
import TurndownService from 'turndown';
import { PageFormat, PAPER_SIZES_PX, Project } from './types';

const turndownService = new TurndownService();

export async function exportToPdf(title: string, contentHtml: string, pageFormat: PageFormat) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.opacity = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '-1000';
  const size = PAPER_SIZES_PX[pageFormat.paperSize] || PAPER_SIZES_PX['A4'];
  const w = pageFormat.orientation === 'landscape' ? size.h : size.w;
  const h = pageFormat.orientation === 'landscape' ? size.w : size.h;
  container.style.width = `${w}px`;
  container.style.padding = '40px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#111111';
  container.style.fontFamily = 'Georgia, serif';
  container.style.fontSize = '16px';
  container.style.lineHeight = '1.7';
  container.innerHTML = `<h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">${title}</h1>${contentHtml}`;
  document.body.appendChild(container);

  try {
    // Wait for fonts/images to settle
    await new Promise(resolve => setTimeout(resolve, 100));
    const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
    const imgData = canvas.toDataURL('image/png');
    if (!imgData || imgData === 'data:,') {
      throw new Error('Generated image data is invalid.');
    }
    const pdf = new jsPDF({
      orientation: pageFormat.orientation,
      unit: 'px',
      format: [w, h],
    });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${(title || 'document').replace(/[\\/:*?"<>|]/g, '')}.pdf`);
  } catch (err) {
    console.error('PDF export error:', err);
    alert('Failed to generate PDF. Try printing to PDF instead.');
  } finally {
    document.body.removeChild(container);
  }
}

export function exportToDocx(title: string, contentHtml: string) {
  const wordDocument = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #333; margin: 1in; }
h1 { font-size: 18pt; font-weight: bold; margin-bottom: 12pt; color: #111; }
h2 { font-size: 14pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; color: #222; }
p { margin-bottom: 10pt; }
</style>
</head>
<body>
<h1>${title}</h1>
${contentHtml}
</body>
</html>`;
  const blob = new Blob(['\ufeff' + wordDocument], { type: 'application/msword' });
  triggerDownload(blob, `${(title || 'document').replace(/[\\/:*?"<>|]/g, '')}.doc`);
}

export function exportToHtmlFile(title: string, contentHtml: string) {
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.7;color:#222;background:#fdfdfd}</style></head><body><h1>${title}</h1>${contentHtml}</body></html>`;
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  triggerDownload(blob, `${(title || 'document').replace(/[\\/:*?"<>|]/g, '')}.html`);
}

export function exportToMarkdownFile(title: string, contentHtml: string) {
  const markdown = `# ${title}\n\n` + turndownService.turndown(contentHtml);
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  triggerDownload(blob, `${(title || 'document').replace(/[\\/:*?"<>|]/g, '')}.md`);
}

export function exportToJsonBackup(projects: Project[]) {
  const data = { version: 1, exportedAt: Date.now(), projects };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  triggerDownload(blob, `ellipsus-backup-${new Date().toISOString().slice(0, 10)}.json`);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importFile(file: File): Promise<{ title: string; htmlContent: string }> {
  const name = file.name;
  const ext = name.split('.').pop()?.toLowerCase();
  const title = name.replace(/\.[^/.]+$/, '');

  if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return { title, htmlContent: result.value || '<p></p>' };
  } else if (ext === 'pdf') {
    const text = await file.text();
    const paragraphs = text.split(/\r?\n\r?\n/).map(p => `<p>${escapeHtml(p)}</p>`).join('');
    return { title, htmlContent: paragraphs || `<p>${escapeHtml(text)}</p>` };
  } else if (ext === 'html' || ext === 'htm') {
    const htmlText = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const bodyHtml = doc.body ? doc.body.innerHTML : htmlText;
    return { title, htmlContent: bodyHtml };
  } else if (ext === 'md') {
    const mdText = await file.text();
    const div = document.createElement('div');
    div.innerHTML = mdText.replace(/^# (.*$)/gm, '<h1>$1</h1>').replace(/^## (.*$)/gm, '<h2>$1</h2>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '</p><p>');
    return { title, htmlContent: `<p>${div.innerHTML}</p>` };
  } else if (ext === 'json') {
    const jsonText = await file.text();
    try {
      const data = JSON.parse(jsonText);
      if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
        const p = data.projects[0];
        const firstPage = p.pages?.[0];
        return { title: p.title || title, htmlContent: firstPage?.content || '<p></p>' };
      }
    } catch {
      // fallback
    }
    return { title, htmlContent: `<p>${escapeHtml(jsonText)}</p>` };
  } else {
    const text = await file.text();
    const paragraphs = text.split(/\r?\n\r?\n/).map(p => `<p>${escapeHtml(p)}</p>`).join('');
    return { title, htmlContent: paragraphs || `<p>${escapeHtml(text)}</p>` };
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
