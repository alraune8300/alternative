const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

// The line is: onContentChange={useCallback((html: string) => updateActivePage({ content: html }), [updateActivePage])}
// We should define handleContentChange = useCallback((html: string) => updateActivePage({ content: html }), [updateActivePage]);
// near the end of hooks in App.tsx. Let's find a good place, like before `const availableFonts =`.

code = code.replace(
  /const availableFonts = useMemo\(\(\) => \{/,
  `const handleContentChange = useCallback((html: string) => {\n    updateActivePage({ content: html });\n  }, [updateActivePage]);\n\n  const availableFonts = useMemo(() => {`
);

code = code.replace(
  /onContentChange=\{useCallback\(\(html: string\) => updateActivePage\(\{ content: html \}\), \[updateActivePage\]\)\}/g,
  `onContentChange={handleContentChange}`
);

fs.writeFileSync('src/App.tsx', code);
