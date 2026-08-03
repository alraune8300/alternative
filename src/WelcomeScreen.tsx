import React, { useState, useEffect, useCallback } from 'react';
import { FileText, FolderOpen, Plus, Download, Upload, Grid, List, Trash2, Edit2, Check, X, RotateCcw, Home, AlertCircle, Search, ArrowUpDown, FileJson } from 'lucide-react';
import { format } from 'date-fns';
import { Project, ThemeColors, Folder } from './types';
import { db, getAllProjectsFromDB, saveProjectToDB, deleteProjectFromDB, getAllFoldersFromDB, saveFolderToDB } from './db';
import { exportToJsonBackup, importJsonBackupFile } from './fileHandlers';
import { Lang, t } from './i18n';

interface WelcomeScreenProps {
  theme: ThemeColors;
  uiFont: string;
  lang?: Lang;
  onOpenProject: (projectId: string, pageId?: string) => void;
  onImport: () => void;
  onExportAll: () => void;
  onOpenGithubCloudSave?: () => void;
  onEmptyAllTrash?: () => Promise<void> | void;
  onReloadProjects?: () => Promise<void> | void;
  refreshTrigger?: number;
}

type SortOption = 'updated' | 'newest' | 'oldest' | 'nameAZ' | 'nameZA' | 'pages';

function WelcomeScreen({ theme, uiFont, lang = 'vi', onOpenProject, onImport, onExportAll, onOpenGithubCloudSave, onEmptyAllTrash, onReloadProjects, refreshTrigger }: WelcomeScreenProps) {
    
  const [projects, setProjects] = useState<Project[]>([]);
  const activeProjects = projects.filter(p => !p.isDeleted);
  const trashedProjects = projects.filter(p => p.isDeleted);
  const [folders, setFolders] = useState<Folder[]>([]);
  const activeFolders = folders.filter(f => !f.isDeleted);
  const trashedFolders = folders.filter(f => f.isDeleted);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [tab, setTab] = useState<'active' | 'trash'>('active');
  const [timeGreeting, setTimeGreeting] = useState('');
  
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('updated');
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ isOpen: boolean; type: 'project' | 'folder' | null; id: string | null; name: string }>({
    isOpen: false,
    type: null,
    id: null,
    name: ''
  });

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  const loadData = useCallback(async () => {
    const projs = await getAllProjectsFromDB();
    const flds = await getAllFoldersFromDB();
    setProjects(projs);
    setFolders(flds);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting('Good morning');
    else if (hour < 18) setTimeGreeting('Good afternoon');
    else setTimeGreeting('Good evening');
  }, []);

  const handleSoftDeleteProject = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    await saveProjectToDB({ 
      ...project, 
      isDeleted: true, 
      deletedAt: new Date().toISOString() 
    });
    loadData();
  };

  const handleRestoreProject = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    await saveProjectToDB({ 
      ...project, 
      isDeleted: false, 
      deletedAt: null 
    });
    loadData();
  };

  const handleSoftDeleteFolder = async (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    await saveFolderToDB({
      ...folder,
      isDeleted: true,
      deletedAt: new Date().toISOString()
    });
    loadData();
  };

  const handleRestoreFolder = async (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    await saveFolderToDB({
      ...folder,
      isDeleted: false,
      deletedAt: null
    });
    loadData();
  };

  const promptHardDelete = (type: 'project' | 'folder', id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmDialog({ isOpen: true, type, id, name });
  };

  const executeHardDelete = async () => {
    const { type, id } = deleteConfirmDialog;
    if (!type || !id) return;

    if (type === 'project') {
      await deleteProjectFromDB(id);
    } else if (type === 'folder') {
      await db.transaction('rw', [db.folders, db.projects], async () => {
        await db.folders.delete(id);
        await db.projects.where('folderId').equals(id).delete();
      });
    }
    
    setDeleteConfirmDialog({ isOpen: false, type: null, id: null, name: '' });
    loadData();
  };

  const handleEmptyAllTrash = async () => {
    if (onEmptyAllTrash) {
      await onEmptyAllTrash();
      await loadData();
    }
  };

  const handleStartEditProject = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProjectId(id);
    setEditingFolderId(null);
    setEditName(currentName);
  };

  const handleStartEditFolder = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(id);
    setEditingProjectId(null);
    setEditName(currentName);
  };

  const handleSaveEditProject = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editName.trim()) {
      await saveProjectToDB({ ...project, title: editName.trim() });
      loadData();
    }
    setEditingProjectId(null);
  };

  const handleSaveEditFolder = async (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editName.trim()) {
      await saveFolderToDB({ ...folder, name: editName.trim() });
      loadData();
    }
    setEditingFolderId(null);
  };

  const handleNewProject = async () => {
    const newProj: Project = {
      id: 'proj-' + Date.now(),
      title: 'New Project',
      pages: [{
        id: 'page-' + Date.now(),
        title: 'Untitled Document',
        content: '<p></p>',
        isDraft: false,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }],
      drafts: [],
      folders: [],
      bin: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      isDeleted: false,
      folderId: currentFolderId,
    };
    await saveProjectToDB(newProj);
    await loadData();
    if (onReloadProjects) await onReloadProjects();
    onOpenProject(newProj.id, newProj.pages[0].id);
  };

  const handleNewFolder = async () => {
    const newFld: Folder = {
      id: 'fld-' + Date.now(),
      name: 'New Folder',
      parentId: currentFolderId || undefined,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };
    await saveFolderToDB(newFld);
    await loadData();
  };

  
  const getBreadcrumbs = () => {
    const crumbs = [];
    let curr = currentFolderId;
    while (curr) {
      const f = folders.find(x => x.id === curr);
      if (f) {
        crumbs.unshift(f);
        curr = f.parentId || null;
      } else {
        break;
      }
    }
    return crumbs;
  };
  const breadcrumbs = getBreadcrumbs();

  const handleExportBackupJson = () => {
    exportToJsonBackup(projects, folders);
    setToastMsg({ text: t(lang, 'backupExport'), type: 'success' });
  };

  const handleImportBackupJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        try {
          await importJsonBackupFile(file);
          await loadData();
          setToastMsg({ text: t(lang, 'backupSuccess'), type: 'success' });
        } catch (err) {
          console.error('Import backup error:', err);
          setToastMsg({ text: t(lang, 'backupError'), type: 'error' });
        }
      }
    };
    input.click();
  };

  const filteredProjects = (tab === 'active' ? activeProjects : trashedProjects).filter(p => {
    const matchesFolder = (p.folderId || null) === currentFolderId;
    const matchesSearch = !searchQuery.trim() || 
      (p.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.pages || []).some(page => (page.title || '').toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  const displayedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'updated') {
      return new Date(b.lastModified || b.createdAt || 0).getTime() - new Date(a.lastModified || a.createdAt || 0).getTime();
    }
    if (sortBy === 'newest') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortBy === 'nameAZ') {
      return (a.title || 'Untitled').localeCompare(b.title || 'Untitled', undefined, { sensitivity: 'base' });
    }
    if (sortBy === 'nameZA') {
      return (b.title || 'Untitled').localeCompare(a.title || 'Untitled', undefined, { sensitivity: 'base' });
    }
    if (sortBy === 'pages') {
      const countA = (a.pages?.length || 0) + (a.drafts?.length || 0);
      const countB = (b.pages?.length || 0) + (b.drafts?.length || 0);
      return countB - countA;
    }
    return 0;
  });

  const filteredFolders = (tab === 'active' ? activeFolders : trashedFolders).filter(f => {
    const matchesFolder = (f.parentId || null) === currentFolderId;
    const matchesSearch = !searchQuery.trim() || (f.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const displayedFolders = [...filteredFolders].sort((a, b) => {
    if (sortBy === 'nameAZ') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'nameZA') return (b.name || '').localeCompare(a.name || '');
    return 0;
  });

  return (
    <div 
      className="h-full w-full flex flex-col md:flex-row transition-all duration-500 ease-in-out font-sans relative overflow-hidden" 
      style={{ 
        background: theme.bg, 
        color: theme.text, 
        fontFamily: `'${uiFont}', 'Inter', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif` 
      }}
    >
      {/* Delete Confirmation Modal */}
      {deleteConfirmDialog.isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
          <div className="p-6 rounded-2xl shadow-xl flex flex-col gap-5 animate-fade-in-up" style={{ backgroundColor: theme.surface, border: `1px solid ${theme.border}` }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full text-red-500" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <AlertCircle size={20} strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: theme.text }}>{t(lang, 'deleteConfirmTitle')}</h3>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>{t(lang, 'deleteConfirmDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 mt-2">
              <button 
                onClick={() => setDeleteConfirmDialog({ isOpen: false, type: null, id: null, name: '' })}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{ color: theme.textMuted,   }}
              >
                {t(lang, 'cancel')}
              </button>
              <button 
                onClick={executeHardDelete}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors hover:bg-red-600 bg-red-500"
              >
                {t(lang, 'confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Sidebar Navigation (Responsive: Header bar on mobile, left column on md+) */}
      <div 
        className="w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col pt-4 md:pt-12 px-4 sm:px-6 pb-4 md:pb-6 border-b md:border-b-0 md:border-r items-center md:items-start justify-between md:justify-between gap-3"
        style={{ borderColor: theme.borderFaint, backgroundColor: theme.surface }}
      >
        <div className="flex flex-row md:flex-col items-center md:items-start gap-3 md:gap-10 w-full">
          <div className="mb-0 md:mb-0 px-0 md:px-2">
            <h2 className="text-lg md:text-xl font-medium tracking-tight" style={{ color: theme.text }}>{t(lang, 'workspace')}</h2>
          </div>

          <nav className="flex flex-row md:flex-col gap-2 w-full">
            <button 
              onClick={() => setTab('active')} 
              className="flex items-center gap-2 md:gap-3 px-3 py-1.5 md:py-2.5 rounded-lg transition-all border"
              style={{ 
                backgroundColor: tab === 'active' ? theme.accentLight : 'transparent',
                borderColor: tab === 'active' ? theme.border : 'transparent',
                color: tab === 'active' ? theme.text : theme.textMuted
              }}
            >
              <Home size={16} strokeWidth={tab === 'active' ? 2 : 1.5} />
              <span className="font-medium text-xs md:text-sm">{t(lang, 'active')}</span>
            </button>
            
            <button 
              onClick={() => setTab('trash')} 
              className="flex items-center gap-2 md:gap-3 px-3 py-1.5 md:py-2.5 rounded-lg transition-all border"
              style={{ 
                backgroundColor: tab === 'trash' ? theme.accentLight : 'transparent',
                borderColor: tab === 'trash' ? theme.border : 'transparent',
                color: tab === 'trash' ? theme.text : theme.textMuted
              }}
            >
              <Trash2 size={16} strokeWidth={tab === 'trash' ? 2 : 1.5} />
              <span className="font-medium text-xs md:text-sm">{t(lang, 'trash')}</span>
            </button>
          </nav>
        </div>

        {/* GitHub Cloud Save UI in bottom left area */}
        {onOpenGithubCloudSave && (
          <div className="w-full pt-4 mt-auto border-t" style={{ borderColor: theme.borderFaint }}>
            <span className="text-[10px] font-semibold uppercase tracking-wider block mb-2 opacity-60 hidden md:block" style={{ color: theme.textFaint }}>
              {t(lang, 'githubCloudSaveTitle')}
            </span>
            <button
              onClick={onOpenGithubCloudSave}
              className="w-full px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.surface,
                color: theme.text,
                fontFamily: uiFont,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.backgroundColor = theme.panel; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.backgroundColor = theme.surface; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span>{t(lang, 'cloudSave')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto w-full min-w-0">
        {/* Header / Greeting */}
        <div className="w-full max-w-5xl flex flex-col items-start gap-3 mt-4 mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight" style={{ color: theme.text }}>
            {timeGreeting},
          </h1>
          <p className="text-xl font-light" style={{ color: theme.textFaint }}>
            {t(lang, 'whatAreWeWriting')}
          </p>
        </div>

        {/* Quick Actions & Navigation Toolbar */}
        <div className="w-full max-w-5xl flex flex-col gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* Row 1: Primary creation & quick buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center flex-wrap gap-2.5">
              <button 
                onClick={handleNewProject} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer font-medium text-xs tracking-wide shadow-sm hover:shadow"
                style={{ 
                  borderColor: theme.border, 
                  backgroundColor: theme.surface, 
                  color: theme.text 
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.panel; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.surface; }}
              >
                <Plus size={15} strokeWidth={1.5} />
                <span>{t(lang, 'newProject')}</span>
              </button>

              <button 
                onClick={handleNewFolder} 
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all cursor-pointer font-medium text-xs"
                style={{ 
                  borderColor: theme.borderFaint, 
                  backgroundColor: theme.surface, 
                  color: theme.textMuted 
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.panel; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.surface; }}
              >
                <FolderOpen size={15} strokeWidth={1.5} />
                <span>{t(lang, 'newFolder')}</span>
              </button>

              <div className="h-4 w-[1px] mx-1" style={{ backgroundColor: theme.borderFaint }} />

              <button 
                onClick={onImport} 
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer text-xs" 
                title={t(lang, 'importDocumentBtn')}
                style={{ borderColor: theme.borderFaint, backgroundColor: theme.surface, color: theme.textMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.panel; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.surface; }}
              >
                <Upload size={14} strokeWidth={1.5} />
                <span className="hidden sm:inline">{t(lang, 'importDocumentBtn')}</span>
              </button>

              <button 
                onClick={onExportAll} 
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer text-xs" 
                title={t(lang, 'exportDocumentsBtn')}
                style={{ borderColor: theme.borderFaint, backgroundColor: theme.surface, color: theme.textMuted }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.panel; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.surface; }}
              >
                <Download size={14} strokeWidth={1.5} />
                <span className="hidden sm:inline">{t(lang, 'exportDocumentsBtn')}</span>
              </button>
            </div>

            {/* JSON Backup Buttons */}
            <div className="flex items-center gap-1.5 border rounded-xl p-1 shadow-sm" style={{ backgroundColor: theme.surface, borderColor: theme.borderFaint }}>
              <button 
                onClick={handleExportBackupJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                style={{ color: theme.text }}
                title={t(lang, 'quickExportBackup')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.panel}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <FileJson size={14} className="text-amber-500" />
                <span>{t(lang, 'backupExport')}</span>
              </button>
              <div className="w-[1px] h-4" style={{ backgroundColor: theme.borderFaint }} />
              <button 
                onClick={handleImportBackupJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                style={{ color: theme.text }}
                title={t(lang, 'quickImportBackup')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.panel}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Upload size={14} className="text-emerald-500" />
                <span>{t(lang, 'backupImport')}</span>
              </button>
            </div>
          </div>

          {/* Row 2: Search input, Sort selector & View Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: theme.borderFaint }}>
            {/* Search Input */}
            <div className="flex-1 min-w-[220px] max-w-md relative flex items-center">
              <Search size={14} className="absolute left-3 pointer-events-none" style={{ color: theme.textFaint }} />
              <input 
                type="text"
                placeholder={t(lang, 'searchProjects')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 rounded-xl text-xs border outline-none transition-all"
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.borderFaint,
                  color: theme.text,
                }}
                onFocus={(e) => e.target.style.borderColor = theme.accent}
                onBlur={(e) => e.target.style.borderColor = theme.borderFaint}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-xs p-1 rounded-full hover:opacity-80"
                  style={{ color: theme.textMuted }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Sort & View Mode controls */}
            <div className="flex items-center gap-2">
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs" style={{ backgroundColor: theme.surface, borderColor: theme.borderFaint }}>
                <ArrowUpDown size={13} style={{ color: theme.textFaint }} />
                <span className="text-[11px] font-medium hidden sm:inline" style={{ color: theme.textMuted }}>{t(lang, 'sortBy')}:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-transparent text-xs outline-none cursor-pointer font-medium"
                  style={{ color: theme.text }}
                >
                  <option value="updated" style={{ backgroundColor: theme.surface, color: theme.text }}>{t(lang, 'sortUpdated')}</option>
                  <option value="newest" style={{ backgroundColor: theme.surface, color: theme.text }}>{t(lang, 'sortNewest')}</option>
                  <option value="oldest" style={{ backgroundColor: theme.surface, color: theme.text }}>{t(lang, 'sortOldest')}</option>
                  <option value="nameAZ" style={{ backgroundColor: theme.surface, color: theme.text }}>{t(lang, 'sortNameAZ')}</option>
                  <option value="nameZA" style={{ backgroundColor: theme.surface, color: theme.text }}>{t(lang, 'sortNameZA')}</option>
                  <option value="pages" style={{ backgroundColor: theme.surface, color: theme.text }}>{t(lang, 'sortPagesCount')}</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 rounded-xl p-1 border" style={{ backgroundColor: theme.surface, borderColor: theme.borderFaint }}>
                <button 
                  onClick={() => setViewMode('grid')} 
                  className="p-1.5 rounded-lg transition-all cursor-pointer"
                  title={t(lang, 'viewGrid')}
                  style={{ 
                    backgroundColor: viewMode === 'grid' ? theme.bg : 'transparent',
                    color: viewMode === 'grid' ? theme.text : theme.textFaint
                  }}
                >
                  <Grid size={15} strokeWidth={1.5} />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className="p-1.5 rounded-lg transition-all cursor-pointer"
                  title={t(lang, 'viewList')}
                  style={{ 
                    backgroundColor: viewMode === 'list' ? theme.bg : 'transparent',
                    color: viewMode === 'list' ? theme.text : theme.textFaint
                  }}
                >
                  <List size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        {tab === 'active' && currentFolderId !== null && (
          <div className="w-full max-w-5xl mb-4 flex items-center gap-2 text-sm" style={{ color: theme.textMuted }}>
            <button onClick={() => setCurrentFolderId(null)} className="hover:underline">{t(lang, 'home')}</button>
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={b.id}>
                <span>/</span>
                <button 
                  onClick={() => setCurrentFolderId(b.id)}
                  className={`hover:underline ${i === breadcrumbs.length - 1 ? 'font-medium' : ''}`}
                  style={{ color: i === breadcrumbs.length - 1 ? theme.text : theme.textMuted }}
                >
                  {b.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
        {tab === 'trash' && (trashedProjects.length > 0 || trashedFolders.length > 0) && (
          <div className="w-full max-w-5xl mb-4 flex items-center justify-between p-3 rounded-xl border animate-fade-in-up" style={{ backgroundColor: theme.surface, borderColor: theme.borderFaint }}>
            <span className="text-xs font-medium" style={{ color: theme.textMuted }}>
              {t(lang, 'deletedItems')} ({trashedProjects.length + trashedFolders.length})
            </span>
            <button
              onClick={handleEmptyAllTrash}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold text-red-500 hover:bg-red-500/10 cursor-pointer transition-all"
              style={{ borderColor: theme.borderFaint }}
            >
              <Trash2 size={13} />
              <span>{t(lang, 'emptyBin')}</span>
            </button>
          </div>
        )}

        {/* Projects / Files Grid */}
        <div className="w-full max-w-5xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {displayedProjects.length === 0 && displayedFolders.length === 0 ? (
            <div 
              className="w-full py-24 flex flex-col items-center justify-center border border-dashed rounded-2xl"
              style={{ borderColor: theme.border, backgroundColor: theme.surface }}
            >
              <FileText size={32} className="mb-4" strokeWidth={1.5} style={{ color: theme.textFaint }} />
              <p className="font-light text-sm" style={{ color: theme.textMuted }}>
                {tab === 'active' ? t(lang, 'noProjectsFound') : t(lang, 'trashIsEmpty')}
              </p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'flex flex-col gap-2'}>
              
              {/* Render Folders First */}
              {displayedFolders.map((folder) => (
                <div 
                  key={folder.id}
                  onClick={() => tab === 'active' && setCurrentFolderId(folder.id)}
                  className={`group relative flex flex-col justify-center px-4 py-3 rounded-md border transition-colors ${tab === 'active' ? 'cursor-pointer hover:-translate-y-0.5 shadow-sm' : ''}`}
                  style={{ 
                    backgroundColor: 'transparent',
                    borderColor: theme.borderFaint
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.surface;
                    e.currentTarget.style.borderColor = theme.border;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = theme.borderFaint;
                  }}
                >
                  <div className="flex items-center space-x-2 w-full pr-14">
                    <div className="flex-shrink-0" style={{ color: theme.textMuted }}>
                      <FolderOpen size={16} strokeWidth={1.5} />
                    </div>

                    <div className="flex-1 min-w-0 flex items-center">
                      {editingFolderId === folder.id && tab === 'active' ? (
                        <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-transparent border-b outline-none px-1 py-0.5 text-sm font-medium"
                            style={{ borderColor: theme.accent, color: theme.text }}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEditFolder(folder, e as unknown as React.MouseEvent)}
                          />
                          <button onClick={(e) => handleSaveEditFolder(folder, e)} className="p-1 rounded text-green-500 hover:bg-green-500/10 transition-colors cursor-pointer"><Check size={14}/></button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingFolderId(null); }} className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"><X size={14}/></button>
                        </div>
                      ) : (
                        <h3 className="text-sm font-medium tracking-wide truncate" style={{ color: theme.text }}>
                          {folder.name || 'Untitled Folder'}
                        </h3>
                      )}
                    </div>
                  </div>

                  {/* Actions (Always visible) */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {tab === 'active' ? (
                      <>
                        <button onClick={(e) => handleStartEditFolder(folder.id, folder.name, e)} className="p-1.5 rounded-md hover:bg-neutral-500/10 transition-colors cursor-pointer" style={{ color: theme.textMuted }} title="Rename">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={(e) => handleSoftDeleteFolder(folder, e)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer" title="Move to Trash">
                          <Trash2 size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => handleRestoreFolder(folder, e)} className="p-1.5 rounded-md hover:bg-neutral-500/10 transition-colors cursor-pointer" style={{ color: theme.textMuted }} title="Restore">
                          <RotateCcw size={13} />
                        </button>
                        <button onClick={(e) => promptHardDelete('folder', folder.id, folder.name, e)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer" title="Permanently Delete">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Render Projects */}
              {displayedProjects.map((project) => (
                <div 
                  key={project.id}
                  onClick={() => tab === 'active' && onOpenProject(project.id)}
                  className={`group relative flex flex-col justify-center px-4 py-3 rounded-md border transition-colors ${tab === 'active' ? 'cursor-pointer hover:-translate-y-0.5 shadow-sm' : ''}`}
                  style={{ 
                    backgroundColor: 'transparent',
                    borderColor: theme.borderFaint
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.surface;
                    e.currentTarget.style.borderColor = theme.border;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = theme.borderFaint;
                  }}
                >
                  {/* Single Stream Line: Icon + Title */}
                  <div className="flex items-center space-x-2 w-full pr-14">
                    <div className="flex-shrink-0" style={{ color: theme.textFaint }}>
                      <FileText size={14} strokeWidth={1.5} />
                    </div>

                    <div className="flex-1 min-w-0 flex items-center">
                      {editingProjectId === project.id && tab === 'active' ? (
                        <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="text" 
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-transparent border-b outline-none px-1 py-0.5 text-sm font-medium"
                            style={{ borderColor: theme.accent, color: theme.text }}
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEditProject(project, e as unknown as React.MouseEvent)}
                          />
                          <button onClick={(e) => handleSaveEditProject(project, e)} className="p-1 rounded text-green-500 hover:bg-green-500/10 transition-colors cursor-pointer"><Check size={14}/></button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingProjectId(null); }} className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"><X size={14}/></button>
                        </div>
                      ) : (
                        <h3 className="text-sm font-medium tracking-wide truncate" style={{ color: theme.text }}>
                          {project.title || t(lang, 'untitledProject')}
                        </h3>
                      )}
                    </div>
                  </div>

                  {/* Sub-Metadata Line */}
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-light tracking-wider uppercase ml-6" style={{ color: theme.textFaint }}>
                    <span>{project.pages.length} {project.pages.length === 1 ? t(lang, 'pageSingular') : t(lang, 'pagePlural')}</span>
                    <span>•</span>
                    <span>{format(new Date(project.lastModified || project.createdAt || Date.now()), 'MMM d, yyyy')}</span>
                  </div>

                  {/* Content Snippet */}
                  {viewMode === 'grid' && project.pages[0] && tab === 'active' && (
                    <div className="mt-3 pt-3 border-t text-xs font-light leading-relaxed line-clamp-3" style={{ borderColor: theme.borderFaint, color: theme.textMuted }}>
                      {project.pages[0].content.replace(/<[^>]*>?/gm, '').trim().slice(0, 150) || t(lang, 'emptyDocument')}
                    </div>
                  )}

                  {/* Actions (Always visible) */}
                  <div className="absolute top-3 right-3 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {tab === 'active' ? (
                      <>
                        <button onClick={(e) => handleStartEditProject(project.id, project.title, e)} className="p-1.5 rounded-md hover:bg-neutral-500/10 transition-colors cursor-pointer" style={{ color: theme.textMuted }} title={t(lang, 'rename')}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={(e) => handleSoftDeleteProject(project, e)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer" title={t(lang, 'moveToTrash')}>
                          <Trash2 size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => handleRestoreProject(project, e)} className="p-1.5 rounded-md hover:bg-neutral-500/10 transition-colors cursor-pointer" style={{ color: theme.textMuted }} title={t(lang, 'restore')}>
                          <RotateCcw size={13} />
                        </button>
                        <button onClick={(e) => promptHardDelete('project', project.id, project.title, e)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer" title={t(lang, 'deleteForever')}>
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div 
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium flex items-center gap-2 animate-fade-in-up"
          style={{ 
            backgroundColor: toastMsg.type === 'success' ? (theme.isDark ? '#064e3b' : '#ecfdf5') : (theme.isDark ? '#7f1d1d' : '#fef2f2'),
            borderColor: toastMsg.type === 'success' ? '#10b981' : '#ef4444',
            color: toastMsg.type === 'success' ? (theme.isDark ? '#a7f3d0' : '#065f46') : (theme.isDark ? '#fecaca' : '#991b1b')
          }}
        >
          {toastMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{toastMsg.text}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 hover:opacity-75"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}

export default React.memo(WelcomeScreen);
