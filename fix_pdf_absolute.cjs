const fs = require('fs');
let code = fs.readFileSync('src/fileHandlers.ts', 'utf8');

code = code.replace("container.style.position = 'fixed';", "container.style.position = 'absolute';");

fs.writeFileSync('src/fileHandlers.ts', code);
