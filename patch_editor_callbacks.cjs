const fs = require('fs');

let code = fs.readFileSync('src/Editor.tsx', 'utf8');

code = code.replace(
  "const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);",
  "const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);\n  const callbacksRef = useRef({ onContentChange, onEditorReady });\n  useEffect(() => { callbacksRef.current = { onContentChange, onEditorReady }; }, [onContentChange, onEditorReady]);"
);

fs.writeFileSync('src/Editor.tsx', code);
