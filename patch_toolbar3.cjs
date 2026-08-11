const fs = require('fs');
let code = fs.readFileSync('src/Toolbar.tsx', 'utf8');

if (!code.includes("import { compressImage }")) {
  code = code.replace(
    "import { ResizableImage } from './tiptapExtensions';",
    "import { ResizableImage } from './tiptapExtensions';\nimport { compressImage } from './imageUtils';"
  );
  if (code === fs.readFileSync('src/Toolbar.tsx', 'utf8')) {
    // try finding another import
    code = code.replace(
      "import type { Dict } from './i18n';",
      "import type { Dict } from './i18n';\nimport { compressImage } from './imageUtils';"
    );
  }
}

const oldFn = `    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement)?.files?.[0];
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
    };`;

const newFn = `    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement)?.files?.[0];
      if (!file) return;
      if (file.size > 25 * 1024 * 1024) {
        alert(t.imageTooLarge || 'Image size exceeds 25MB limit.');
        return;
      }
      try {
        const compressedBase64 = await compressImage(file);
        editor.chain().focus().setImage({ src: compressedBase64 }).run();
      } catch (err) {
        console.error('Failed to compress image:', err);
      }
    };`;

code = code.replace(oldFn, newFn);
fs.writeFileSync('src/Toolbar.tsx', code);
