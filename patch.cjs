const fs = require('fs');
let code = fs.readFileSync('src/LeftPanel.tsx', 'utf8');
code = code.replace(
`              {hoverFolderId === folder.id && (
                <div style={{ display: 'flex', gap: 3, flexShrink: 0, alignItems: 'center' }}>
                  <button
                    title="New subfolder"
                    onClick={e => { e.stopPropagation(); onCreateFolder(folder.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: c.textFaint, display: 'flex', alignItems: 'center' }}
                    onMouseEnter={e => (e.currentTarget.style.color = c.accent)}
                    onMouseLeave={e => (e.currentTarget.style.color = c.textFaint)}
                  >
                    <Plus size={13} />
                  </button>
                  <button
                    title="New document"
                    onClick={e => { e.stopPropagation(); onNewPage(activeTab === 'drafts', folder.id); setCollapsedFolders(prev => { const next = new Set(prev); next.delete(folder.id); return next; }); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: c.textFaint, display: 'flex', alignItems: 'center' }}
                    onMouseEnter={e => (e.currentTarget.style.color = c.accent)}
                    onMouseLeave={e => (e.currentTarget.style.color = c.textFaint)}
                  >
                    <FileText size={12} />
                  </button>
                  <button
                    title="Delete folder"
                    onClick={e => { e.stopPropagation(); onDeleteFolder(folder.id) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: c.textFaint, display: 'flex', alignItems: 'center' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#e05050')}
                    onMouseLeave={e => (e.currentTarget.style.color = c.textFaint)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}`,
`              <div style={{ position: 'relative' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setFolderMenuOpenId(folderMenuOpenId === folder.id ? null : folder.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: c.textFaint, display: 'flex', alignItems: 'center', opacity: (hoverFolderId === folder.id || folderMenuOpenId === folder.id || (typeof window !== 'undefined' && 'ontouchstart' in window)) ? 1 : 0, transition: 'opacity 0.2s' }}
                >
                  <MoreHorizontal size={14} />
                </button>
                {folderMenuOpenId === folder.id && (
                  <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 50, background: c.panel, border: \`1px solid \${c.borderFaint}\`, borderRadius: 6, padding: '4px', display: 'flex', flexDirection: 'column', gap: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minWidth: 120 }}>
                    <button
                      onClick={e => { e.stopPropagation(); onCreateFolder(folder.id); setFolderMenuOpenId(null); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', color: c.text, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontFamily: uiFont, width: '100%', textAlign: 'left', borderRadius: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = c.accentLight)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Plus size={13} /> New Subfolder
                    </button>
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
              </div>`
);
fs.writeFileSync('src/LeftPanel.tsx', code);
