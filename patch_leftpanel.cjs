const fs = require('fs');
let code = fs.readFileSync('src/LeftPanel.tsx', 'utf8');

// 1. timeSince
code = code.replace(/function timeSince\(date: Date\): string {/g, 'function timeSince(date: Date, lang: Lang): string {');
code = code.replace(/if \(seconds < 10\) return 'just now'/g, "if (seconds < 10) return i18nT(lang, 'justNow') || 'just now'");

// 2. update calls to timeSince
code = code.replace(/timeSince\(lastSaved\)/g, 'timeSince(lastSaved, lang)');
code = code.replace(/timeSince\(new Date\(page\.updatedAt \|\| Date\.now\(\)\)\)/g, 'timeSince(new Date(page.updatedAt || Date.now()), lang)');

// 3. New Document
code = code.replace(/<FileText size=\{12\} \/> New Document/g, "<FileText size={12} /> {t(lang, 'newDocument')?.replace('+', '').trim() || 'New Document'}");

// 4. Rename
code = code.replace(/<Edit2 size=\{12\} \/> Rename/g, "<Edit2 size={12} /> {t(lang, 'rename')}");

// 5. Delete
code = code.replace(/<Trash2 size=\{12\} \/> Delete/g, "<Trash2 size={12} /> {t(lang, 'delete')}");

// 6. No drafts / No pages yet
code = code.replace(/\{isDraftSection \? 'No drafts yet\. Click \+ to start one\.' : 'No pages yet\. Click \+ to create one\.'\}/g,
"{isDraftSection ? t(lang, 'noDraftsYet') : t(lang, 'noPagesYet')}");

// 7. Drop files here
code = code.replace(/Drop files here/g, "{t(lang, 'dropFilesHere')}");

// 8. Cloud Save & Sync
code = code.replace(/Cloud Save & Sync/g, "{t(lang, 'cloudSaveSync') || 'Cloud Save & Sync'}");

// 9. BIN
code = code.replace(/<Trash2 size=\{16\} \/> BIN/g, "<Trash2 size={16} /> {t(lang, 'bin')?.toUpperCase() || 'BIN'}");

// 10. No deleted items
code = code.replace(/No deleted items/g, "{t(lang, 'noDeletedItems') || 'No deleted items'}");

// 11. Delete Forever title
code = code.replace(/title="Delete Forever"/g, "title={t(lang, 'deleteForever') || 'Delete Forever'}");

// 12. Restore title
code = code.replace(/title="Restore"/g, "title={t(lang, 'restore') || 'Restore'}");

fs.writeFileSync('src/LeftPanel.tsx', code);
