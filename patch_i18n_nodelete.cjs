const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');

const replacements = [
  { match: /cloudSaveSync: string\n/, replace: "cloudSaveSync: string\n  noDeletedItems: string\n" },
  { match: /cloudSaveSync: 'Cloud Save & Sync',\n/, replace: "cloudSaveSync: 'Cloud Save & Sync',\n    noDeletedItems: 'No deleted items',\n" },
  { match: /cloudSaveSync: 'Lưu & Đồng bộ Đám mây',\n/, replace: "cloudSaveSync: 'Lưu & Đồng bộ Đám mây',\n    noDeletedItems: 'Không có mục nào đã xóa',\n" },
  { match: /cloudSaveSync: 'Sauvegarde et synchro',\n/, replace: "cloudSaveSync: 'Sauvegarde et synchro',\n    noDeletedItems: 'Aucun élément supprimé',\n" },
  { match: /cloudSaveSync: 'Cloud-Speicherung & Sync',\n/, replace: "cloudSaveSync: 'Cloud-Speicherung & Sync',\n    noDeletedItems: 'Keine gelöschten Elemente',\n" },
  { match: /cloudSaveSync: 'Salvataggio Cloud & Sincronizzazione',\n/, replace: "cloudSaveSync: 'Salvataggio Cloud & Sincronizzazione',\n    noDeletedItems: 'Nessun elemento eliminato',\n" },
  { match: /cloudSaveSync: 'Guardar y sincronizar en la nube',\n/, replace: "cloudSaveSync: 'Guardar y sincronizar en la nube',\n    noDeletedItems: 'No hay elementos eliminados',\n" },
  { match: /cloudSaveSync: '클라우드 저장 및 동기화',\n/, replace: "cloudSaveSync: '클라우드 저장 및 동기화',\n    noDeletedItems: '삭제된 항목 없음',\n" },
  { match: /cloudSaveSync: '云端保存与同步',\n/, replace: "cloudSaveSync: '云端保存与同步',\n    noDeletedItems: '没有已删除的项目',\n" },
  { match: /cloudSaveSync: 'クラウド保存と同期',\n/, replace: "cloudSaveSync: 'クラウド保存と同期',\n    noDeletedItems: '削除されたアイテムはありません',\n" }
];

for (const rep of replacements) {
  code = code.replace(rep.match, rep.replace);
}
fs.writeFileSync('src/i18n.ts', code);
