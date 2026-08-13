const fs = require('fs');

let content = fs.readFileSync('src/LeftPanel.tsx', 'utf8');

// Fix dragOverFolderId initialization
content = content.replace(
  "const [dragOverFolderId, setDragOverFolderId] = useState<string | null | 'root'>('root')",
  "const [dragOverFolderId, setDragOverFolderId] = useState<string | null | 'root'>(null)"
);

// Fix the header layout to perfectly align Home and Project Switcher
const headerStart = content.indexOf('{/* Header */}');
const headerEnd = content.indexOf('{/* Project Switcher Dropdown (Conditional) */}');

if (headerStart > -1 && headerEnd > -1) {
  const newHeader = `{/* Header */}
      <div style={{ padding: '16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: \`1px solid \${c.borderFaint}\` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          {onGoHome && (
            <button
              onClick={onGoHome}
              title="Return to Welcome Screen"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </button>
          )}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1, overflow: 'hidden' }}
            onClick={() => setShowProjSearch(v => !v)}
            title="Switch Project"
          >
            <div style={{ position: 'relative', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FolderIcon size={18} style={{ color: c.accent, fill: c.accent, opacity: 0.2, position: 'absolute' }} />
              <FolderIcon size={18} style={{ color: c.accent, position: 'absolute' }} />
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: c.text, fontFamily: uiFont, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeProject?.title || 'English'}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
      `;
  
  content = content.slice(0, headerStart) + newHeader + content.slice(headerEnd);
}

// Remove dashed borders from root pages drop zone to be completely transparent unless hovered
content = content.replace(
  "border: dragOverFolderId === 'root' ? `1px dashed ${c.accentMid}` : '1px solid transparent',",
  "border: dragOverFolderId === 'root' ? `1px dashed ${c.accentMid}` : 'none',"
);

// We should also check the root folders dropzone
content = content.replace(
  "border: dragOverFolderId === 'root' ? `1px dashed ${c.accentMid}` : '1px solid transparent',",
  "border: dragOverFolderId === 'root' ? `1px dashed ${c.accentMid}` : 'none',"
);

fs.writeFileSync('src/LeftPanel.tsx', content);
console.log("Fixes complete.");
