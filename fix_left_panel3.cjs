const fs = require('fs');

let code = fs.readFileSync('src/LeftPanel.tsx', 'utf8');

code = code.replace(/const toggleFolder = \(\w+\: string\) => \{[\s\S]*?\}\n/, '');

fs.writeFileSync('src/LeftPanel.tsx', code);
