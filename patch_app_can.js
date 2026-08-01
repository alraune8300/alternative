const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /canUndo=\{Boolean\(\(editorInstance as any\)\?\.can\?\.\(\)\?\.undo\?\.\(\)\)\}/,
  `canUndo={Boolean(!editorInstance?.isDestroyed && (editorInstance as any)?.can?.()?.undo?.())}`
);

code = code.replace(
  /canRedo=\{Boolean\(\(editorInstance as any\)\?\.can\?\.\(\)\?\.redo\?\.\(\)\)\}/,
  `canRedo={Boolean(!editorInstance?.isDestroyed && (editorInstance as any)?.can?.()?.redo?.())}`
);

fs.writeFileSync('src/App.tsx', code);
