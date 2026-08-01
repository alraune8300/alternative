const fs = require('fs');
let code = fs.readFileSync('src/Editor.tsx', 'utf8');

code = code.replace(
  /onUpdate: \(\{\s*editor\s*\}\) => \{/,
  `onBlur: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedContentRef.current = html;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      callbacksRef.current.onContentChange(html);
    },
    onUpdate: ({ editor }) => {`
);

fs.writeFileSync('src/Editor.tsx', code);
