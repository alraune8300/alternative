const fs = require('fs');
let code = fs.readFileSync('src/LeftPanel.tsx', 'utf8');
code = code.replace(
`    <div
      className="backdrop-blur-md bg-opacity-70"`,
`    <div
      onClick={() => setFolderMenuOpenId(null)}
      className="backdrop-blur-md bg-opacity-70"`
);
fs.writeFileSync('src/LeftPanel.tsx', code);
