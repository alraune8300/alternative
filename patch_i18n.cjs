const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');

code = code.replace(
  "preview: 'Preview',",
  "preview: 'Preview',\\n    insertImage: 'Insert Image',\\n    imageTooLarge: 'Image size exceeds 25MB limit.',"
);

code = code.replace(
  "preview: 'Xem trước',",
  "preview: 'Xem trước',\\n    insertImage: 'Chèn ảnh',\\n    imageTooLarge: 'Kích thước ảnh vượt quá giới hạn 25MB.',"
);

fs.writeFileSync('src/i18n.ts', code);
