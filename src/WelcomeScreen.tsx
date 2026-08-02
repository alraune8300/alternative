import React, { useState, useEffect, useCallback } from 'react';
import { FileText, FolderOpen, Plus, Download, Upload, Grid, List, Trash2, Edit2, Check, X, RotateCcw, Home, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Project, ThemeColors, Folder } from './types';
import { db, getAllProjectsFromDB, saveProjectToDB, deleteProjectFromDB, getAllFoldersFromDB, saveFolderToDB } from './db';

import { Lang, t } from './i18n';

interface WelcomeScreenProps {
  theme: ThemeColors;
  uiFont: string;
  lang?: Lang;
  onOpenProject: (projectId: string, pageId?: string) => void;
  onImport: () => void;
  onExportAll: () => void;
  onOpenGithubCloudSave?: () => void;
  refreshTrigger?: number;
}

function WelcomeScreen({ theme, uiFont, lang = 'vi', onOpenProject, onImport, onExportAll, onOpenGithubCloudSave, refreshTrigger }: WelcomeScreenProps) {
    
  const [projects, setProjects] = useState<Project[]>([]);
  const activeProjects = projects.filter(p => !p.isDeleted);
  const trashedProjects = projects.filter(p => p.isDeleted);
  const [folders, setFolders] = useState<Folder[]>([]);
  const activeFolders = folders.filter(f => !f.isDeleted);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [tab, setTab] = useState<'active' | 'trash'>('active');
  const [timeGreeting, setTimeGreeting] = useState('');
  
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ isOpen: boolean; type: 'project' | 'folder' | null; id: string | null; name: string }>({
    isOpen: false,
    type: null,
    id: null,
    name: ''
  });

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
    onOpenProject(newProj.id);
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

  const trashedFolders = folders.filter(f => f.isDeleted);

  const displayedProjects = (tab === 'active' ? activeProjects : trashedProjects).filter(p => (p.folderId || null) === currentFolderId);
  const displayedFolders = (tab === 'active' ? activeFolders : trashedFolders).filter(f => (f.parentId || null) === currentFolderId);

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
                <h3 className="font-semibold text-sm" style={{ color: theme.text }}>Permanently Delete</h3>
                <p className="text-xs mt-1" style={{ color: theme.textMuted }}>Are you sure? This action cannot be undone.</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 mt-2">
              <button 
                onClick={() => setDeleteConfirmDialog({ isOpen: false, type: null, id: null, name: '' })}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{ color: theme.textMuted,   }}
              >
                Cancel
              </button>
              <button 
                onClick={executeHardDelete}
                className="px-4 py-2 rounded-lg text-xs font-medium text-white transition-colors hover:bg-red-600 bg-red-500"
              >
                Confirm Delete
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
            <h2 className="text-lg md:text-xl font-medium tracking-tight" style={{ color: theme.text }}>Workspace</h2>
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
              <span className="font-medium text-xs md:text-sm">Active</span>
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
              <span className="font-medium text-xs md:text-sm">Trash</span>
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
              className="w-full px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
              style={{
                borderColor: theme.border,
                backgroundColor: theme.isDark ? 'rgba(99, 102, 241, 0.12)' : '#f5f3ff',
                color: theme.isDark ? '#a5b4fc' : '#4f46e5',
                fontFamily: uiFont,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#818cf8' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = theme.border }}
            >
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>{t(lang, 'cloudSave')}</span>
              </div>
              <span className="text-[10px] opacity-80">🔒</span>
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
            What are we writing today?
          </p>
        </div>

        {/* Quick Actions & Navigation */}
        <div className="w-full max-w-5xl flex items-center justify-between mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleNewProject} 
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all cursor-pointer font-medium tracking-wide text-sm"
              style={{ 
                borderColor: theme.border, 
                backgroundColor: theme.surface, 
                color: theme.text 
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.panel; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.surface; }}
            >
              <Plus size={16} strokeWidth={1.5} />
              <span>New Project</span>
            </button>
            
            

            

            <button 
              onClick={onImport} 
              className="flex items-center justify-center p-2.5 rounded-full border transition-all cursor-pointer" 
              title="Quick Import (.txt, .md, .docx)"
              style={{ borderColor: theme.borderFaint, backgroundColor: theme.surface, color: theme.textMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.panel; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.surface; }}
            >
              <Upload size={16} strokeWidth={1.5} />
            </button>
            <button 
              onClick={onExportAll} 
              className="flex items-center justify-center p-2.5 rounded-full border transition-all cursor-pointer" 
              title="Quick Bulk Export"
              style={{ borderColor: theme.borderFaint, backgroundColor: theme.surface, color: theme.textMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.panel; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = theme.surface; }}
            >
              <Download size={16} strokeWidth={1.5} />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 rounded-lg p-1 border" style={{ backgroundColor: theme.surface, borderColor: theme.borderFaint }}>
              <button 
                onClick={() => setViewMode('grid')} 
                className="p-1.5 rounded-md transition-all"
                style={{ 
                  backgroundColor: viewMode === 'grid' ? theme.bg : 'transparent',
                  color: viewMode === 'grid' ? theme.text : theme.textFaint
                }}
              >
                <Grid size={16} strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className="p-1.5 rounded-md transition-all"
                style={{ 
                  backgroundColor: viewMode === 'list' ? theme.bg : 'transparent',
                  color: viewMode === 'list' ? theme.text : theme.textFaint
                }}
              >
                <List size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        {tab === 'active' && currentFolderId !== null && (
          <div className="w-full max-w-5xl mb-4 flex items-center gap-2 text-sm" style={{ color: theme.textMuted }}>
            <button onClick={() => setCurrentFolderId(null)} className="hover:underline">Home</button>
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
        {/* Projects / Files Grid */}
        <div className="w-full max-w-5xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {displayedProjects.length === 0 && displayedFolders.length === 0 ? (
            <div 
              className="w-full py-24 flex flex-col items-center justify-center border border-dashed rounded-2xl"
              style={{ borderColor: theme.border, backgroundColor: theme.surface }}
            >
              <FileText size={32} className="mb-4" strokeWidth={1.5} style={{ color: theme.textFaint }} />
              <p className="font-light text-sm" style={{ color: theme.textMuted }}>
                {tab === 'active' ? 'No projects or folders found.' : 'Trash is empty.'}
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
                  <div className="flex items-center space-x-2 w-full">
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
                          <button onClick={(e) => handleSaveEditFolder(folder, e)} className="p-1 rounded text-green-500 hover:bg-green-500/10 transition-colors"><Check size={14}/></button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingFolderId(null); }} className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"><X size={14}/></button>
                        </div>
                      ) : (
                        <h3 className="text-sm font-medium tracking-wide truncate" style={{ color: theme.text }}>
                          {folder.name || 'Untitled Folder'}
                        </h3>
                      )}
                    </div>
                  </div>

                  {/* Actions Hover */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    {tab === 'active' ? (
                      <>
                        <button onClick={(e) => handleStartEditFolder(folder.id, folder.name, e)} className="p-1.5 rounded-md transition-colors" style={{ color: theme.textMuted }} title="Rename">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={(e) => handleSoftDeleteFolder(folder, e)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors" title="Move to Trash">
                          <Trash2 size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => handleRestoreFolder(folder, e)} className="p-1.5 rounded-md transition-colors" style={{ color: theme.textMuted }} title="Restore">
                          <RotateCcw size={13} />
                        </button>
                        <button onClick={(e) => promptHardDelete('folder', folder.id, folder.name, e)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors" title="Permanently Delete">
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
                  <div className="flex items-center space-x-2 w-full">
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
                          <button onClick={(e) => handleSaveEditProject(project, e)} className="p-1 rounded text-green-500 hover:bg-green-500/10 transition-colors"><Check size={14}/></button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingProjectId(null); }} className="p-1 rounded text-red-500 hover:bg-red-500/10 transition-colors"><X size={14}/></button>
                        </div>
                      ) : (
                        <h3 className="text-sm font-medium tracking-wide truncate" style={{ color: theme.text }}>
                          {project.title || 'Untitled Project'}
                        </h3>
                      )}
                    </div>
                  </div>

                  {/* Sub-Metadata Line */}
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-light tracking-wider uppercase ml-6" style={{ color: theme.textFaint }}>
                    <span>{project.pages.length} {project.pages.length === 1 ? 'page' : 'pages'}</span>
                    <span>•</span>
                    <span>{format(new Date(project.lastModified || project.createdAt || Date.now()), 'MMM d, yyyy')}</span>
                  </div>

                  {/* Content Snippet */}
                  {viewMode === 'grid' && project.pages[0] && tab === 'active' && (
                    <div className="mt-3 pt-3 border-t text-xs font-light leading-relaxed line-clamp-3" style={{ borderColor: theme.borderFaint, color: theme.textMuted }}>
                      {project.pages[0].content.replace(/<[^>]*>?/gm, '').trim().slice(0, 150) || 'Empty document...'}
                    </div>
                  )}

                  {/* Actions Hover */}
                  <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    {tab === 'active' ? (
                      <>
                        <button onClick={(e) => handleStartEditProject(project.id, project.title, e)} className="p-1.5 rounded-md transition-colors" style={{ color: theme.textMuted }} title="Rename">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={(e) => handleSoftDeleteProject(project, e)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors" title="Move to Trash">
                          <Trash2 size={13} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={(e) => handleRestoreProject(project, e)} className="p-1.5 rounded-md transition-colors" style={{ color: theme.textMuted }} title="Restore">
                          <RotateCcw size={13} />
                        </button>
                        <button onClick={(e) => promptHardDelete('project', project.id, project.title, e)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors" title="Permanently Delete">
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
    </div>
  );
}

export default React.memo(WelcomeScreen);
