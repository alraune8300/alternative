const fs = require('fs');

let content = fs.readFileSync('src/LeftPanel.tsx', 'utf8');

// 1. Restore background adaptive color
content = content.replace(/background: c\.isDark \? '#0f1f1a' : c\.bg/g, "background: c.isDark ? '#121212' : c.bg");

// 2. Remove ThemePicker import
content = content.replace(/import \{ ThemePicker \} from '\.\/ThemePicker'\n/g, "");

// 3. Remove GitHub cloud save from the header
const headerGithubStart = content.indexOf('{onOpenGithubCloudSave && (');
if (headerGithubStart > -1) {
  const headerGithubEnd = content.indexOf('</button>\n          )}', headerGithubStart) + 22;
  content = content.slice(0, headerGithubStart) + content.slice(headerGithubEnd);
}

// 4. Update the Footer
const footerStart = content.indexOf('{/* Footer */}');
const binOverlayStart = content.indexOf('{/* Bin Overlay */}');

if (footerStart > -1 && binOverlayStart > -1) {
  const newFooter = `{/* Footer */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0, borderTop: \`1px solid \${c.borderFaint}\` }}>
        {onOpenGithubCloudSave && (
          <button 
            onClick={onOpenGithubCloudSave}
            style={{ 
              width: '100%', padding: '8px 10px', borderRadius: 8, border: \`1px solid \${c.border}\`, 
              background: 'transparent', color: c.text, fontFamily: uiFont, fontSize: '0.75rem', fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.accent; e.currentTarget.style.background = c.surface }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = c.border; e.currentTarget.style.background = 'transparent' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            Cloud Save & Sync
          </button>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={() => setBinOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textFaint, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }} title="Bin">
              <Trash2 size={16} /> BIN
            </button>
          </div>
          
          {/* Sync Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.65rem', color: c.textFaint, fontFamily: uiFont }}>{syncLabel}</span>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: syncDotColor, boxShadow: syncStatus === 'saving' ? \`0 0 0 3px \${syncDotColor}44\` : 'none', transition: 'all 0.3s' }} />
          </div>
        </div>
      </div>
      
      `;
  
  content = content.slice(0, footerStart) + newFooter + content.slice(binOverlayStart);
}

// 5. Update renderPage to be minimalist
const renderPageStart = content.indexOf('  const renderPage = (page: Page, indent = 0) => {');
const renderFolderStart = content.indexOf('  const renderFolder = (folder: Folder, depth = 0) => {');

if (renderPageStart > -1 && renderFolderStart > -1) {
  const newRenderPage = `  const renderPage = (page: Page, indent = 0) => {
    const isHoveredOrActive = activePageId === page.id;
    return (
      <div 
        key={page.id}
        className="group relative"
        draggable
        onDragStart={() => setDragPageId(page.id)}
        onDragEnd={() => { setDragPageId(null); setDragOverFolderId(null) }}
        style={{
          margin: '2px 8px',
          marginLeft: 8 + indent * 14,
          borderRadius: 6,
          background: isHoveredOrActive ? c.accentLight : 'transparent',
          padding: '8px 12px',
          cursor: 'pointer',
          transition: 'all 0.1s',
          opacity: dragPageId === page.id ? 0.4 : 1,
          display: 'flex', flexDirection: 'column', gap: 4,
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
                fontFamily: uiFont, fontSize: '0.8rem',
                background: 'transparent', border: 'none',
                outline: \`1.5px solid \${c.accent}\`, borderRadius: 4, color: c.text,
              }}
            />
          ) : (
            <span style={{
              fontFamily: uiFont, fontSize: '0.8rem', fontWeight: isHoveredOrActive ? 600 : 400,
              color: isHoveredOrActive ? c.accent : c.text, lineHeight: 1.3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1
            }}>
              {page.title}
            </span>
          )}
          
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1" style={{ background: isHoveredOrActive ? c.accentLight : c.bg, borderRadius: 4 }}>
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
      </div>
    )
  }

`;
  content = content.slice(0, renderPageStart) + newRenderPage + content.slice(renderFolderStart);
}

fs.writeFileSync('src/LeftPanel.tsx', content);
console.log("Rewrite complete.");
