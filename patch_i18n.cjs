const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');

const replacements = [
  { match: /emptyBin: string\n/, replace: "emptyBin: string\n  cloudSaveSync: string\n  justNow: string\n" },
  { match: /emptyBin: 'Empty bin',\n/, replace: "emptyBin: 'Empty bin',\n    cloudSaveSync: 'Cloud Save & Sync',\n    justNow: 'just now',\n" },
  { match: /emptyBin: 'Làm trống thùng rác',\n/, replace: "emptyBin: 'Làm trống thùng rác',\n    cloudSaveSync: 'Lưu & Đồng bộ Đám mây',\n    justNow: 'vừa xong',\n" },
  { match: /emptyBin: 'Vider la corbeille',\n/, replace: "emptyBin: 'Vider la corbeille',\n    cloudSaveSync: 'Sauvegarde et synchro',\n    justNow: 'à l\\'instant',\n" },
  { match: /emptyBin: 'Papierkorb leeren',\n/, replace: "emptyBin: 'Papierkorb leeren',\n    cloudSaveSync: 'Cloud-Speicherung & Sync',\n    justNow: 'gerade eben',\n" },
  { match: /emptyBin: 'Svuota cestino',\n/, replace: "emptyBin: 'Svuota cestino',\n    cloudSaveSync: 'Salvataggio Cloud & Sincronizzazione',\n    justNow: 'proprio ora',\n" },
  { match: /emptyBin: 'Vaciar papelera',\n/, replace: "emptyBin: 'Vaciar papelera',\n    cloudSaveSync: 'Guardar y sincronizar en la nube',\n    justNow: 'hace un momento',\n" },
  { match: /emptyBin: '휴지통 비우기',\n/, replace: "emptyBin: '휴지통 비우기',\n    cloudSaveSync: '클라우드 저장 및 동기화',\n    justNow: '방금',\n" },
  { match: /emptyBin: '清空回收站',\n/, replace: "emptyBin: '清空回收站',\n    cloudSaveSync: '云端保存与同步',\n    justNow: '刚刚',\n" },
  { match: /emptyBin: 'ゴミ箱を空にする',\n/, replace: "emptyBin: 'ゴミ箱を空にする',\n    cloudSaveSync: 'クラウド保存と同期',\n    justNow: 'たった今',\n" }
];

for (const rep of replacements) {
  code = code.replace(rep.match, rep.replace);
}
fs.writeFileSync('src/i18n.ts', code);
