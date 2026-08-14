const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');

const replacements = [
  { match: /noDeletedItems: 'Aucun élément supprimé',\n/, replace: "noDeletedItems: 'Aucun élément supprimé',\n    trashIsEmpty: 'La corbeille est vide.',\n" },
  { match: /noDeletedItems: 'Keine gelöschten Elemente',\n/, replace: "noDeletedItems: 'Keine gelöschten Elemente',\n    trashIsEmpty: 'Der Papierkorb ist leer.',\n" },
  { match: /noDeletedItems: 'Nessun elemento eliminato',\n/, replace: "noDeletedItems: 'Nessun elemento eliminato',\n    trashIsEmpty: 'Il cestino è vuoto.',\n" },
  { match: /noDeletedItems: 'No hay elementos eliminados',\n/, replace: "noDeletedItems: 'No hay elementos eliminados',\n    trashIsEmpty: 'La papelera está vacía.',\n" },
  { match: /noDeletedItems: '삭제된 항목 없음',\n/, replace: "noDeletedItems: '삭제된 항목 없음',\n    trashIsEmpty: '휴지통이 비어 있습니다.',\n" },
  { match: /noDeletedItems: '没有已删除的项目',\n/, replace: "noDeletedItems: '没有已删除的项目',\n    trashIsEmpty: '回收站为空。',\n" },
  { match: /noDeletedItems: '削除されたアイテムはありません',\n/, replace: "noDeletedItems: '削除されたアイテムはありません',\n    trashIsEmpty: 'ゴミ箱は空です。',\n" }
];

for (const rep of replacements) {
  code = code.replace(rep.match, rep.replace);
}
fs.writeFileSync('src/i18n.ts', code);
