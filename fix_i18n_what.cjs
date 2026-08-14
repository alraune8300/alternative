const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');

const additions = {
  'fr': { whatAreWeWriting: "Qu'allons-nous écrire aujourd'hui ?" },
  'de': { whatAreWeWriting: 'Was schreiben wir heute?' },
  'it': { whatAreWeWriting: 'Cosa scriviamo oggi?' },
  'es': { whatAreWeWriting: '¿Qué vamos a escribir hoy?' },
  'ko': { whatAreWeWriting: '오늘은 무엇을 써볼까요?' },
  'zh': { whatAreWeWriting: '今天我们写点什么？' },
  'ja': { whatAreWeWriting: '今日は何を書きましょうか？' }
};

for (const [lang, strings] of Object.entries(additions)) {
  code = code.replace(new RegExp(`(${lang}: \\{[\\s\\S]*?newProject:\\s*'[^']+',)`), `$1\n    whatAreWeWriting: "${strings.whatAreWeWriting}",`);
}

fs.writeFileSync('src/i18n.ts', code);
