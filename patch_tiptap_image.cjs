const fs = require('fs');
let code = fs.readFileSync('src/tiptapExtensions.ts', 'utf8');

code = code.replace(
  'export const ResizableImage = Image.extend({',
  'export const ResizableImage = Image.extend({\n  addOptions() {\n    return {\n      ...this.parent?.(),\n      allowBase64: true,\n    }\n  },'
);

fs.writeFileSync('src/tiptapExtensions.ts', code);
