const fs = require('fs');
let code = fs.readFileSync('src/Editor.tsx', 'utf8');

const target = `onSelectionBlur: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedContentRef.current = html;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      callbacksRef.current.onContentChange(html);
    },
    onUpdate: ({ editor }) => {
      if (callbacksRef.current.onEditorReady) callbacksRef.current.onEditorReady(editor);
    },
    onUpdate: ({ editor }) => {`;

const replacement = `onSelectionUpdate: ({ editor }) => {
      if (callbacksRef.current.onEditorReady) callbacksRef.current.onEditorReady(editor);
    },
    onBlur: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedContentRef.current = html;
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      callbacksRef.current.onContentChange(html);
    },
    onUpdate: ({ editor }) => {`;

code = code.replace(target, replacement);

fs.writeFileSync('src/Editor.tsx', code);
