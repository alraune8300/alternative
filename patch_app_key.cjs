const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<Editor\n/g,
  `<Editor\n                    key={activePage?.id || 'empty'}\n`
);

fs.writeFileSync('src/App.tsx', code);
