const fs = require('fs');
let code = fs.readFileSync('src/Editor.css', 'utf8');

code = code.replace(
  '.ProseMirror img {\\n  max-width: 100%;\\n  height: auto;\\n  border-radius: 4px;\\n  display: block;\\n  margin: 1rem auto;\\n}',
  ''
);

fs.writeFileSync('src/Editor.css', code);
