import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  THEMES, deriveCustomTheme, WELCOME_ID,
  BUILTIN_FONTS,
} from './theme';
import { getDict, type Dict } from './i18n';
import { exportTxt, exportJson } from './exportUtils';
import { importFile, exportToPdf, exportToDocx, exportToHtmlFile, exportToMarkdownFile, exportToJsonBackup } from './fileHandlers';
import { saveApiKey, loadApiKey, injectGoogleFont, reinjectSavedFonts } from './googleFontsApi';
import { Minimize2, X } from 'lucide-react';
import { type Editor as TiptapEditorType } from '@tiptap/react';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import GoogleFontsPanel from './GoogleFontsPanel';
import Editor from './Editor';
import Toolbar from './Toolbar';
import WelcomeScreen from './WelcomeScreen';
import type { Document, Folder, ThemeColors, ThemeMode, CustomTheme, CustomFont, Lang, Project, Page, FormatState, PageFormat } from './types';
import { PAPER_SIZES_PX } from './types';
import { getAllProjectsFromDB, saveProjectToDB, deleteProjectFromDB, getAppSettings, saveAppSettings } from './db';

// --- localStorage helpers ---
const LS = {
  get(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string): void { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  getJSON<T>(k: string): T | null { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) as T : null; } catch { return null; } },
  setJSON(k: string, v: unknown): void { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
};

function loadThemeMode(): ThemeMode {
  const v = LS.get('kgv-theme');
  return v || 'light';
}
function loadCustomTheme(): CustomTheme | null {
  const p = LS.getJSON<CustomTheme>('kgv-custom-theme');
  return p && p.bg && p.text ? { bg: p.bg, text: p.text, accent: p.accent || '#2563EB' } : null;
}
function loadFont(): string { return LS.get('kgv-font') || 'Merriweather'; }
function loadUiFont(): string { return LS.get('kgv-ui-font') || 'Inter'; }
function loadLang(): Lang {
  const v = LS.get('kgv-lang');
  if (v === 'en' || v === 'vi' || v === 'fr' || v === 'de' || v === 'it' || v === 'es' || v === 'ko' || v === 'zh' || v === 'ja') {
    return v;
  }
  return 'vi';
}
function loadFontSize(): number { const v = LS.get('kgv-font-size'); return v ? parseInt(v, 10) : 18; }
function loadCustomFont(): CustomFont | null { return LS.getJSON<CustomFont>('kgv-custom-font'); }

async function applyCustomFont(f: CustomFont): Promise<string> {
  const lower = f.dataUrl.toLowerCase();
  let format: string | undefined;
  if (lower.includes('woff2')) format = 'woff2';
  else if (lower.includes('woff')) format = 'woff';
  else if (lower.includes('ttf') || lower.includes('octet-stream')) format = 'truetype';
  else if (lower.includes('opentype')) format = 'opentype';
  const source = format ? `url(${f.dataUrl}) format("${format}")` : `url(${f.dataUrl})`;
  const fontFace = new FontFace(f.family, source);
  await fontFace.load();
  document.fonts.add(fontFace);
  return f.family;
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [activePageId, setActivePageId] = useState('');
  const [isWorkspaceActive, setIsWorkspaceActive] = useState(false);

  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null);
  const [docFont, setDocFont] = useState(() => loadFont());
  const [uiFont, setUiFont] = useState('Inter');
  const [customFont, setCustomFont] = useState<CustomFont | null>(null);
  const [lang, setLang] = useState<Lang>('vi');
  const [fontSize, setFontSize] = useState(18);
  const [apiKey, setApiKey] = useState('');
  const [showRibbon, setShowRibbon] = useState(() => LS.get('kgv-show-ribbon') !== 'false');

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [networkToast, setNetworkToast] = useState<{ message: string; type: 'offline' | 'online' } | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkToast({ message: 'Reconnected. Syncing workspace in the background...', type: 'online' });
      setTimeout(() => setNetworkToast(null), 4000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setNetworkToast({ message: 'Offline Mode Active. Writing is saved locally on your device.', type: 'offline' });
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (!navigator.onLine) {
      setNetworkToast({ message: 'Offline Mode Active. Writing is saved locally on your device.', type: 'offline' });
    }
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [fontExplorerOpen, setFontExplorerOpen] = useState(false);
  
  const [formatState, setFormatState] = useState<FormatState>({
    fontFam: loadFont(),
    headingFontFam: loadFont(),
    fontSize: fontSize,
    lineH: 1.7,
    align: 'left',
    maxW: 794,
    paraSpacing: 1,
    letterSpacing: 0,
    wordSpacing: 0,
    firstLineIndent: false,
  });

  const [pageFormat, setPageFormat] = useState<PageFormat>({
    paperSize: 'A4',
    orientation: 'portrait',
    mode: 'pages',
  });

  const [editorInstance, setEditorInstance] = useState<TiptapEditorType | null>(null);

  const handleFormatChange = useCallback((updates: Partial<FormatState>) => {
    setFormatState(prev => ({ ...prev, ...updates }));
    if (updates.fontSize) setFontSize(updates.fontSize);
    if (updates.fontFam) {
      setDocFont(updates.fontFam);
      LS.set('kgv-font', updates.fontFam);
    }
  }, []);

  const handleToggleFocusMode = useCallback(() => {
    setIsFocusMode(prev => {
      const next = !prev;
      if (next) setIsPreviewMode(false);

      // Inject micro-task layout reset using a setTimeout to explicitly re-center/scroll viewport
      setTimeout(() => {
        window.scrollTo(0, 0);
        const scrollParent = document.querySelector('.kgv-scroll');
        if (scrollParent) {
          scrollParent.scrollTop = 0;
        }
        
        if (editorInstance) {
          const editor = editorInstance as unknown as {
            commands: { focus: () => { run: () => void } };
            view: {
              state: { selection: { from: number } };
              domAtPos: (pos: number) => { node: Node };
            };
          };
          if (!editor?.isDestroyed && typeof editor?.commands?.focus === 'function') {
            try {
              editor?.commands?.focus();
              const view = editor.view;
              if (view) {
                const { state } = view;
                const { selection } = state;
                const { from } = selection;
                const domNode = view.domAtPos(from).node;
                const element = domNode instanceof HTMLElement ? domNode : domNode.parentElement;
                if (element && typeof element.scrollIntoView === 'function') {
                  element.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
              }
            } catch (err) {
              console.warn('Selection scroll-into-view failed:', err);
            }
          }
        }
      }, 50);

      return next;
    });
  }, [editorInstance]);

  const handleTogglePreviewMode = useCallback(() => {
    setIsPreviewMode(prev => {
      const next = !prev;
      if (next) setIsFocusMode(false);
      return next;
    });
  }, []);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedProjRef = useRef<string>('');

  const t: Dict = useMemo(() => getDict(lang), [lang]);

  const theme: ThemeColors = useMemo(() => {
    if (themeMode === 'custom' && customTheme) return deriveCustomTheme(customTheme.bg, customTheme.text, customTheme.accent);
    const key = (themeMode || 'light').toLowerCase();
    return THEMES[key] || THEMES.light;
  }, [themeMode, customTheme]);

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0];
  }, [projects, activeProjectId]);

  const allPagesInActiveProj = useMemo(() => {
    if (!activeProject) return [];
    return [...(activeProject.pages || []), ...(activeProject.drafts || [])];
  }, [activeProject]);

  const activePage = useMemo(() => {
    if (!activeProject) return undefined;
    const found = allPagesInActiveProj.find((p) => p.id === activePageId);
    return found || activeProject.pages?.[0] || activeProject.drafts?.[0];
  }, [activeProject, allPagesInActiveProj, activePageId]);


  const availableFonts = useMemo(() => {
    const fonts = [...BUILTIN_FONTS];
    if (customFont) fonts.unshift({ family: customFont.family, label: `${customFont.family} ${t.customFontSuffix}` });
    return fonts;
  }, [customFont, t]);

  // Sync document body styles with the current active theme
  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
  }, [theme.bg, theme.text]);

  // Persist App Settings / Session state to IndexedDB (appSettings)
  useEffect(() => {
    if (loading) return;
    saveAppSettings({
      activeProjectId,
      activePageId,
      currentTheme: themeMode,
      fontFamily: docFont,
      fontSize,
      lineHeight: formatState.lineH,
      pageFormat,
      isLeftPanelOpen: sidebarOpen,
      isRightPanelOpen: rightOpen,
      isFocusMode,
      isPreviewMode,
      language: lang,
    });
  }, [activeProjectId, activePageId, themeMode, docFont, fontSize, formatState.lineH, pageFormat, sidebarOpen, rightOpen, isFocusMode, isPreviewMode, lang, loading]);

  // Load state, projects, and appSettings from IndexedDB / LocalStorage
  useEffect(() => {
    const savedMode = loadThemeMode();
    setThemeMode(savedMode);
    if (savedMode === 'custom') { const ct = loadCustomTheme(); if (ct) setCustomTheme(ct); }
    setDocFont(loadFont());
    setUiFont(loadUiFont());
    setLang(loadLang());
    setFontSize(loadFontSize());
    setApiKey(loadApiKey());
    reinjectSavedFonts();
    const cf = loadCustomFont();
    if (cf) { setCustomFont(cf); applyCustomFont(cf).catch(() => {}); }

    (async () => {
      let dbProjects: Project[] = [];
      let settings;
      try {
        [dbProjects, settings] = await Promise.all([
          getAllProjectsFromDB(),
          getAppSettings(),
        ]);
      } catch (err) {
        console.warn('Error loading from Dexie:', err);
      }

      const dict = getDict(loadLang());

      if (settings) {
        if (settings.currentTheme) setThemeMode(settings.currentTheme as ThemeMode);
        if (settings.fontFamily) { setDocFont(settings.fontFamily); LS.set('kgv-font', settings.fontFamily); }
        if (settings.fontSize) { setFontSize(settings.fontSize); LS.set('kgv-font-size', String(settings.fontSize)); }
        if (settings.lineHeight) { setFormatState(prev => ({ ...prev, lineH: settings.lineHeight! })); }
        if (settings.pageFormat) { setPageFormat(settings.pageFormat); }
        if (settings.isLeftPanelOpen !== undefined) setSidebarOpen(settings.isLeftPanelOpen);
        if (settings.isRightPanelOpen !== undefined) setRightOpen(settings.isRightPanelOpen);
        if (settings.isFocusMode !== undefined) setIsFocusMode(settings.isFocusMode);
        if (settings.isPreviewMode !== undefined) setIsPreviewMode(settings.isPreviewMode);
        if (settings.language) {
          setLang(settings.language as Lang);
          LS.set('kgv-lang', settings.language);
        }
      }

      if (!dbProjects || dbProjects.length === 0) {
        // Migration or initialize initial Project
        const localDocs = LS.getJSON<Document[]>('kgv-docs') || [];
        const localFolders = LS.getJSON<Folder[]>('kgv-folders') || [];

        const initialPages: Page[] = localDocs.map((d) => ({
          id: d.id,
          title: d.title || 'Untitled Document',
          content: d.content || '',
          isDraft: false,
          createdAt: new Date(d.created_at || Date.now()).toISOString(),
          lastModified: new Date(d.updated_at || Date.now()).toISOString(),
          folderId: d.folder_id || undefined,
        }));

        if (initialPages.length === 0) {
          initialPages.push({
            id: WELCOME_ID,
            title: dict.welcomeTitle || 'Untitled Document',
            content: dict.welcomeContent || '',
            isDraft: false,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
          });
        }

        const initialProj: Project = {
          id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          title: initialPages[0]?.title || 'Untitled Document',
          pages: initialPages,
          drafts: [],
          folders: localFolders,
          bin: [],
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };

        await saveProjectToDB(initialProj);
        dbProjects = [initialProj];
      }

      setProjects(dbProjects);

      const targetProjId = settings?.activeProjectId || LS.get('kgv-active-project-id');
      const targetProj = dbProjects.find((p) => p.id === targetProjId) || dbProjects[0];
      setActiveProjectId(targetProj.id);
      
      const targetPageId = settings?.activePageId || targetProj.pages[0]?.id || targetProj.drafts[0]?.id || '';
      setActivePageId(targetPageId);

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    function handleDocFont(e: Event) { handleSelectDocFont((e as CustomEvent).detail as string); }
    function handleFontSize(e: Event) {
      const s = (e as CustomEvent).detail as number;
      setFontSize(s); LS.set('kgv-font-size', String(s));
    }
    window.addEventListener('kgv-docfont', handleDocFont);
    window.addEventListener('kgv-fontsize', handleFontSize);
    return () => {
      window.removeEventListener('kgv-docfont', handleDocFont);
      window.removeEventListener('kgv-fontsize', handleFontSize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Asynchronous auto-focus cursor handler on mount or project/page switch
  useEffect(() => {
    if (editorInstance) {
      requestAnimationFrame(() => {
        const editor = editorInstance as unknown as { commands?: { focus?: () => void } };
        if (!editor?.isDestroyed && typeof editor?.commands?.focus === 'function') {
          try {
            editor?.commands?.focus();
          } catch {
            /* ignore */
          }
        }
      });
    }
  }, [activePageId, activeProjectId, editorInstance]);

  const { wordCount, charCount } = useMemo(() => {
    const raw = activePage?.content || '';
    if (!raw) return { wordCount: 0, charCount: 0 };
    const text = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return { wordCount: text ? text.split(/\s+/).length : 0, charCount: text.length };
  }, [activePage?.content]);

  // Save isolated project to IndexedDB (offline-first with 3.5s strict debounce & structural dirty-checking)
  const scheduleSaveProject = useCallback((projToSave: Project) => {
    setSaving(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const jsonStr = JSON.stringify(projToSave);
        if (jsonStr === lastSavedProjRef.current) {
          setSaving(false);
          return;
        }
        await saveProjectToDB(projToSave);
        lastSavedProjRef.current = jsonStr;
        if (!isOnline) {
          console.log('Offline Mode: Cloud sync frozen. Saved locally to Dexie.');
        } else {
          console.log('Online Mode: Background cloud sync executed.');
        }
      } catch (err) {
        console.error('Failed saving project to IndexedDB:', err);
      } finally {
        setSaving(false);
      }
    }, 3500);
  }, [isOnline]);

  // Update active page content or title in active project state & trigger auto-save for active project only
  const updateActivePage = useCallback((patch: Partial<Page>) => {
    if (!activeProjectId) return;
    setProjects((prevProjects) => {
      return prevProjects.map((proj) => {
        if (proj.id !== activeProjectId) return proj;

        const now = new Date().toISOString();
        let pageFound = false;

        const updatedPages = (proj.pages || []).map((p) => {
          if (p.id === activePageId) { pageFound = true; return { ...p, ...patch, lastModified: now }; }
          return p;
        });

        const updatedDrafts = (proj.drafts || []).map((p) => {
          if (p.id === activePageId) { pageFound = true; return { ...p, ...patch, lastModified: now }; }
          return p;
        });

        if (!pageFound && (updatedPages.length > 0 || updatedDrafts.length > 0)) {
          // If no page matched activePageId, update the first page
          if (updatedPages.length > 0) updatedPages[0] = { ...updatedPages[0], ...patch, lastModified: now };
          else updatedDrafts[0] = { ...updatedDrafts[0], ...patch, lastModified: now };
        }

        const updatedProj: Project = {
          ...proj,
          pages: updatedPages,
          drafts: updatedDrafts,
          lastModified: now,
        };

        scheduleSaveProject(updatedProj);
        return updatedProj;
      });
    });
  }, [activeProjectId, activePageId, scheduleSaveProject]);

  const handleContentChange = useCallback((html: string) => {
    updateActivePage({ content: html });
  }, [updateActivePage]);

  // Project Switcher handler
  const handleSelectProject = useCallback((projectId: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    setActiveProjectId(projectId);
    LS.set('kgv-active-project-id', projectId);
    
    const targetProj = projects.find((p) => p.id === projectId);
    if (targetProj) {
      const firstPage = targetProj.pages?.[0] || targetProj.drafts?.[0];
      if (firstPage) {
        setActivePageId(firstPage.id);
      } else {
        setActivePageId('');
      }
    }
  }, [projects]);

  // Create New Document / Project
  const handleCreateNewProject = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const newProjId = 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const defaultPage: Page = {
      id: 'page-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: 'Untitled Document',
      content: '',
      isDraft: false,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    const newProject: Project = {
      id: newProjId,
      title: 'Untitled Document',
      pages: [defaultPage],
      drafts: [],
      folders: [],
      bin: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    await saveProjectToDB(newProject);

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProjId);
    setActivePageId(defaultPage.id);
    LS.set('kgv-active-project-id', newProjId);
        if (window.innerWidth < 768) setSidebarOpen(false);
  }, []);

  const handleRenameProject = useCallback((projectId: string, newTitle: string) => {
    setProjects((prev) => {
      return prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const updated: Project = { ...proj, title: newTitle, lastModified: new Date().toISOString() };
        scheduleSaveProject(updated);
        return updated;
      });
    });
  }, [scheduleSaveProject]);

  const handleDeleteProject = useCallback(async (projectId: string) => {
    await deleteProjectFromDB(projectId);
    setProjects((prev) => {
      const remaining = prev.filter((p) => p.id !== projectId);
      if (remaining.length === 0) {
        const defaultPage: Page = {
          id: 'page-' + Date.now(),
          title: 'Untitled Document',
          content: '',
          isDraft: false,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
        const freshProj: Project = {
          id: 'proj-' + Date.now(),
          title: 'Untitled Document',
          pages: [defaultPage],
          drafts: [],
          folders: [],
          bin: [],
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
        saveProjectToDB(freshProj);
        setActiveProjectId(freshProj.id);
        setActivePageId(defaultPage.id);
        return [freshProj];
      }
      if (projectId === activeProjectId) {
        const nextProj = remaining[0];
        setActiveProjectId(nextProj.id);
        setActivePageId(nextProj.pages?.[0]?.id || nextProj.drafts?.[0]?.id || '');
        LS.set('kgv-active-project-id', nextProj.id);
      }
      return remaining;
    });
  }, [activeProjectId]);

  // Page Operations inside active project
  const addPage = useCallback((isDraft = false, folderId?: string) => {
    const newPage: Page = {
      id: 'page-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: isDraft ? 'Untitled Draft' : 'Untitled Document',
      content: '',
      isDraft, folderId,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    };

    setProjects((prev) => {
      return prev.map((proj) => {
        if (proj.id !== activeProjectId) return proj;
        const updatedProj: Project = {
          ...proj,
          pages: isDraft ? proj.pages : [newPage, ...(proj.pages || [])],
          drafts: isDraft ? [newPage, ...(proj.drafts || [])] : proj.drafts,
          lastModified: new Date().toISOString(),
        };
        scheduleSaveProject(updatedProj);
        return updatedProj;
      });
    });

    setActivePageId(newPage.id);
  }, [activeProjectId, scheduleSaveProject]);

  const deletePage = useCallback((pageId: string) => {
    setProjects((prev) => {
      return prev.map((proj) => {
        if (proj.id !== activeProjectId) return proj;

        const targetPage = [...(proj.pages || []), ...(proj.drafts || [])].find((p) => p.id === pageId);
        const remainingPages = (proj.pages || []).filter((p) => p.id !== pageId);
        const remainingDrafts = (proj.drafts || []).filter((p) => p.id !== pageId);
        const updatedBin = targetPage ? [targetPage, ...(proj.bin || [])] : (proj.bin || []);

        const updatedProj: Project = {
          ...proj,
          pages: remainingPages,
          drafts: remainingDrafts,
          bin: updatedBin,
          lastModified: new Date().toISOString(),
        };

        if (activePageId === pageId) {
          const nextActive = remainingPages[0] || remainingDrafts[0];
          if (nextActive) {
            setActivePageId(nextActive.id);
          } else {
            const fallback: Page = {
              id: 'page-' + Date.now(),
              title: 'Untitled Document',
              content: '',
              isDraft: false,
              createdAt: new Date().toISOString(),
              lastModified: new Date().toISOString(),
            };
            updatedProj.pages = [fallback];
            setActivePageId(fallback.id);
          }
        }

        scheduleSaveProject(updatedProj);
        return updatedProj;
      });
    });
  }, [activeProjectId, activePageId, scheduleSaveProject]);

  const renamePage = useCallback((pageId: string, newName: string) => {
    setProjects((prev) => {
      return prev.map((proj) => {
        if (proj.id !== activeProjectId) return proj;
        const updatedProj: Project = {
          ...proj,
          pages: (proj.pages || []).map((p) => p.id === pageId ? { ...p, title: newName, lastModified: new Date().toISOString() } : p),
          drafts: (proj.drafts || []).map((p) => p.id === pageId ? { ...p, title: newName, lastModified: new Date().toISOString() } : p),
          lastModified: new Date().toISOString(),
        };
        scheduleSaveProject(updatedProj);
        return updatedProj;
      });
    });
  }, [activeProjectId, scheduleSaveProject]);

  const restorePage = useCallback((pageId: string) => {
    setProjects((prev) => {
      return prev.map((proj) => {
        if (proj.id !== activeProjectId) return proj;
        const target = (proj.bin || []).find((p) => p.id === pageId);
        if (!target) return proj;
        const remainingBin = (proj.bin || []).filter((p) => p.id !== pageId);
        const updatedProj: Project = {
          ...proj,
          bin: remainingBin,
          pages: target.isDraft ? proj.pages : [target, ...(proj.pages || [])],
          drafts: target.isDraft ? [target, ...(proj.drafts || [])] : proj.drafts,
          lastModified: new Date().toISOString(),
        };
        scheduleSaveProject(updatedProj);
        return updatedProj;
      });
    });
  }, [activeProjectId, scheduleSaveProject]);

  const permanentDeletePage = useCallback((pageId: string) => {
    setProjects((prev) => {
      return prev.map((proj) => {
        if (proj.id !== activeProjectId) return proj;
        const updatedProj: Project = {
          ...proj,
          bin: (proj.bin || []).filter((p) => p.id !== pageId),
          lastModified: new Date().toISOString(),
        };
        scheduleSaveProject(updatedProj);
        return updatedProj;
      });
    });
  }, [activeProjectId, scheduleSaveProject]);

  const emptyBin = useCallback(() => {
    setProjects((prev) => {
      return prev.map((proj) => {
        if (proj.id !== activeProjectId) return proj;
        const updatedProj: Project = {
          ...proj,
          bin: [],
          lastModified: new Date().toISOString(),
        };
        scheduleSaveProject(updatedProj);
        return updatedProj;
      });
    });
  }, [activeProjectId, scheduleSaveProject]);

  // Folder Operations inside active project
  const addFolder = useCallback((parentId: string | null = null) => {
    const newFolder: Folder = {
      id: 'folder-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: t.newFolderName || 'New Folder',
      parentId,
      created_at: Date.now(),
    };

    setProjects((prev) => {
      return prev.map((proj) => {
        if (proj.id !== activeProjectId) return proj;
        const updatedProj: Project = {
          ...proj,
          folders: [newFolder, ...(proj.folders || [])],
          lastModified: new Date().toISOString(),
        };
        scheduleSaveProject(updatedProj);
        return updatedProj;
      });
    });
  }, [activeProjectId, t, scheduleSaveProject]);

  const deleteFolder = useCallback((folderId: string) => {
    setProjects((prev) => {
      return prev.map((proj) => {
        if (proj.id !== activeProjectId) return proj;
        const updatedProj: Project = {
          ...proj,
          folders: (proj.folders || []).filter((f) => f.id !== folderId && f.parentId !== folderId),
          pages: (proj.pages || []).map((p) => p.folderId === folderId ? { ...p, folderId: undefined } : p),
          drafts: (proj.drafts || []).map((p) => p.folderId === folderId ? { ...p, folderId: undefined } : p),
          lastModified: new Date().toISOString(),
        };
        scheduleSaveProject(updatedProj);
        return updatedProj;
      });
    });
  }, [activeProjectId, scheduleSaveProject]);

  const renameFolder = useCallback((folderId: string, name: string) => {
    setProjects((prev) => {
      return prev.map((proj) => {
        if (proj.id !== activeProjectId) return proj;
        const updatedProj: Project = {
          ...proj,
          folders: (proj.folders || []).map((f) => f.id === folderId ? { ...f, name } : f),
          lastModified: new Date().toISOString(),
        };
        scheduleSaveProject(updatedProj);
        return updatedProj;
      });
    });
  }, [activeProjectId, scheduleSaveProject]);

  const movePageToFolder = useCallback((pageId: string, folderId: string | undefined) => {
    setProjects((prev) => {
      return prev.map((proj) => {
        if (proj.id !== activeProjectId) return proj;
        const updatedProj: Project = {
          ...proj,
          pages: (proj.pages || []).map((p) => p.id === pageId ? { ...p, folderId } : p),
          drafts: (proj.drafts || []).map((p) => p.id === pageId ? { ...p, folderId } : p),
          lastModified: new Date().toISOString(),
        };
        scheduleSaveProject(updatedProj);
        return updatedProj;
      });
    });
  }, [activeProjectId, scheduleSaveProject]);

  const handleSelectTheme = useCallback((mode: ThemeMode) => { setThemeMode(mode); LS.set('kgv-theme', mode); }, []);
  const handleCustomThemeChange = useCallback((c: CustomTheme) => {
    setCustomTheme(c); LS.setJSON('kgv-custom-theme', c); setThemeMode('custom'); LS.set('kgv-theme', 'custom');
  }, []);
  const handleSelectDocFont = useCallback((family: string) => {
    setDocFont(family);
    LS.set('kgv-font', family);
    setFormatState(prev => ({ ...prev, fontFam: family, headingFontFam: family }));
  }, []);
  const handleSelectUiFont = useCallback((family: string) => { setUiFont(family); LS.set('kgv-ui-font', family); }, []);
  const handleSelectLang = useCallback((l: Lang) => {
    setLang(l);
    LS.set('kgv-lang', l);
    saveAppSettings({ language: l });
  }, []);

  const handleUploadFont = useCallback(async (file: File) => {
    const family = file.name.replace(/\.(ttf|otf|woff2?)$/i, '');
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Cannot read font file'));
      reader.readAsDataURL(file);
    });
    const cf: CustomFont = { family, dataUrl };
    await applyCustomFont(cf);
    setCustomFont(cf);
    LS.setJSON('kgv-custom-font', cf);
    setDocFont(family);
    LS.set('kgv-font', family);
    setFormatState(prev => ({ ...prev, fontFam: family, headingFontFam: family }));
  }, []);

  const handleRemoveCustomFont = useCallback(() => {
    LS.set('kgv-custom-font', '');
    try { localStorage.removeItem('kgv-custom-font'); } catch { /* ignore */ }
    setCustomFont(null);
    if (!BUILTIN_FONTS.some((f) => f.family === docFont)) { setDocFont('Merriweather'); LS.set('kgv-font', 'Merriweather'); }
  }, [docFont]);

  const handleImportFile = useCallback(async (file: File) => {
    try {
      const { title, htmlContent } = await importFile(file);
      const newProjId = 'proj-' + Date.now();
      const newPageId = 'page-' + Date.now();
      const newPage: Page = {
        id: newPageId,
        title: title || 'Imported Document',
        content: htmlContent,
        isDraft: false,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
      const newProject: Project = {
        id: newProjId,
        title: title || 'Imported Document',
        pages: [newPage],
        drafts: [],
        folders: [],
        bin: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };
      await saveProjectToDB(newProject);
      setProjects((prev) => [newProject, ...prev]);
      setActiveProjectId(newProjId);
      setActivePageId(newPageId);
      LS.set('kgv-active-project-id', newProjId);
          } catch (err) {
      console.error('Import error:', err);
      alert('Failed to import file.');
    }
  }, []);

  const handleExportPdf = useCallback(() => {
    exportToPdf(activePage?.title || 'Document', activePage?.content || '', pageFormat);
  }, [activePage, pageFormat]);

  const handleExportDocx = useCallback(() => {
    exportToDocx(activePage?.title || 'Document', activePage?.content || '');
  }, [activePage]);

  const handleExportHtml = useCallback(() => {
    exportToHtmlFile(activePage?.title || 'Document', activePage?.content || '');
  }, [activePage]);

  const handleExportMd = useCallback(() => {
    exportToMarkdownFile(activePage?.title || 'Document', activePage?.content || '');
  }, [activePage]);

  const handleExportJsonBackupAll = useCallback(() => {
    exportToJsonBackup(projects);
  }, [projects]);

  const handleSaveApiKey = useCallback((key: string) => { setApiKey(key); saveApiKey(key); }, []);

  const handleApplyFontToSelection = useCallback((family: string) => {
    injectGoogleFont(family);
    window.dispatchEvent(new CustomEvent('kgv-apply-font-selection', { detail: family }));
  }, []);

  
  
  
  const handleExportTxt = useCallback(() => {
    if (!activePage) return;
    const doc: Document = { id: activePage.id, title: activePage.title, content: activePage.content };
    exportTxt(doc);
  }, [activePage]);

  const handleExportJson = useCallback(() => {
    const docsExport: Document[] = allPagesInActiveProj.map((p) => ({ id: p.id, title: p.title, content: p.content, folder_id: p.folderId || null }));
    exportJson(activeProject?.folders || [], docsExport);
  }, [allPagesInActiveProj, activeProject]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center" style={{ background: theme.bg, color: theme.muted, fontFamily: `'${uiFont}', sans-serif` }}>
        <p className="text-sm">{t.loading}</p>
      </div>
    );
  }

  if (!isWorkspaceActive) {
    return (
      <WelcomeScreen
        theme={theme}
        uiFont={uiFont}
        onOpenProject={(projectId) => {
          setActiveProjectId(projectId);
          setIsWorkspaceActive(true);
        }}
        onImport={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.txt,.md,.docx';
          input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
              await handleImportFile(file);
              setIsWorkspaceActive(true);
            }
          };
          input.click();
        }}
        onExportAll={() => {
          exportToJsonBackup(projects);
        }}
      />
    );
  }

  const legacyDocsExport: Document[] = allPagesInActiveProj.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    updated_at: p.lastModified,
    folder_id: p.folderId || null,
  }));

  return (
    <div
      className="h-screen w-full flex overflow-hidden relative"
      style={{
        background: theme.bg,
        color: theme.text,
        fontFamily: `'${uiFont}', sans-serif`,
        transition: 'background 300ms, color 300ms',
      }}
    >
      {(isFocusMode || isPreviewMode) && (
        <button
          onClick={isFocusMode ? handleToggleFocusMode : handleTogglePreviewMode}
          className="fixed top-6 right-6 z-50 p-2.5 rounded-full shadow-lg border backdrop-blur-md transition-transform hover:scale-110 cursor-pointer flex items-center justify-center"
          style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text, colorScheme: theme.isDark ? "dark" : "light" }}
          title={isFocusMode ? "Exit Focus Mode" : "Exit Preview Mode"}
        >
          <X size={20} />
        </button>
      )}
      {/* Mobile backdrop for sidebar */}
      {sidebarOpen && !isFocusMode && !isPreviewMode && (
        <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Left Panel with fluid width, smooth slide transitions & adaptive graphic scaling */}
      <div
        className={`
          fixed md:relative top-0 left-0 h-full z-40 md:z-auto flex-shrink-0
          transition-all duration-300 ease-in-out transform shadow-xl md:shadow-none kgv-adaptive-panel kgv-hardware-accelerated
          ${sidebarOpen && !isFocusMode && !isPreviewMode ? 'translate-x-0 opacity-100 w-[240px]' : '-translate-x-full opacity-0 w-0 pointer-events-none'}
        `}
      >
        <LeftPanel
          projects={projects}
          activeProjectId={activeProjectId}
          activePageId={activePageId}
          onGoHome={() => setIsWorkspaceActive(false)}
          theme={theme}
          uiFont={uiFont}
          lang={lang}
          t={t}
          sidebarOpen={sidebarOpen}
          onSelectProject={handleSelectProject}
          onNewProject={handleCreateNewProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
          onSelectPage={(id: string) => { setActivePageId(id); if (window.innerWidth < 768) setSidebarOpen(false); }}
          onNewPage={addPage}
          onDeletePage={deletePage}
          onRenamePage={renamePage}
          onCreateFolder={addFolder}
          onRenameFolder={renameFolder}
          onDeleteFolder={deleteFolder}
          onMovePageToFolder={movePageToFolder}
          onRestorePage={restorePage}
          onPermanentDelete={permanentDeletePage}
          onEmptyBin={emptyBin}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Workspace Area with fluid flex expansion & smooth resize transition */}
      <main className="flex-1 h-full overflow-hidden flex flex-col transition-all duration-300 ease-in-out relative">
        {/* Document Title Header (Editable in standard mode, stylized book header in Preview mode) */}
        {!isFocusMode && !isPreviewMode && (
          <div className="max-w-2xl mx-auto w-full px-6 md:px-8 pt-8 md:pt-10 transition-all duration-300">
            <input
              value={activePage?.title || ''}
              onChange={(e) => updateActivePage({ title: e.target.value })}
              placeholder={t.titlePlaceholder}
              className="w-full bg-transparent outline-none border-none text-2xl md:text-3xl font-normal"
              style={{ fontFamily: `'${docFont}', Georgia, serif`, color: theme.text }}
            />
          </div>
        )}

        {!isFocusMode && !isPreviewMode && editorInstance && showRibbon && (
          <div className="w-full border-b border-neutral-200/20 dark:border-neutral-800/20 bg-transparent my-2 flex items-center justify-between px-4">
            <div className="flex-1">
              <Toolbar
                editor={editorInstance as TiptapEditorType}
                theme={theme}
                uiFont={uiFont}
                t={t}
                selectedFont={formatState.fontFam || docFont}
                selectedSize={formatState.fontSize || fontSize}
                availableFonts={availableFonts}
                                onFontChange={(fam) => {
                  (editorInstance as TiptapEditorType)?.chain().focus().setFontFamily(fam).run();
                }}
                onSizeChange={(delta) => {
                  const currentSz = editorInstance?.getAttributes('textStyle')?.fontSize?.replace('px', '') || formatState.fontSize;
                  const newSz = Math.max(8, Math.min(96, Number(currentSz) + delta));
                  (editorInstance as TiptapEditorType)?.chain().focus().setFontSize(String(newSz)).run();
                }}
                onSizeInput={(sz) => {
                  (editorInstance as TiptapEditorType)?.chain().focus().setFontSize(String(sz)).run();
                }}
                                                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen(v => !v)}
                rightOpen={rightOpen}
                onToggleSettings={() => setRightOpen(v => !v)}
                isFocusMode={isFocusMode}
                onToggleFocusMode={handleToggleFocusMode}
                isPreviewMode={isPreviewMode}
                onTogglePreviewMode={handleTogglePreviewMode}
                onUndo={() => (editorInstance as TiptapEditorType)?.chain().focus().undo().run()}
                onRedo={() => (editorInstance as TiptapEditorType)?.chain().focus().redo().run()}
                canUndo={Boolean(!editorInstance?.isDestroyed && (editorInstance as unknown as { can: () => { undo: () => boolean, redo: () => boolean } })?.can?.()?.undo?.())}
                canRedo={Boolean(!editorInstance?.isDestroyed && (editorInstance as unknown as { can: () => { undo: () => boolean, redo: () => boolean } })?.can?.()?.redo?.())}
              />
            </div>
            <button
              type="button"
              onClick={() => { setShowRibbon(false); LS.set('kgv-show-ribbon', 'false'); }}
              title="Hide Format Ribbon"
              aria-label="Hide Format Ribbon"
              className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors ml-2 cursor-pointer"
              style={{ color: theme.muted }}
            >
              <Minimize2 size={15} />
            </button>
          </div>
        )}

        {!isFocusMode && !isPreviewMode && !showRibbon && (
          <div className="flex justify-end px-6 pt-2">
            <button
              type="button"
              onClick={() => { setShowRibbon(true); LS.set('kgv-show-ribbon', 'true'); }}
              className="text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 shadow-sm backdrop-blur-md transition-all hover:scale-105 cursor-pointer"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }}
            >
              <span>Show Format Ribbon</span>
            </button>
          </div>
        )}

        {isPreviewMode && (
          <div className="max-w-3xl mx-auto w-full px-6 md:px-8 pt-12 md:pt-16 text-center transition-all duration-300">
            <h1
              className="text-3xl md:text-4xl font-serif font-semibold tracking-tight"
              style={{ fontFamily: `'${docFont}', Georgia, serif`, color: theme.text }}
            >
              {activePage?.title || 'Untitled Document'}
            </h1>
            <div className="w-12 h-0.5 mx-auto mt-4 mb-2 rounded opacity-30" style={{ backgroundColor: theme.text }} />
          </div>
        )}

        {/* Floating Paper Sheet Container & Dynamic Page Format Wrapper with momentum scroll & GPU locking */}
        <div className="flex-1 overflow-y-auto kgv-scroll kgv-momentum-scroll kgv-hardware-accelerated transition-all duration-300 ease-in-out flex flex-col items-center pt-16 pb-36 md:pt-20 md:pb-40">
          {(() => {
            const isPageless = pageFormat.paperSize === 'pageless' || isPreviewMode || isFocusMode;
            const textLength = (activePage?.content || '').replace(/<[^>]*>/g, '').length;
            const pageCount = isPageless ? 1 : Math.max(1, Math.ceil(textLength / 2200));

            const paperWidth = pageFormat.orientation === 'landscape'
              ? (PAPER_SIZES_PX[pageFormat.paperSize]?.h || 1123)
              : (PAPER_SIZES_PX[pageFormat.paperSize]?.w || 794);
            const paperHeight = pageFormat.orientation === 'landscape'
              ? (PAPER_SIZES_PX[pageFormat.paperSize]?.w || 794)
              : (PAPER_SIZES_PX[pageFormat.paperSize]?.h || 1123);

            if (isPageless) {
              return (
                <div
                  className="flex-1 flex flex-col w-full relative transition-all duration-300 ease-in-out kgv-hardware-accelerated max-w-4xl px-8 md:px-16 pt-12 pb-24 md:pt-16 md:pb-32"
                  style={{
                    maxWidth: `${formatState.maxW || 800}px`,
                    backgroundColor: 'transparent',
                    color: theme.text,
                  }}
                >
                  <Editor
                    key={activePage?.id || 'empty'}
                    theme={theme}
                    docFont={docFont}
                    fontSize={fontSize}
                    formatState={formatState}
                    onEditorReady={setEditorInstance}
                    t={t}
                    content={activePage?.content || ''}
                    onContentChange={handleContentChange}
                                        isFocusMode={isFocusMode}
                    onToggleFocusMode={handleToggleFocusMode}
                    isPreviewMode={isPreviewMode}
                    onTogglePreviewMode={handleTogglePreviewMode}
                  />
                </div>
              );
            }

            return (
              <div className="flex flex-col items-center gap-4 w-full relative pt-12 pb-24 md:pt-16 md:pb-32" style={{ maxWidth: `${paperWidth}px` }}>
                {Array.from({ length: pageCount }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-full relative rounded-2xl p-12 md:p-16 kgv-adaptive-paper flex flex-col justify-between"
                    style={{
                      width: `${paperWidth}px`,
                      minHeight: `${paperHeight}px`,
                      backgroundColor: theme.surface || '#ffffff',
                      color: theme.text,
                    }}
                  >
                    <div className="flex-1">
                      {idx === 0 && (
                        <Editor
                    key={activePage?.id || 'empty'}
                          theme={theme}
                          docFont={docFont}
                          fontSize={fontSize}
                          formatState={formatState}
                          onEditorReady={setEditorInstance}
                          t={t}
                          content={activePage?.content || ''}
                          onContentChange={handleContentChange}
                                                    isFocusMode={isFocusMode}
                          onToggleFocusMode={handleToggleFocusMode}
                          isPreviewMode={isPreviewMode}
                          onTogglePreviewMode={handleTogglePreviewMode}
                        />
                      )}
                    </div>
                    {/* Bottom-center footer page number */}
                    <div className="text-center pt-8 text-xs select-none opacity-60" style={{ color: theme.textMuted, fontFamily: uiFont }}>
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </main>

      {/* Right Panel with fluid width, smooth slide transitions & backdrop-blur edge */}
      <div
        className={`
          fixed md:relative top-0 right-0 h-full z-40 md:z-auto flex-shrink-0
          transition-all duration-300 ease-in-out transform shadow-xl md:shadow-none kgv-adaptive-panel kgv-hardware-accelerated
          ${rightOpen && !isFocusMode && !isPreviewMode ? 'translate-x-0 opacity-100 w-[300px]' : 'translate-x-full opacity-0 w-0 pointer-events-none'}
        `}
      >
        {rightOpen && !isFocusMode && !isPreviewMode && (
          <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setRightOpen(false)} />
        )}
        <RightPanel
          key={activeProjectId}
          editor={editorInstance}
          formatState={formatState}
          onFormatChange={handleFormatChange}
          pageFormat={pageFormat}
          onPageFormatChange={setPageFormat}
          theme={theme}
          themeMode={themeMode}
          customTheme={customTheme}
          docFont={docFont}
          uiFont={uiFont}
          customFont={customFont}
          lang={lang}
          t={t}
          wordCount={wordCount}
          charCount={charCount}
          onSelectTheme={handleSelectTheme}
          onCustomThemeChange={handleCustomThemeChange}
          onSelectDocFont={handleSelectDocFont}
          onSelectUiFont={handleSelectUiFont}
          onSelectLang={handleSelectLang}
          onUploadFont={handleUploadFont}
          onRemoveCustomFont={handleRemoveCustomFont}
          onOpenFontExplorer={() => setFontExplorerOpen(true)}
          apiKey={apiKey}
          onSaveApiKey={handleSaveApiKey}
          onExportTxt={handleExportTxt}
          onExportJson={handleExportJson}
          onImportFile={handleImportFile}
          onExportPdf={handleExportPdf}
          onExportDocx={handleExportDocx}
          onExportHtml={handleExportHtml}
          onExportMd={handleExportMd}
          onExportJsonBackup={handleExportJsonBackupAll}
          folders={activeProject?.folders || []}
          docs={legacyDocsExport}
                                                  onClose={() => setRightOpen(false)}
        />
      </div>

      {fontExplorerOpen && (
        <GoogleFontsPanel
          theme={theme} uiFont={uiFont} t={t} apiKey={apiKey}
          editor={editorInstance}
          onClose={() => setFontExplorerOpen(false)}
          onApplyToSelection={handleApplyFontToSelection}
          onApplyToUi={handleSelectUiFont}
          onApplyToDoc={handleSelectDocFont}
          onAssignRole={(role, fontName) => {
            if (role === 'body') handleSelectDocFont(fontName);
            else if (role === 'ui') handleSelectUiFont(fontName);
            document.documentElement.style.setProperty(`--kgv-${role}-font`, fontName);
          }}
          bodyFont={docFont}
          headingFont={formatState.headingFontFam || docFont}
          uiFontRole={uiFont}
          monoFont={formatState.monoFontFam || 'JetBrains Mono'}
        />
      )}

      {networkToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md"
             style={{
               background: networkToast.type === 'offline' ? (theme.isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(254, 226, 226, 0.95)') : (theme.isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(220, 252, 231, 0.95)'),
               borderColor: networkToast.type === 'offline' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)',
               color: theme.text,
               fontFamily: uiFont,
               fontSize: '0.85rem'
             }}>
          <div className={`w-2.5 h-2.5 rounded-full ${networkToast.type === 'offline' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          <span>{networkToast.message}</span>
          {networkToast.type === 'offline' && (
            <button
              onClick={() => {
                const title = activePage?.title || 'document';
                const text = (activePage?.content || '').replace(/<[^>]*>/g, '');
                const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${title.replace(/[\\/:*?"<>|]/g, '')}-offline-backup.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              title="Download text backup (.txt)"
              style={{
                background: theme.accent, color: '#fff', border: 'none', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              ↓ Backup .txt
            </button>
          )}
          <button onClick={() => setNetworkToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.7, padding: 2, color: theme.text }}>×</button>
        </div>
      )}



      {!sidebarOpen && (
        <div className="fixed bottom-4 left-5 z-20 text-xs pointer-events-none" style={{ color: theme.faint }}>
          {saving ? (t.saving || 'Saving...') : (t.saved || 'Saved')}
        </div>
      )}
    </div>
  );
}
