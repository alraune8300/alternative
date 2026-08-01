const fs = require('fs');
let code = fs.readFileSync('src/Editor.tsx', 'utf8');

// We need to clear the timeout if content prop changes drastically (like a page switch).
// Wait, if content changes from outside, we should clear the timeout.
// Let's add clearTimeout(updateTimeoutRef.current) in the useEffect that handles external content changes.
code = code.replace(
  /if \(editor && !editor\.isDestroyed && content !== lastEmittedContentRef\.current && editor\.getHTML\(\) !== content\) \{/,
  `if (editor && !editor.isDestroyed && content !== lastEmittedContentRef.current && editor.getHTML() !== content) {\n      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);`
);

fs.writeFileSync('src/Editor.tsx', code);
