const fs = require('fs');
let code = fs.readFileSync('src/fileHandlers.ts', 'utf8');

code = code.replace("container.style.left = '-9999px';", "container.style.left = '0';");
code = code.replace("container.style.top = '-9999px';", "container.style.top = '0';");

fs.writeFileSync('src/fileHandlers.ts', code);
