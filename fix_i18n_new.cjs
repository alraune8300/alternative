const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');

const additions = {
  'fr': { newProject: 'Nouveau projet', newFolder: 'Nouveau dossier' },
  'de': { newProject: 'Neues Projekt', newFolder: 'Neuer Ordner' },
  'it': { newProject: 'Nuovo progetto', newFolder: 'Nuova cartella' },
  'es': { newProject: 'Nuevo proyecto', newFolder: 'Nueva carpeta' },
  'ko': { newProject: '새 프로젝트', newFolder: '새 폴더' },
  'zh': { newProject: '新项目', newFolder: '新建文件夹' },
  'ja': { newProject: '新しいプロジェクト', newFolder: '新しいフォルダー' }
};

// We know the language blocks are keyed. For example: `fr: {`
for (const [lang, strings] of Object.entries(additions)) {
  const regex = new RegExp(`${lang}: \\{[^}]*\\}`, 'g');
  // It's better to just inject after `newDocument:`
  code = code.replace(new RegExp(`(${lang}: \\{[\\s\\S]*?newDocument:\\s*'[^']+',)`), `$1\n    newProject: '${strings.newProject}',`);
}

fs.writeFileSync('src/i18n.ts', code);
