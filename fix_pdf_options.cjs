const fs = require('fs');
let code = fs.readFileSync('src/fileHandlers.ts', 'utf8');

code = code.replace(
  "const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });",
  "const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false, width: container.offsetWidth, height: container.offsetHeight, windowWidth: container.offsetWidth, windowHeight: container.offsetHeight });"
);

fs.writeFileSync('src/fileHandlers.ts', code);
