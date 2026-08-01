const fs = require('fs');

const missingCode = `
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
              onBlur={() => commitRenameFolder(folder.id)}
              onKeyDown={e => {
                if (e.key === 'Enter') commitRenameFolder(folder.id)
                if (e.key === 'Escape') setRenamingFolderId(null)
              }}
              style={{
                width: '100%', padding: '4px 8px',
                fontFamily: uiFont, fontSize: '0.78rem',
                background: 'transparent', border: 'none',
                outline: \`1px solid \${c.accent}\`, borderRadius: 4, color: c.text,
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
                  <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: c.panel, border: \`1px solid \${c.borderFaint}\`, borderRadius: 6, padding: '4px', display: 'flex', flexDirection: 'column', gap: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 120 }}>
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
`;

let code = fs.readFileSync('src/LeftPanel.tsx', 'utf8');

// I will just split by lines and replace 205-234
let lines = code.split('\n');
lines.splice(204, 31, missingCode);

fs.writeFileSync('src/LeftPanel.tsx', lines.join('\n'));
