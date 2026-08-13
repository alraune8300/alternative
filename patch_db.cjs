const fs = require('fs');
let code = fs.readFileSync('src/db.ts', 'utf8');

if (!code.includes('versions!: Table<VersionSnapshot, string>;')) {
  code = code.replace(
    "import type { Project, PageFormat, Folder } from './types';",
    "import type { Project, PageFormat, Folder, VersionSnapshot } from './types';"
  );

  code = code.replace(
    "folders!: Table<Folder, string>;",
    "folders!: Table<Folder, string>;\n  versions!: Table<VersionSnapshot, string>;"
  );

  code = code.replace(
    "this.version(2).stores({",
    "this.version(2).stores({\n      projects: 'id, title, lastModified, folderId',\n      appSettings: 'id',\n      folders: 'id, name, isDeleted'\n    });\n    this.version(3).stores({\n      projects: 'id, title, lastModified, folderId',\n      appSettings: 'id',\n      folders: 'id, name, isDeleted',\n      versions: 'id, pageId, timestamp'\n    });\n\n    /* replaced this.version(2) block */\n    // this.version(2).stores({"
  );

  code += `\n
export async function getPageVersionsFromDB(pageId: string): Promise<VersionSnapshot[]> {
  try {
    return await db.versions.where('pageId').equals(pageId).sortBy('timestamp');
  } catch (err) {
    console.warn('Error reading versions from Dexie:', err);
    return [];
  }
}

export async function savePageVersionToDB(version: VersionSnapshot): Promise<void> {
  try {
    await db.versions.put(version);
  } catch (err) {
    console.warn('Error saving version to Dexie:', err);
  }
}

export async function deletePageVersionFromDB(id: string): Promise<void> {
  try {
    await db.versions.delete(id);
  } catch (err) {
    console.warn('Error deleting version from Dexie:', err);
  }
}
`;
  fs.writeFileSync('src/db.ts', code);
}
