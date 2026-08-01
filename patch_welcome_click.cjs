const fs = require('fs');

let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

code = code.replace(
  /{displayedFolders\.map\(\(folder\) => \(\s*<div\s*key=\{folder\.id\}\s*className=/g,
  `{displayedFolders.map((folder) => (
                <div 
                  key={folder.id}
                  onClick={() => tab === 'active' && setCurrentFolderId(folder.id)}
                  className=`
);

fs.writeFileSync('src/WelcomeScreen.tsx', code);
