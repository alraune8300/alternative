const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf8');

const correctVersions = `    this.version(1).stores({
      projects: 'id, title, lastModified',
      appSettings: 'id',
    });
    this.version(2).stores({
      projects: 'id, title, lastModified, folderId',
      appSettings: 'id',
      folders: 'id, name, isDeleted'
    });
    this.version(3).stores({
      projects: 'id, title, lastModified, folderId',
      appSettings: 'id',
      folders: 'id, name, isDeleted',
      versions: 'id, pageId, timestamp'
    });`;

// Remove everything between this.version(1) and the end of the constructor
code = code.replace(/this\.version\(1\)\.stores\({[\s\S]*?}\);[\s\S]*?}\s*}\s*export const db/, correctVersions + "\n  }\n}\n\nexport const db");

fs.writeFileSync('src/db.ts', code);
