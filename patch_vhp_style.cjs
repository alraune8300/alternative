const fs = require('fs');
let code = fs.readFileSync('src/VersionHistoryPanel.tsx', 'utf8');
code = code.replace(/fontFamily: \\`'\\\$\{uiFont\}', sans-serif\\`/g, "fontFamily: `'${uiFont}', sans-serif`");
fs.writeFileSync('src/VersionHistoryPanel.tsx', code);
