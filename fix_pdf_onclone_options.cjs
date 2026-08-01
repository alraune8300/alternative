const fs = require('fs');
let code = fs.readFileSync('src/fileHandlers.ts', 'utf8');

code = code.replace(
  "logging: false,",
  "logging: false, width: container.offsetWidth, windowWidth: container.offsetWidth,"
);

fs.writeFileSync('src/fileHandlers.ts', code);
