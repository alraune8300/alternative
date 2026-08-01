const fs = require('fs');

let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

// Remove New Folder button
code = code.replace(
  /<button\s+onClick=\{handleCreateFolderClick\}[\s\S]*?<\/button>/,
  ''
);

// Remove Dialog
code = code.replace(
  /\{newFolderDialog\.isOpen && \([\s\S]*?\}\)[\s\S]*?\)\}/,
  ''
);

fs.writeFileSync('src/WelcomeScreen.tsx', code);
