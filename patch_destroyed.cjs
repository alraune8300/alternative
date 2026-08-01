const fs = require('fs');

function patchEditor() {
  let code = fs.readFileSync('src/Editor.tsx', 'utf8');
  
  // Patch setContent
  code = code.replace(
    /if \(editor && content !== lastEmittedContentRef\.current && editor\.getHTML\(\) !== content\) \{([^}]+)\}/,
    `if (editor && !editor.isDestroyed && content !== lastEmittedContentRef.current && editor.getHTML() !== content) {$1}`
  );

  // Patch onClick focus
  code = code.replace(
    /if \(\!isPreviewMode && editor\) \{/,
    `if (!isPreviewMode && editor && !editor.isDestroyed) {`
  );
  
  // Patch keydown
  code = code.replace(
    /if \(editor && typeof editor\.can === 'function'/g,
    `if (editor && !editor.isDestroyed && typeof editor.can === 'function'`
  );

  fs.writeFileSync('src/Editor.tsx', code);
}

function patchApp() {
  let code = fs.readFileSync('src/App.tsx', 'utf8');
  
  code = code.replace(
    /if \(typeof editor\?\.commands\?\.focus === 'function'\) \{/g,
    `if (!editor?.isDestroyed && typeof editor?.commands?.focus === 'function') {`
  );

  fs.writeFileSync('src/App.tsx', code);
}

function patchToolbar() {
  let code = fs.readFileSync('src/Toolbar.tsx', 'utf8');
  
  code = code.replace(
    /if \(\!editor\) \{\s*return null;\s*\}/,
    `if (!editor || editor.isDestroyed) { return null; }`
  );

  fs.writeFileSync('src/Toolbar.tsx', code);
}

patchEditor();
patchApp();
patchToolbar();
