const fs = require('fs');
let code = fs.readFileSync('src/fileHandlers.ts', 'utf8');

code = code.replace("container.style.whiteSpace = 'pre-wrap';", "container.style.whiteSpace = 'normal';");
code = code.replace("white-space: pre-wrap;", "white-space: normal;");

fs.writeFileSync('src/fileHandlers.ts', code);
