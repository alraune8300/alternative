const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/setFootnotes\(\[\]\);\n/g, '');
code = code.replace(/setFootnotes\(\[\]\)/g, '');
fs.writeFileSync('src/App.tsx', code);

let code2 = fs.readFileSync('src/Toolbar.tsx', 'utf8');
code2 = code2.replace(/onInsertFootnote, /g, '');
fs.writeFileSync('src/Toolbar.tsx', code2);

