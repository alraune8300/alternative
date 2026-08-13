const fs = require('fs');
let code = fs.readFileSync('src/RightPanel.tsx', 'utf8');

// 1. Add import
if (!code.includes('import VersionHistoryPanel')) {
  code = code.replace(
    /import GoogleFontsPanel from '\.\/GoogleFontsPanel'/,
    "import GoogleFontsPanel from './GoogleFontsPanel'\nimport VersionHistoryPanel from './VersionHistoryPanel'"
  );
}

// 2. Add History to TABS
code = code.replace(
  /\{ key: 'timer', icon: '◷', label: 'Timer' \},/,
  "{ key: 'timer', icon: '◷', label: 'Timer' },\n    { key: 'history', icon: '⟲', label: 'History' },"
);

// 3. Add History label in the panel title
code = code.replace(
  /panel === 'timer' \? \(t\(lang, 'timer'\) \|\| 'Timer'\) :/,
  "panel === 'timer' ? (t(lang, 'timer') || 'Timer') :\n                 panel === 'history' ? (t(lang, 'versionHistory') || 'History') :"
);

// 4. Add the actual history panel rendering
const renderHistory = `
        {/* HISTORY PANEL */}
        {panel === 'history' && (
          <VersionHistoryPanel
            activePage={props.activePage as any}
            theme={props.theme as any}
            lang={lang}
            uiFont={uiFont}
            onRestore={props.onRestore as any}
          />
        )}
`;

code = code.replace(
  /\{\/\* SETTINGS PANEL \*\/\}/,
  `${renderHistory}\n        {/* SETTINGS PANEL */}`
);

fs.writeFileSync('src/RightPanel.tsx', code);
