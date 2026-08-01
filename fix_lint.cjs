const fs = require('fs');

function replace(file, search, replace) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(search, replace);
  fs.writeFileSync(file, code);
}

// App.tsx
replace('src/App.tsx', /Footnote, /g, '');
replace('src/App.tsx', /\(editorInstance as any\)/g, '(editorInstance as unknown as { can: () => { undo: () => boolean, redo: () => boolean } })');

// Editor.tsx
replace('src/Editor.tsx', /Footnote, /g, '');

// Toolbar.tsx
replace('src/Toolbar.tsx', /Check, /g, '');
replace('src/Toolbar.tsx', /Footprints, /g, '');
replace('src/Toolbar.tsx', /, Footprints/g, '');

// WelcomeScreen.tsx
replace('src/WelcomeScreen.tsx', /let crumbs = \[\];/, 'const crumbs = [];');

