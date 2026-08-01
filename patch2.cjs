const fs = require('fs');
let code = fs.readFileSync('src/LeftPanel.tsx', 'utf8');
code = code.replace(
`    <div`,
`    <div onClick={() => setFolderMenuOpenId(null)}`
);
fs.writeFileSync('src/LeftPanel.tsx', code);
