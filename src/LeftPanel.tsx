import React, { useState, useEffect } from 'react'
import { Page, Folder, SyncStatus, Project } from './types'
import { Lang, t as i18nT } from './i18n'
import { Search, Edit2, FileText, Trash2, ChevronDown, RotateCcw, X, MoreHorizontal } from 'lucide-react'

function timeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.floor(minutes / 60)}h ago`
}

function LeftPanel(props: Record<string, unknown>) {
  const cProp = props.c as Record<string, unknown> | undefined
  const themeProp = props.theme as Record<string, unknown> | undefined

  const c = {
    bg: (cProp?.bg || themeProp?.bg || '#ffffff') as string,
    heroGrad: (cProp?.heroGrad || themeProp?.heroGrad || '#ffffff') as string,
    cardGrad: (cProp?.cardGrad || themeProp?.cardGrad || '#ffffff') as string,
    text: (cProp?.text || themeProp?.text || '#111827') as string,
    textMuted: (cProp?.textMuted || themeProp?.textMuted || themeProp?.muted || '#4b5563') as string,
    textFaint: (cProp?.textFaint || themeProp?.textFaint || themeProp?.faint || '#9ca3af') as string,
    accent: (cProp?.accent || themeProp?.accent || '#2563eb') as string,
    accentLight: (cProp?.accentLight || themeProp?.accentLight || themeProp?.accentSoft || '#dbeafe') as string,
    accentMid: (cProp?.accentMid || themeProp?.accentMid || '#60a5fa') as string,
    border: (cProp?.border || themeProp?.border || '#e5e7eb') as string,
    borderFaint: (cProp?.borderFaint || themeProp?.borderFaint || '#f3f4f6') as string,
    surface: (cProp?.surface || themeProp?.surface || '#ffffff') as string,
    header: (cProp?.header || themeProp?.header || '#ffffff') as string,
    panel: (cProp?.panel || themeProp?.panel || '#ffffff') as string,
    status: (cProp?.status || themeProp?.status || '#ffffff') as string,
    isDark: Boolean(cProp?.isDark ?? themeProp?.isDark ?? false),
  }

  const uiFont = (props.uiFont || 'Inter') as string
  const lang: Lang = (props.lang || 'vi') as Lang

  const t = (l: Lang, key: string) => {
    if (props.t && typeof props.t === 'object' && (props.t as Record<string, string>)[key]) {
      return (props.t as Record<string, string>)[key]
    }
    if (typeof props.t === 'function') {
      return (props.t as (lang: Lang, k: string) => string)(l, key)
    }
    return i18nT(l, key as Parameters<typeof i18nT>[1]) || key
  }

  const projectsProp = Array.isArray(props.projects) ? (props.projects as Project[]) : []
  const activeProjectId = (props.activeProjectId || (projectsProp[0]?.id || '')) as string
  const activeProject = projectsProp.find(p => p.id === activeProjectId) || projectsProp[0]

  const onSelectProject = (props.onSelectProject || (() => {})) as (id: string) => void
  const onNewProject = (props.onNewProject || (props.onAddDoc ? (() => (props.onAddDoc as () => void)()) : (() => {}))) as () => void
  const onRenameProject = (props.onRenameProject || (() => {})) as (id: string, name: string) => void
  const onDeleteProject = (props.onDeleteProject || (() => {})) as (id: string) => void
  const onGoHome = props.onGoHome as (() => void) | undefined

  const docsProp = props.docs as Array<Record<string, unknown>> | undefined
  const rawPages = activeProject
    ? [...activeProject.pages, ...activeProject.drafts]
    : props.pages || (docsProp ? docsProp.map(d => ({
        id: d.id as string,
        title: (d.title as string) || 'Untitled',
        content: (d.content as string) || '',
        isDraft: false,
        createdAt: new Date((d.updated_at as string) || Date.now()).toISOString(),
        lastModified: new Date((d.updated_at as string) || Date.now()).toISOString(),
        folderId: (d.folder_id as string) || (d.folderId as string) || undefined,
      })) : [])
  const pages: Page[] = Array.isArray(rawPages) ? (rawPages as Page[]) : []

  const activePageId = (props.activePageId || props.activeId || '') as string
  const onSelectPage = (props.onSelectPage || props.onSelectDoc || (() => {})) as (id: string) => void
  const onNewPage = (props.onNewPage || (props.onAddDoc ? (() => (props.onAddDoc as () => void)()) : (() => {}))) as (isDraft?: boolean, folderId?: string) => void
  const onDeletePage = (props.onDeletePage || props.onDeleteDoc || (() => {})) as (id: string) => void
  const onRenamePage = (props.onRenamePage || (() => {})) as (id: string, name: string) => void
  const syncStatus: SyncStatus = (props.syncStatus || 'saved') as SyncStatus
  const lastSaved: Date = (props.lastSaved || new Date()) as Date
  const driveConnected = Boolean(props.driveConnected)
  const driveConnecting = Boolean(props.driveConnecting)
  const onConnectDrive = (props.onConnectDrive || (() => {})) as () => void
  const onDisconnectDrive = (props.onDisconnectDrive || (() => {})) as () => void
  const bin: Page[] = activeProject ? activeProject.bin : (Array.isArray(props.bin) ? (props.bin as Page[]) : [])
  const onRestorePage = (props.onRestorePage || (() => {})) as (id: string) => void
  const onPermanentDelete = (props.onPermanentDelete || (() => {})) as (id: string) => void
  const onEmptyBin = (props.onEmptyBin || (() => {})) as () => void

  const folders: Folder[] = activeProject ? activeProject.folders : (Array.isArray(props.folders) ? (props.folders as Folder[]) : [])
  const activeFolders = folders.filter(f => !f.isDeleted)

  const onRenameFolder = (props.onRenameFolder || (() => {})) as (id: string, name: string) => void
  const onDeleteFolder = (props.onDeleteFolder || (() => {})) as (id: string) => void
  const onMovePageToFolder = (props.onMovePageToFolder || props.onMoveDoc || (() => {})) as (pageId: string, folderId: string | undefined) => void
  const onCloseSidebar = (props.onCloseSidebar || props.onClose || (() => {})) as () => void

  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [renamingProjId, setRenamingProjId] = useState<string | null>(null)
  const [projRenameVal, setProjRenameVal] = useState('')
  const [, setTick] = useState(0)
  const [activeTab, setActiveTab] = useState<'pages' | 'drafts'>('pages')
  const [binOpen, setBinOpen] = useState(false)
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set())
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null)
  const [folderRenameVal, setFolderRenameVal] = useState('')
  const [folderMenuOpenId, setFolderMenuOpenId] = useState<string | null>(null)
  
  const [dragPageId, setDragPageId] = useState<string | null>(null)
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null | 'root'>('root')
  const [projSearchQuery, setProjSearchQuery] = useState('')
  const [showProjSearch, setShowProjSearch] = useState(false)

  const filteredProjects = projectsProp.filter(p => (p.title || 'Untitled Document').toLowerCase().includes(projSearchQuery.toLowerCase()))

  useEffect(() => {
    const id = setInterval(() => setTick(tk => tk + 1), 30000)
    return () => clearInterval(id)
  }, [])

  const nonDrafts = activeProject ? activeProject.pages : pages.filter(p => !p.isDraft)
  const drafts = activeProject ? activeProject.drafts : pages.filter(p => p.isDraft)

  const syncDotColor = { saved: '#4caf72', saving: '#f0a030', unsaved: c.textFaint, error: '#e05050' }[syncStatus]
  const syncLabel = {
    saved: `${t(lang, 'saved')} ${timeSince(lastSaved)}`,
    saving: t(lang, 'saving'),
    unsaved: t(lang, 'unsaved'),
    error: t(lang, 'saveError'),
  }[syncStatus]

  
  const commitRename = (id: string) => {
    if (renameVal.trim()) onRenamePage(id, renameVal.trim())
    setRenamingId(null)
  }

  const commitFolderRename = (id: string) => {
    if (folderRenameVal.trim()) onRenameFolder(id, folderRenameVal.trim())
    setRenamingFolderId(null)
  }

  const renderPage = (page: Page, indent = 0) => (
    <div onClick={() => setFolderMenuOpenId(null)}
      key={page.id}
      className="group relative"
      draggable
      onDragStart={() => setDragPageId(page.id)}
      onDragEnd={() => { setDragPageId(null); setDragOverFolderId(null) }}
      style={{
        margin: '1px 6px',
        marginLeft: 6 + indent * 14,
        borderRadius: 6,
        background: activePageId === page.id
          ? c.accentLight
          : 'transparent',
        transition: 'background 0.12s',
        opacity: dragPageId === page.id ? 0.4 : 1,
      }}
    >
      {renamingId === page.id ? (
        <input
          autoFocus
          value={renameVal}
          onChange={e => setRenameVal(e.target.value)}
          onBlur={() => commitRename(page.id)}
          onKeyDown={e => {
            if (e.key === 'Enter') commitRename(page.id)
            if (e.key === 'Escape') setRenamingId(null)
          }}
          style={{
            width: '100%', padding: '6px 10px',
            fontFamily: uiFont, fontSize: '0.78rem',
            background: 'transparent', border: 'none',
            outline: `1.5px solid ${c.accent}`, borderRadius: 5, color: c.text,
          }}
        />
      ) : (
        <div
          onClick={() => onSelectPage(page.id)}
          onDoubleClick={() => { setRenamingId(page.id); setRenameVal(page.title) }}
          style={{
            padding: '8px 44px 8px 12px',
            fontFamily: uiFont, fontSize: '0.8rem',
            color: activePageId === page.id ? c.accent : c.text,
            fontWeight: activePageId === page.id ? 600 : 400,
            cursor: 'pointer', lineHeight: 1.4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            borderLeft: activePageId === page.id ? `2px solid ${c.accent}` : '2px solid transparent',
            transition: 'color 0.12s',
          }}
        >
          {page.title}
        </div>
      )}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-surface/90 backdrop-blur-xs px-1.5 py-1 rounded shadow-xs">
        

        <button
          onClick={e => { e.stopPropagation(); onDeletePage(page.id) }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: c.textFaint }}
          onMouseEnter={e => (e.currentTarget.style.color = '#e05050')}
          onMouseLeave={e => (e.currentTarget.style.color = c.textFaint)}
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )

  const renderFolder = (folder: Folder, depth = 0) => {
    const isCollapsed = collapsedFolders.has(folder.id)
    const childFolders = activeFolders.filter(f => f.parentId === folder.id)
    const folderPages = (activeTab === 'drafts' ? drafts : nonDrafts).filter(p => p.folderId === folder.id)

    return (
      <div key={folder.id} style={{ marginLeft: depth > 0 ? 12 : 0, marginTop: 4 }}>
        <div
          className="group relative flex items-center justify-between"
          onDragOver={e => { e.preventDefault(); setDragOverFolderId(folder.id) }}
          onDragLeave={() => setDragOverFolderId(null)}
          onDrop={e => {
            e.preventDefault()
            if (dragPageId) onMovePageToFolder(dragPageId, folder.id)
            setDragOverFolderId(null)
          }}
          style={{
            padding: '4px 6px', margin: '2px 6px', borderRadius: 6,
            background: dragOverFolderId === folder.id ? c.accentLight : 'transparent',
            transition: 'background 0.1s', cursor: 'pointer',
          }}
          onClick={() => {
            setCollapsedFolders(prev => {
              const next = new Set(prev)
              if (next.has(folder.id)) next.delete(folder.id)
              else next.add(folder.id)
              return next
            })
          }}
        >
          {renamingFolderId === folder.id ? (
            <input
              autoFocus
              value={folderRenameVal}
              onChange={e => setFolderRenameVal(e.target.value)}
              onBlur={() => commitFolderRename(folder.id)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitFolderRename(folder.id)
                if (e.key === 'Escape') setRenamingFolderId(null)
              }}
              style={{
                width: '100%', padding: '4px 8px',
                fontFamily: uiFont, fontSize: '0.78rem',
                background: 'transparent', border: 'none',
                outline: `1px solid ${c.accent}`, borderRadius: 4, color: c.text,
              }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <ChevronDown
                size={14}
                style={{
                  color: c.textFaint, transition: 'transform 0.2s',
                  transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                  flexShrink: 0
                }}
              />
              <span style={{
                fontFamily: uiFont, fontSize: '0.75rem', fontWeight: 600,
                color: c.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {folder.name}
              </span>
            </div>
          )}
          
          {!renamingFolderId && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center" onClick={e => e.stopPropagation()}>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={e => { e.stopPropagation(); setFolderMenuOpenId(folderMenuOpenId === folder.id ? null : folder.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: c.textFaint }}
                  onMouseEnter={e => (e.currentTarget.style.color = c.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = c.textFaint)}
                >
                  <MoreHorizontal size={14} />
                </button>
                
                {folderMenuOpenId === folder.id && (
                  <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: c.panel, border: `1px solid ${c.borderFaint}`, borderRadius: 6, padding: '4px', display: 'flex', flexDirection: 'column', gap: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 120 }}>
                    <button
                      onClick={e => { e.stopPropagation(); onNewPage(activeTab === 'drafts', folder.id); setCollapsedFolders(prev => { const next = new Set(prev); next.delete(folder.id); return next; }); setFolderMenuOpenId(null); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', color: c.text, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontFamily: uiFont, width: '100%', textAlign: 'left', borderRadius: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = c.accentLight)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <FileText size={12} /> New Document
                    </button>
                    <div style={{ height: 1, background: c.borderFaint, margin: '2px 0' }} />
                    <button
                      onClick={e => { e.stopPropagation(); setRenamingFolderId(folder.id); setFolderRenameVal(folder.name); setFolderMenuOpenId(null); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', color: c.text, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontFamily: uiFont, width: '100%', textAlign: 'left', borderRadius: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = c.accentLight)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Edit2 size={12} /> Rename
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); onDeleteFolder(folder.id); setFolderMenuOpenId(null); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', color: '#e05050', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontFamily: uiFont, width: '100%', textAlign: 'left', borderRadius: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = c.isDark ? 'rgba(224,80,80,0.15)' : 'rgba(224,80,80,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Children */}
        {!isCollapsed && (
          <div>
            {childFolders.map(cf => renderFolder(cf, depth + 1))}
            {folderPages.map(p => renderPage(p, depth + 1))}
            {childFolders.length === 0 && folderPages.length === 0 && (
              <div
                onDragOver={e => { e.preventDefault(); setDragOverFolderId(folder.id) }}
                onDragLeave={() => setDragOverFolderId(null)}
                onDrop={e => {
                  e.preventDefault()
                  if (dragPageId) onMovePageToFolder(dragPageId, folder.id)
                  setDragOverFolderId(null)
                }}
                style={{
                  marginLeft: 6 + (depth + 1) * 14 + 6, padding: '4px 10px',
                  fontFamily: uiFont, fontSize: '0.68rem', color: c.textFaint, fontStyle: 'italic',
                }}
              >
                Drop files here
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderTabContent = (isDraftSection: boolean) => {
    const list = isDraftSection ? drafts : nonDrafts
    const rootFolders = folders.filter(f => f.parentId === null)
    const rootPages = list.filter(p => !p.folderId || !folders.find(f => f.id === p.folderId))

    return (
      <div>
        {/* Root folders */}
        {rootFolders.map(f => renderFolder(f, 0))}

        {/* Root-level pages drop zone */}
        {rootPages.length === 0 && rootFolders.length === 0 ? (
          <div
            onDragOver={e => { e.preventDefault(); setDragOverFolderId('root') }}
            onDragLeave={() => setDragOverFolderId(null)}
            onDrop={e => {
              e.preventDefault()
              if (dragPageId) onMovePageToFolder(dragPageId, undefined)
              setDragOverFolderId(null)
            }}
            style={{
              padding: '10px 12px', fontFamily: uiFont, fontSize: '0.72rem',
              color: c.textFaint, fontStyle: 'italic',
              background: dragOverFolderId === 'root' ? c.accentLight : 'transparent',
              borderRadius: 6, margin: '2px 6px', transition: 'background 0.1s',
            }}
          >
            {isDraftSection ? 'No drafts yet. Click + to start one.' : 'No pages yet. Click + to create one.'}
          </div>
        ) : (
          <div
            onDragOver={e => { e.preventDefault(); setDragOverFolderId('root') }}
            onDragLeave={() => setDragOverFolderId(null)}
            onDrop={e => {
              e.preventDefault()
              if (dragPageId) onMovePageToFolder(dragPageId, undefined)
              setDragOverFolderId(null)
            }}
            style={{
              background: dragOverFolderId === 'root' ? c.accentLight : 'transparent',
              border: dragOverFolderId === 'root' ? `1px dashed ${c.accentMid}` : '1px solid transparent',
              borderRadius: 6, margin: '2px 4px', transition: 'all 0.1s',
            }}
          >
            {rootPages.map(p => renderPage(p, 0))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      onClick={() => setFolderMenuOpenId(null)}
      className="backdrop-blur-md bg-opacity-70"
      style={{
        width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column',
        height: '100%', maxHeight: '100dvh',
        background: c.isDark ? '#121212' : c.bg,
        borderRight: `1px solid ${c.borderFaint}`,
        overflow: 'hidden',
      }}
    >
      {/* Project Switcher Header */}
      <div style={{
        padding: '10px 10px 8px',
        borderBottom: `1px solid ${c.borderFaint}`,
        background: c.isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
          {onGoHome && (
            <button
              type="button"
              onClick={onGoHome}
              title="Return to Welcome Screen"
              style={{
                background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted,
                padding: '2px', display: 'flex', alignItems: 'center'
              }}
              onMouseEnter={e => (e.currentTarget.style.color = c.accent)}
              onMouseLeave={e => (e.currentTarget.style.color = c.textMuted)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </button>
          )}
          <span style={{
            fontFamily: uiFont, fontSize: '10px', fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textFaint, flex: 1
          }}>
            Projects
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              onClick={onNewProject}
              title="Create New Document"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-transparent border border-neutral-200/20 dark:border-neutral-800/40 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-500/10 transition-all text-[11px] font-medium cursor-pointer"
              style={{ fontFamily: uiFont }}
            >
              <span className="text-xs leading-none">+</span>
              <span>New Doc</span>
            </button>
            {Boolean(props.onCloseSidebar || props.onClose) && (
              <button
                type="button"
                onClick={onCloseSidebar}
                title={t(lang, 'collapse') || 'Collapse'}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 24, height: 24, borderRadius: 5,
                  border: `1px solid ${c.borderFaint}`,
                  background: 'transparent', color: c.textMuted,
                  cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = c.text; e.currentTarget.style.background = c.accentLight }}
                onMouseLeave={e => { e.currentTarget.style.color = c.textMuted; e.currentTarget.style.background = 'transparent' }}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {projectsProp.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%' }}>
              {renamingProjId === activeProjectId ? (
                <input
                  autoFocus
                  value={projRenameVal}
                  onChange={e => setProjRenameVal(e.target.value)}
                  onBlur={() => { if (projRenameVal.trim()) onRenameProject(activeProjectId, projRenameVal.trim()); setRenamingProjId(null) }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { if (projRenameVal.trim()) onRenameProject(activeProjectId, projRenameVal.trim()); setRenamingProjId(null) }
                    if (e.key === 'Escape') setRenamingProjId(null)
                  }}
                  style={{
                    width: '100%', padding: '4px 8px', fontFamily: uiFont, fontSize: '0.76rem',
                    background: 'transparent', border: `1px solid ${c.accent}`, borderRadius: 5, color: c.text,
                  }}
                />
              ) : (
                <>
                  <select
                    value={activeProjectId}
                    onChange={e => onSelectProject(e.target.value)}
                    style={{
                      flex: 1, padding: '5px 6px', borderRadius: 5,
                      border: `1px solid ${c.borderFaint}`,
                      background: c.surface, color: c.text,
                      fontFamily: uiFont, fontSize: '0.76rem', fontWeight: 600,
                      outline: 'none', cursor: 'pointer', minWidth: 0,
                    }}
                  >
                    {filteredProjects.map(p => (
                      <option key={p.id} value={p.id} style={{ background: c.isDark ? '#1f2937' : '#ffffff', color: c.text }}>
                        {p.title || 'Untitled Document'}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    title="Search Projects"
                    onClick={() => setShowProjSearch(v => !v)}
                    style={{
                      background: 'none', border: `1px solid ${showProjSearch ? c.accent : c.borderFaint}`,
                      borderRadius: 4, cursor: 'pointer',
                      color: showProjSearch ? c.accent : c.textFaint, padding: '4px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <Search size={14} />
                  </button>
                  <button
                    type="button"
                    title="Rename Project"
                    onClick={() => { setRenamingProjId(activeProjectId); setProjRenameVal(activeProject?.title || '') }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: c.textFaint, display: 'flex', alignItems: 'center', padding: '3px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = c.accent)}
                    onMouseLeave={e => (e.currentTarget.style.color = c.textFaint)}
                  >
                    <Edit2 size={13} />
                  </button>
                  {projectsProp.length > 1 && (
                    <button
                      type="button"
                      title="Delete Project"
                      onClick={() => {
                        if (window.confirm(`Delete project "${activeProject?.title || 'Untitled'}" and all its pages?`)) {
                          onDeleteProject(activeProjectId)
                        }
                      }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: c.textFaint, display: 'flex', alignItems: 'center', padding: '3px',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#e05050')}
                      onMouseLeave={e => (e.currentTarget.style.color = c.textFaint)}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </>
              )}
            </div>
            {showProjSearch && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', marginTop: 2 }}>
                <input
                  autoFocus
                  placeholder="Search projects..."
                  value={projSearchQuery}
                  onChange={e => setProjSearchQuery(e.target.value)}
                  style={{
                    width: '100%', padding: '4px 8px', fontFamily: uiFont, fontSize: '0.72rem',
                    background: c.surface, border: `1px solid ${c.borderFaint}`, borderRadius: 4,
                    color: c.text, outline: 'none'
                  }}
                />
                {projSearchQuery && (
                  <button
                    onClick={() => setProjSearchQuery('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textFaint, display: 'flex', alignItems: 'center', padding: '2px' }}
                    title="Clear search"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab strip */}
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${c.borderFaint}`, flexShrink: 0 }}>
        {(['pages', 'drafts'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: '8px 4px', background: 'none', border: 'none',
              borderBottom: `2px solid ${activeTab === tab ? c.accent : 'transparent'}`,
              fontFamily: uiFont, fontSize: '0.7rem', fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? c.accent : c.textFaint,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {t(lang, tab)}
            <span style={{ marginLeft: 4, fontSize: '0.62rem', opacity: 0.7 }}>
              ({tab === 'pages' ? nonDrafts.length : drafts.length})
            </span>
          </button>
        ))}
        {/* New page */}
        <button
          onClick={() => onNewPage(activeTab === 'drafts')}
          title={activeTab === 'drafts' ? t(lang, 'newDraft') : t(lang, 'newPage')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: c.textFaint, fontSize: '1rem', lineHeight: 1,
            padding: '4px 6px', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = c.accent)}
          onMouseLeave={e => (e.currentTarget.style.color = c.textFaint)}
        >
          +
        </button>
        
      </div>

      {/* Main scrollable body */}
      <div style={{ flex: 1, height: '100%', maxHeight: '100dvh', overflowY: 'auto', overflowX: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Tab content */}
        <div style={{ flex: 1, paddingTop: 6, paddingBottom: 8, minHeight: 0 }}>
          {renderTabContent(activeTab === 'drafts')}
        </div>

        {/* Bin */}
        <div style={{ borderTop: `1px solid ${c.borderFaint}`, padding: '8px 0 4px', flexShrink: 0 }}>
          <button
            onClick={() => setBinOpen(v => !v)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 12px', background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: uiFont, fontSize: '0.62rem', fontWeight: 600,
              textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textFaint,
              transition: 'color 0.12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = c.accent)}
            onMouseLeave={e => (e.currentTarget.style.color = c.textFaint)}
          >
            <span>{t(lang, 'bin')}{bin.length > 0 ? ` (${bin.length})` : ''}</span>
            <span style={{ fontSize: '0.6rem', transform: binOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
          </button>
          {binOpen && (
            <div style={{ padding: '4px 0' }}>
              {bin.length === 0 ? (
                <div style={{ padding: '6px 12px', fontFamily: uiFont, fontSize: '0.72rem', color: c.textFaint, fontStyle: 'italic' }}>
                  {t(lang, 'deletedItems')} (0)
                </div>
              ) : (
                <>
                  {bin.map(page => (
                    <div key={page.id} style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ flex: 1, fontFamily: uiFont, fontSize: '0.78rem', color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {page.title}
                      </span>
                      <button onClick={() => onRestorePage(page.id)} title={t(lang, 'restore')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.accent, display: 'flex', alignItems: 'center', padding: '2px', flexShrink: 0 }}>
                        <RotateCcw size={12} />
                      </button>
                      <button onClick={() => onPermanentDelete(page.id)} title={t(lang, 'deleteForever')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textFaint, display: 'flex', alignItems: 'center', padding: '2px', flexShrink: 0, transition: 'color 0.12s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#e05050')}
                        onMouseLeave={e => (e.currentTarget.style.color = c.textFaint)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button onClick={onEmptyBin}
                    style={{
                      display: 'block', width: 'calc(100% - 24px)', margin: '4px 12px',
                      padding: '4px 8px', borderRadius: 5, border: `1px solid ${c.borderFaint}`,
                      background: 'none', cursor: 'pointer',
                      fontFamily: uiFont, fontSize: '0.68rem', color: c.textFaint,
                      transition: 'color 0.12s, border-color 0.12s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#e05050'; e.currentTarget.style.borderColor = '#e05050' }}
                    onMouseLeave={e => { e.currentTarget.style.color = c.textFaint; e.currentTarget.style.borderColor = c.borderFaint }}>
                    {t(lang, 'emptyBin')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Sync status */}
        <div style={{ padding: '8px 14px', borderTop: `1px solid ${c.borderFaint}`, display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', background: syncDotColor, flexShrink: 0,
            boxShadow: syncStatus === 'saving' ? `0 0 0 3px ${syncDotColor}44` : 'none',
            animation: syncStatus === 'saving' ? 'pulse 1.2s ease-in-out infinite' : 'none',
            transition: 'background 0.3s, box-shadow 0.3s',
          }} />
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
          <span style={{ fontFamily: uiFont, fontSize: '0.68rem', color: c.textFaint, lineHeight: 1.4 }}>{syncLabel}</span>
        </div>

        {/* Google Drive */}
        <div style={{ padding: '10px 14px', borderTop: `1px solid ${c.borderFaint}`, flexShrink: 0 }}>
          <span style={{ fontFamily: uiFont, fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.textFaint, display: 'block', marginBottom: 7 }}>
            {t(lang, 'googleDrive')}
          </span>
          {driveConnected ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M4.5 20L1 14l5.5-9.5h11L23 14l-3.5 6H4.5z" fill="#4285f4" opacity="0.2"/>
                  <path d="M8 20l-4-6.5 4-7h8l4 7-4 6.5H8z" stroke="#4285f4" strokeWidth="1.5" fill="none"/>
                </svg>
                <span style={{ fontFamily: uiFont, fontSize: '0.72rem', color: c.text }}>drive@gmail.com</span>
              </div>
              <button onClick={onDisconnectDrive}
                style={{ fontFamily: uiFont, fontSize: '0.68rem', color: c.textFaint, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', transition: 'color 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e05050')}
                onMouseLeave={e => (e.currentTarget.style.color = c.textFaint)}>
                {t(lang, 'disconnect')}
              </button>
            </div>
          ) : (
            <button onClick={onConnectDrive} disabled={driveConnecting}
              style={{
                width: '100%', padding: '6px 10px', borderRadius: 6, border: `1px solid ${c.border}`,
                background: driveConnecting ? c.accentLight : 'transparent',
                fontFamily: uiFont, fontSize: '0.74rem', color: driveConnecting ? c.accent : c.textMuted,
                cursor: driveConnecting ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!driveConnecting) e.currentTarget.style.borderColor = c.accentMid }}
              onMouseLeave={e => { if (!driveConnecting) e.currentTarget.style.borderColor = c.border }}>
              {driveConnecting ? (
                <>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                  <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
                  {t(lang, 'connecting')}
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill={c.textMuted}>
                    <path d="M4.5 20L1 14l5.5-9.5h11L23 14l-3.5 6H4.5z"/>
                  </svg>
                  {t(lang, 'connectDrive')}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(LeftPanel);
