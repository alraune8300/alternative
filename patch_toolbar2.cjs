const fs = require('fs');
let code = fs.readFileSync('src/Toolbar.tsx', 'utf8');

const insertImageFn = `
  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target)?.files?.[0];
      if (!file) return;
      if (file.size > 25 * 1024 * 1024) {
        alert(t.imageTooLarge || 'Image size exceeds 25MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result;
        if (typeof base64 === 'string') {
          editor.chain().focus().setImage({ src: base64 }).run();
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };
`;

code = code.replace(
  '  const Divider = () => <div className="w-px h-5 mx-1 shrink-0" style={{ backgroundColor: theme.border }} />;',
  '  const Divider = () => <div className="w-px h-5 mx-1 shrink-0" style={{ backgroundColor: theme.border }} />;' + '\\n' + insertImageFn
);

fs.writeFileSync('src/Toolbar.tsx', code);
