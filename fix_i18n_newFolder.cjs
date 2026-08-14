const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');

const additions = {
  'fr': { newFolder: 'Nouveau dossier' },
  'de': { newFolder: 'Neuer Ordner' },
  'it': { newFolder: 'Nuova cartella' },
  'es': { newFolder: 'Nueva carpeta' },
  'ko': { newFolder: '새 폴더' },
  'zh': { newFolder: '新建文件夹' },
  'ja': { newFolder: '新しいフォルダー' }
};

for (const [lang, strings] of Object.entries(additions)) {
  code = code.replace(new RegExp(`(${lang}: \\{[\\s\\S]*?newProject:\\s*'[^']+',)`), `$1\n    newFolder: '${strings.newFolder}',`);
}

fs.writeFileSync('src/i18n.ts', code);
