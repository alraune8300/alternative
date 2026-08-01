const fs = require('fs');
let code = fs.readFileSync('src/LeftPanel.tsx', 'utf8');

const regex = /<button[\s\S]*?New Subfolder[\s\S]*?<\/button>/;
code = code.replace(regex, '');

fs.writeFileSync('src/LeftPanel.tsx', code);
