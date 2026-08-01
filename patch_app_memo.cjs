const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace inline onContentChange with a memoized version
code = code.replace(
  /onContentChange=\{\(html\) => updateActivePage\(\{ content: html \}\)\}/g,
  `onContentChange={useCallback((html: string) => updateActivePage({ content: html }), [updateActivePage])}`
);

fs.writeFileSync('src/App.tsx', code);
