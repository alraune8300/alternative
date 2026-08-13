const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf8');

code = code.replace(
  /\/\* replaced this\.version\(2\) block \*\/\n    \/\/ this\.version\(2\)\.stores\({\n      projects: 'id, title, lastModified, folderId',\n      appSettings: 'id',\n      folders: 'id, name, isDeleted'\n    }\);/g,
  ""
);

fs.writeFileSync('src/db.ts', code);
