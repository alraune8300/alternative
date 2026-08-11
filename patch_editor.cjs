const fs = require('fs');
let code = fs.readFileSync('src/Editor.tsx', 'utf8');

code = code.replace(
  "import Subscript from '@tiptap/extension-subscript';",
  "import Subscript from '@tiptap/extension-subscript';\\nimport Image from '@tiptap/extension-image';"
);

code = code.replace(
  "TextStyle, FontFamily, FontSize, LineHeight, TextTransform, FontFeatures, LetterSpacing, WordSpacing, Superscript, Subscript, IndentExtension,",
  "TextStyle, FontFamily, FontSize, LineHeight, TextTransform, FontFeatures, LetterSpacing, WordSpacing, Superscript, Subscript, IndentExtension, Image,"
);

fs.writeFileSync('src/Editor.tsx', code);
