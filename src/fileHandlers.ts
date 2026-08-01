import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import mammoth from 'mammoth';
import TurndownService from 'turndown';
import { PageFormat, PAPER_SIZES_PX, Project } from './types';

const turndownService = new TurndownService();

export async function exportToPdf(title: string, contentHtml: string, pageFormat: PageFormat) {
  const container = document.createElement('div');
  container.id = 'pdf-export-container';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  
  const size = PAPER_SIZES_PX[pageFormat.paperSize] || PAPER_SIZES_PX['A4'];
  const isPageless = pageFormat.paperSize === 'pageless' || pageFormat.mode === 'pageless' || size.h === 0;
  
  const w = isPageless ? 660 : (pageFormat.orientation === 'landscape' ? size.h : size.w);
  const h = isPageless ? 0 : (pageFormat.orientation === 'landscape' ? size.w : size.h);

  container.style.width = `${w}px`;
  container.style.padding = '40px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#111111';
  container.style.fontFamily = 'Georgia, serif';
  container.style.fontSize = '16px';
  container.style.lineHeight = '1.7';
  container.style.boxSizing = 'border-box';
  container.style.wordBreak = 'break-word';
  container.style.overflowWrap = 'break-word';
  container.style.whiteSpace = 'normal';
  container.style.textAlign = 'justify';
  
  container.innerHTML = `<style>
    #pdf-export-container * { box-sizing: border-box; }
    #pdf-export-container p, #pdf-export-container h1, #pdf-export-container h2, #pdf-export-container h3, #pdf-export-container h4, #pdf-export-container h5, #pdf-export-container h6, #pdf-export-container li { white-space: normal; word-wrap: break-word; overflow-wrap: break-word; max-width: 100%; }
  </style><div style="width: 100%; max-width: 100%;"><h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: left;">${title}</h1>${contentHtml}</div>`;
  
  document.body.appendChild(container);

  try {
    // Wait for fonts/images to settle
    await new Promise(resolve => setTimeout(resolve, 150));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedContainer = clonedDoc.getElementById('pdf-export-container');
        if (clonedContainer) {
          clonedContainer.style.position = 'static';
          clonedContainer.style.left = '0';
          clonedContainer.style.top = '0';
          clonedContainer.style.margin = '0';
        }
      }
    });

    const imgData = canvas.toDataURL('image/png');
    if (!imgData || imgData === 'data:,' || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Generated image data is invalid.');
    }

    const pdfWidth = w;
    const scaleFactor = canvas.width / pdfWidth;
    const totalPdfHeight = canvas.height / scaleFactor;

    if (isPageless) {
      const pdfH = Math.max(100, totalPdfHeight);
      const pdf = new jsPDF({
        orientation: pageFormat.orientation === 'landscape' ? 'landscape' : 'portrait',
        unit: 'px',
        format: [pdfWidth, pdfH],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, totalPdfHeight);
      pdf.save(`${(title || 'document').replace(/[\\/:*?"<>|]/g, '')}.pdf`);
    } else {
      const pagePdfHeight = h;
      const pageCanvasHeight = pagePdfHeight * scaleFactor;
      const totalPages = Math.ceil(canvas.height / pageCanvasHeight);

      const pdf = new jsPDF({
        orientation: pageFormat.orientation === 'landscape' ? 'landscape' : 'portrait',
        unit: 'px',
        format: [pdfWidth, pagePdfHeight],
      });

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage([pdfWidth, pagePdfHeight], pageFormat.orientation === 'landscape' ? 'landscape' : 'portrait');
        }

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = pageCanvasHeight;

        const pageCtx = pageCanvas.getContext('2d');
        if (pageCtx) {
          pageCtx.fillStyle = '#ffffff';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

          const sourceY = i * pageCanvasHeight;
          const sourceH = Math.min(pageCanvasHeight, canvas.height - sourceY);

          if (sourceH > 0) {
            pageCtx.drawImage(
              canvas,
              0, sourceY,
              canvas.width, sourceH,
              0, 0,
              canvas.width, sourceH
            );
          }
        }

        const pageImgData = pageCanvas.toDataURL('image/png');
        pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pagePdfHeight);
      }

      pdf.save(`${(title || 'document').replace(/[\\/:*?"<>|]/g, '')}.pdf`);
    }
  } catch (err) {
    console.error('PDF export error:', err);
    alert('Failed to generate PDF. Try printing to PDF instead.');
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

export function exportToDocx(title: string, contentHtml: string) {
  const wordDocument = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset="utf-8"><title>${title}</title>
<style>
  @page { size: 21cm 29.7cm; margin: 2.54cm; }
  body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 12pt; line-height: 1.5; color: #333; text-align: justify; }
  h1 { font-size: 18pt; font-weight: bold; margin-bottom: 12pt; color: #111; text-align: left; }
  h2 { font-size: 14pt; font-weight: bold; margin-top: 12pt; margin-bottom: 6pt; color: #222; text-align: left; }
  p { margin: 0 0 12pt 0; text-align: justify; }
</style>
</head><body><h1>${title}</h1>${contentHtml}</body></html>`;
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
