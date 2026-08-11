const fs = require('fs');
let code = fs.readFileSync('src/Toolbar.tsx', 'utf8');

// add Image as ImageIcon
code = code.replace('Divide, Cloud, Target', 'Divide, Cloud, Target, Image as ImageIcon');

// add insertImage function inside Toolbar component
const insertImageFn = `
  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
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

// Insert the function before the return statement
code = code.replace(
  '  return (\\n    <div',
  insertImageFn + '\\n  return (\\n    <div'
);

// Add the button
const buttonHtml = `      <ToolBtn onClick={handleInsertImage} icon={<ImageIcon size={15} />} label={t.insertImage || "Insert Image"} />
      <Divider />
      <ToolBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} icon={<Eraser size={15} />} label={t.clearFormat} />`;

code = code.replace(
  '<ToolBtn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} icon={<Eraser size={15} />} label={t.clearFormat} />',
  buttonHtml
);

fs.writeFileSync('src/Toolbar.tsx', code);
