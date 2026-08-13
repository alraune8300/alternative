const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
code = code.replace(
  "| 'importexport' | 'settings'",
  "| 'importexport' | 'settings' | 'history'"
);
fs.writeFileSync('src/types.ts', code);
