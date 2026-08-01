const fs = require('fs');

let code = fs.readFileSync('src/Editor.tsx', 'utf8');
code = code.replace(
  /editor\?\.commands\?\.setContent\(content \|\| '', \{ emitUpdate: false \}\);/,
  `const newContent = content || '';\n      editor?.commands?.setContent(newContent, { emitUpdate: false });`
);

fs.writeFileSync('src/Editor.tsx', code);
