const fs = require('fs');
let code = fs.readFileSync('src/fileHandlers.ts', 'utf8');

code = code.replace("container.style.left = '0';", "container.style.left = '-9999px';");
code = code.replace("container.style.top = '0';", "container.style.top = '-9999px';");
code = code.replace("container.style.opacity = '0';", "");

fs.writeFileSync('src/fileHandlers.ts', code);
