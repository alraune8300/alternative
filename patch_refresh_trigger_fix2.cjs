const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /setActivePageId\(projs\[0\]\.pages\[0\]\?\.id \|\| ''\);\n            \}\n          \}\n        \}\}/g,
  "setActivePageId(projs[0].pages[0]?.id || '');\n            }\n          }\n          setRefreshTrigger(prev => prev + 1);\n        }}"
);

fs.writeFileSync('src/App.tsx', code);
