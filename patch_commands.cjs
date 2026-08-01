const fs = require('fs');

function replaceFile(path) {
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(/editor\.commands/g, 'editor?.commands');
  code = code.replace(/editor\?\.commands\?\.focus/g, 'editor?.commands?.focus');
  code = code.replace(/typeof editor\.commands\?\.focus/g, 'typeof editor?.commands?.focus');
  fs.writeFileSync(path, code);
}

replaceFile('src/Editor.tsx');
replaceFile('src/App.tsx');
