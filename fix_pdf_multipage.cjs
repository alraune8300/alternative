const fs = require('fs');
let code = fs.readFileSync('src/fileHandlers.ts', 'utf8');

const regex = /const pdf = new jsPDF\(\{[\s\S]*?pdf\.save\(\`\$\{.*?\.pdf\`\);/m;

const replacement = `const pdfWidth = w;
    const totalPdfHeight = (canvas.height * pdfWidth) / canvas.width;

    let formatH = h;
    if (pageFormat.paperSize === 'pageless' || h === 0) {
      formatH = totalPdfHeight;
      // jsPDF might not like very small heights, enforce a minimum
      if (formatH < 100) formatH = 100;
    }

    const pdf = new jsPDF({
      orientation: pageFormat.orientation,
      unit: 'px',
      format: [pdfWidth, formatH],
    });

    if (pageFormat.paperSize === 'pageless' || h === 0) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, totalPdfHeight);
    } else {
      let position = 0;
      let leftHeight = totalPdfHeight;
      while (leftHeight > 0) {
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
        leftHeight -= formatH;
        position -= formatH;
        if (leftHeight > 0) {
          pdf.addPage();
        }
      }
    }
    pdf.save(\`\${(title || 'document').replace(/[\\\\/:*?"<>|]/g, '')}.pdf\`);`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/fileHandlers.ts', code);
