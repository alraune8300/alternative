const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');

const additions = {
  'en': { recently: 'Recently' },
  'vi': { recently: 'Gần đây' },
  'fr': { recently: 'Récemment' },
  'de': { recently: 'Kürzlich' },
  'it': { recently: 'Di recente' },
  'es': { recently: 'Recientemente' },
  'ko': { recently: '최근' },
  'zh': { recently: '最近' },
  'ja': { recently: '最近' }
};

code = code.replace(/whatAreWeWriting: string\n/, "whatAreWeWriting: string\n  recently: string\n");

for (const [lang, strings] of Object.entries(additions)) {
  code = code.replace(new RegExp(`(${lang}: \\{[\\s\\S]*?newFolder:\\s*'[^']+',)`), `$1\n    recently: '${strings.recently}',`);
}

fs.writeFileSync('src/i18n.ts', code);
