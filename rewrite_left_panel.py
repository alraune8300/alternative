import re

with open('src/LeftPanel.tsx', 'r') as f:
    content = f.read()

# Replace renderPage
new_render_page = """  const renderPage = (page: Page, indent = 0) => {
    const isHoveredOrActive = activePageId === page.id;
    return (
      <div 
        key={page.id}
        className="group relative"
        draggable
        onDragStart={() => setDragPageId(page.id)}
        onDragEnd={() => { setDragPageId(null); setDragOverFolderId(null) }}
        style={{
          margin: '4px 8px',
          marginLeft: 8 + indent * 14,
          borderRadius: 12,
          border: `1px solid ${isHoveredOrActive ? c.accent : c.border}`,
          background: isHoveredOrActive ? c.accentLight : c.surface,
          padding: '12px 14px',
          cursor: 'pointer',
          transition: 'all 0.15s',
          opacity: dragPageId === page.id ? 0.4 : 1,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}
        onClick={() => { setFolderMenuOpenId(null); onSelectPage(page.id) }}
        onDoubleClick={() => { setFolderMenuOpenId(null); setRenamingId(page.id); setRenameVal(page.title) }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
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
              onClick={e => e.stopPropagation()}
              style={{
                flex: 1, padding: '2px 4px',
                fontFamily: uiFont, fontSize: '0.85rem',
                background: 'transparent', border: 'none',
                outline: `1.5px solid ${c.accent}`, borderRadius: 4, color: c.text,
              }}
            />
          ) : (
            <span style={{
              fontFamily: uiFont, fontSize: '0.85rem', fontWeight: 500,
              color: c.text, lineHeight: 1.3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1
            }}>
              {page.title}
            </span>
          )}
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1" style={{ background: isHoveredOrActive ? c.accentLight : c.surface, borderRadius: 4 }}>
            <button
              onClick={e => { e.stopPropagation(); onDeletePage(page.id) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: c.textFaint }}
              onMouseEnter={e => (e.currentTarget.style.color = '#e05050')}
              onMouseLeave={e => (e.currentTarget.style.color = c.textFaint)}
              title="Delete"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: c.textFaint }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span style={{ fontSize: '0.65rem', fontFamily: uiFont }}>{timeSince(new Date(page.updatedAt || Date.now()))}</span>
          </div>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: c.accent, opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.isDark ? '#000' : '#fff', fontSize: '0.5rem', fontWeight: 'bold' }}>
            A
          </div>
        </div>
      </div>
    )
  }"""

# Use regex to replace renderPage
content = re.sub(r'  const renderPage = \(page: Page, indent = 0\) => \(\s*<div.*?</div>\s*\)\s*const renderFolder', new_render_page + '\n\n  const renderFolder', content, flags=re.DOTALL)

# Let's verify we matched properly. If not, we will use index based replacement.
with open('src/LeftPanel.tsx', 'w') as f:
    f.write(content)

