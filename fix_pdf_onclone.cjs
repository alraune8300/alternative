const fs = require('fs');
let code = fs.readFileSync('src/fileHandlers.ts', 'utf8');

code = code.replace(
  "const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false, width: container.offsetWidth, height: container.offsetHeight, windowWidth: container.offsetWidth, windowHeight: container.offsetHeight });",
  `container.id = 'pdf-container';
    const canvas = await html2canvas(container, { 
      scale: 2, 
      useCORS: true, 
      logging: false,
      onclone: (clonedDoc) => {
        clonedDoc.documentElement.style.overflow = 'visible';
        clonedDoc.documentElement.style.position = 'static';
        clonedDoc.documentElement.style.width = 'auto';
        clonedDoc.documentElement.style.height = 'auto';
        clonedDoc.body.style.overflow = 'visible';
        clonedDoc.body.style.position = 'static';
        clonedDoc.body.style.width = 'auto';
        clonedDoc.body.style.height = 'auto';
        
        const clonedContainer = clonedDoc.getElementById('pdf-container');
        if (clonedContainer) {
          clonedContainer.style.position = 'relative';
          clonedContainer.style.left = '0';
          clonedContainer.style.top = '0';
        }
      }
    });`
);

fs.writeFileSync('src/fileHandlers.ts', code);
