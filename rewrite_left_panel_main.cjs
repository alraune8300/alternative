const fs = require('fs');

let content = fs.readFileSync('src/LeftPanel.tsx', 'utf8');

const returnStart = content.lastIndexOf('  return (');

if (returnStart > -1) {
  const newReturn = `  return (
    <div
      onClick={() => setFolderMenuOpenId(null)}
      style={{
        width: 280, flexShrink: 0, display: 'flex', flexDirection: 'column',
        height: '100%', maxHeight: '100%',
        background: c.isDark ? '#0f1f1a' : c.bg, // using a dark green if dark mode, else default
        borderRight: \`1px solid \${c.borderFaint}\`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
          onClick={() => setShowProjSearch(v => !v)}
          title="Switch Project"
        >
          <Folder size={20} style={{ color: c.accent, fill: c.accent, opacity: 0.2 }} />
          <Folder size={20} style={{ color: c.accent, position: 'absolute' }} />
          <span style={{ fontSize: '1.05rem', fontWeight: 600, color: c.text, fontFamily: uiFont, marginLeft: 28 }}>
            {activeProject?.title || 'English'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {onOpenGithubCloudSave && (
            <button 
              onClick={onOpenGithubCloudSave}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textFaint }}
              title="GitHub Cloud Sync"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </button>
          )}
          {Boolean(props.onCloseSidebar || props.onClose) && (
            <button
              onClick={onCloseSidebar}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textFaint }}
              title="Close Sidebar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            </button>
          )}
        </div>
      </div>

      {/* Project Switcher Dropdown (Conditional) */}
      {showProjSearch && (
        <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8, borderBottom: \`1px solid \${c.borderFaint}\` }}>
           <input
              autoFocus
              placeholder={t(lang, 'searchProjects')}
              value={projSearchQuery}
              onChange={e => setProjSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '6px 10px', fontFamily: uiFont, fontSize: '0.8rem',
                background: c.surface, border: \`1px solid \${c.borderFaint}\`, borderRadius: 6,
                color: c.text, outline: 'none'
              }}
            />
            {/* Simple buttons for new project etc */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onNewProject} style={{ flex: 1, padding: '4px', background: c.accentLight, color: c.accent, borderRadius: 4, fontSize: '0.75rem', fontWeight: 500 }}>+ New</button>
              <button onClick={handleLeftPanelImport} style={{ flex: 1, padding: '4px', background: c.surface, color: c.textMuted, border: \`1px solid \${c.borderFaint}\`, borderRadius: 4, fontSize: '0.75rem' }}>Import</button>
            </div>
        </div>
      )}

      {/* Main scrollable body */}
      <div style={{ flex: 1, height: '100%', overflowY: 'auto', overflowX: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column', padding: '8px 6px' }}>
        
        {/* Pages Section */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {folders.filter(f => f.parentId === null).map(f => renderFolder(f, 0))}
          {nonDrafts.filter(p => !p.folderId || !folders.find(f => f.id === p.folderId)).map(p => renderPage(p, 0))}
        </div>

        {/* Drafts Section */}
        <div style={{ marginTop: 32, marginBottom: 16 }}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', marginBottom: 12 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
               <span style={{ fontSize: '1rem', fontWeight: 500, color: c.text, fontFamily: uiFont }}>Drafts</span>
             </div>
             <button 
               onClick={() => onNewPage(true)} 
               style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textFaint }}
             >
               <Plus size={16} />
             </button>
           </div>
           
           {drafts.length === 0 ? (
             <div style={{ margin: '0 10px', background: c.surface, borderRadius: 16, padding: '24px 20px', textAlign: 'center', border: \`1px solid \${c.borderFaint}\` }}>
               <p style={{ fontSize: '0.85rem', color: c.textMuted, marginBottom: 16, lineHeight: 1.4 }}>Use drafts to manage edits, feedback, and collaboration.</p>
               <button 
                 onClick={() => onNewPage(true)} 
                 style={{ 
                   background: '#86efac', color: '#064e3b', // A green accent similar to the template
                   padding: '10px 16px', borderRadius: 12, fontWeight: 600, fontSize: '0.85rem', 
                   width: '100%', border: 'none', cursor: 'pointer',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                 }}>
                 <Plus size={16} /> Create new draft
               </button>
             </div>
           ) : (
             <div style={{ display: 'flex', flexDirection: 'column' }}>
               {drafts.map(p => renderPage(p, 0))}
             </div>
           )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textFaint }} title="Help">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          </button>
          
          {onSelectTheme && (
            <ThemePicker 
              theme={c as ThemeColors} 
              themeMode={themeMode} 
              onSelectTheme={onSelectTheme} 
              lang={lang} 
              popoverPlacement="top-right"
            />
          )}

          <button onClick={() => setBinOpen(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textFaint }} title="Bin">
            <Trash2 size={20} />
          </button>
        </div>
      </div>
      
      {/* Bin Overlay (if open) */}
      {binOpen && (
        <div style={{ position: 'absolute', bottom: 60, left: 16, width: 248, background: c.panel, border: \`1px solid \${c.border}\`, borderRadius: 12, padding: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: c.textMuted, textTransform: 'uppercase' }}>Bin</span>
            <button onClick={onEmptyBin} style={{ fontSize: '0.7rem', color: '#e05050', background: 'none', border: 'none', cursor: 'pointer' }}>Empty</button>
          </div>
          {bin.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: c.textFaint }}>Empty</div>
          ) : (
            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {bin.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: c.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                  <button onClick={() => onRestorePage(p.id)} style={{ padding: 4, background: c.accentLight, color: c.accent, borderRadius: 4, border: 'none', cursor: 'pointer' }}><RotateCcw size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default React.memo(LeftPanel);
`;
  
  content = content.slice(0, returnStart) + newReturn;
  fs.writeFileSync('src/LeftPanel.tsx', content);
  console.log("Replaced return block");
} else {
  console.error("Could not find targets");
}
