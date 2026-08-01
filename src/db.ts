import Dexie, { Table } from 'dexie';
import type { Project, PageFormat, Folder } from './types';

export interface AppSettings {
  id: string; // 'current'
  activeProjectId?: string;
  activePageId?: string;
  currentTheme?: string;
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  pageFormat?: PageFormat;
  isLeftPanelOpen?: boolean;
  isRightPanelOpen?: boolean;
  isFocusMode?: boolean;
  isPreviewMode?: boolean;
  language?: string;
  updatedAt?: string;
}

export class WritingAppDexieDB extends Dexie {
  projects!: Table<Project, string>;
  appSettings!: Table<AppSettings, string>;
  folders!: Table<Folder, string>;

  constructor() {
    super('KgvWritingAppDexieDB');
    
    this.version(1).stores({
      projects: 'id, title, lastModified',
      appSettings: 'id',
    });

    this.version(2).stores({
      projects: 'id, title, lastModified, folderId',
      appSettings: 'id',
      folders: 'id, name, isDeleted'
    });
  }
}

export const db = new WritingAppDexieDB();

export async function getAllProjectsFromDB(): Promise<Project[]> {
  try {
    return await db.projects.toArray();
  } catch (err) {
    console.warn('Error reading projects from Dexie:', err);
    return [];
  }
}

export async function getProjectFromDB(id: string): Promise<Project | undefined> {
  try {
    return await db.projects.get(id);
  } catch (err) {
    console.warn('Error reading project from Dexie:', err);
    return undefined;
  }
}

export async function saveProjectToDB(project: Project): Promise<void> {
  try {
    await db.projects.put({ ...project, lastModified: new Date().toISOString() });
  } catch (err) {
    console.warn('Error saving project to Dexie:', err);
  }
}

export async function deleteProjectFromDB(id: string): Promise<void> {
  try {
    await db.projects.delete(id);
  } catch (err) {
    console.warn('Error deleting project from Dexie:', err);
  }
}

export async function getAllFoldersFromDB(): Promise<Folder[]> {
  try {
    return await db.folders.toArray();
  } catch (err) {
    console.warn('Error reading folders from Dexie:', err);
    return [];
  }
}

export async function saveFolderToDB(folder: Folder): Promise<void> {
  try {
    await db.folders.put(folder);
  } catch (err) {
    console.warn('Error saving folder to Dexie:', err);
  }
}

export async function getAppSettings(): Promise<AppSettings | undefined> {
  try {
    return await db.appSettings.get('current');
  } catch (err) {
    console.warn('Error reading appSettings from Dexie:', err);
    return undefined;
  }
}

export async function saveAppSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const existing = (await db.appSettings.get('current')) || { id: 'current' };
    await db.appSettings.put({
      ...existing,
      ...settings,
      id: 'current',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Error saving appSettings to Dexie:', err);
  }
}
