const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');

const additions = {
  'fr': { active: 'Actif', trash: 'Corbeille', new: 'Nouveau' },
  'de': { active: 'Aktiv', trash: 'Papierkorb', new: 'Neu' },
  'it': { active: 'Attivi', trash: 'Cestino', new: 'Nuovo' },
  'es': { active: 'Activo', trash: 'Papelera', new: 'Nuevo' },
  'ko': { active: '활성', trash: '휴지통', new: '새로 만들기' },
  'zh': { active: '进行中', trash: '回收站', new: '新建' },
  'ja': { active: 'アクティブ', trash: 'ゴミ箱', new: '新規' }
};

for (const [lang, strings] of Object.entries(additions)) {
  code = code.replace(new RegExp(`(${lang}: \\{[\\s\\S]*?newFolder:\\s*'[^']+',)`), `$1\n    active: '${strings.active}',\n    trash: '${strings.trash}',\n    new: '${strings.new}',`);
}

fs.writeFileSync('src/i18n.ts', code);
