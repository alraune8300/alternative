const fs = require('fs');
let code = fs.readFileSync('src/i18n.ts', 'utf8');

const enInsert = `  imageTooLarge: 'Image size exceeds 25MB limit.',
  versionHistory: 'Version History',
  createSnapshot: 'Create Snapshot',
  createNewSnapshot: 'Create New Snapshot',
  snapshotLabelPlaceholder: 'E.g., Before rewrite...',
  confirmDeleteVersion: 'Are you sure you want to delete this snapshot?',
  restoreThisVersion: 'Restore',
  noVersionsFound: 'No snapshots yet.',`;
code = code.replace("  imageTooLarge: 'Image size exceeds 25MB limit.',", enInsert);

const viInsert = `  imageTooLarge: 'Kích thước ảnh vượt quá giới hạn 25MB.',
  versionHistory: 'Lịch sử phiên bản',
  createSnapshot: 'Tạo bản sao lưu',
  createNewSnapshot: 'Tạo bản sao lưu mới',
  snapshotLabelPlaceholder: 'Ví dụ: Trước khi viết lại...',
  confirmDeleteVersion: 'Bạn có chắc chắn muốn xoá bản sao lưu này?',
  restoreThisVersion: 'Khôi phục',
  noVersionsFound: 'Chưa có bản sao lưu nào.',`;
code = code.replace("  imageTooLarge: 'Kích thước ảnh vượt quá giới hạn 25MB.',", viInsert);

fs.writeFileSync('src/i18n.ts', code);
