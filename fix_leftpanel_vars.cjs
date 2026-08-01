const fs = require('fs');

let code = fs.readFileSync('src/LeftPanel.tsx', 'utf8');

code = code.replace(/Plus, /g, '');
code = code.replace(/onCreateFolder = \(\) => \{\},/g, '');
code = code.replace(/const \[hoverFolderId, setHoverFolderId\] = useState<string \| null>\(null\)/g, '');

fs.writeFileSync('src/LeftPanel.tsx', code);
