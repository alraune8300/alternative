const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add rightPanelTab state
const statePattern = /const \[isHistoryOpen, setIsHistoryOpen\] = useState\(false\);/;
code = code.replace(statePattern, "const [rightPanelTab, setRightPanelTab] = useState<string>('settings');");

// 2. Remove <VersionHistoryPanel ... />
const vhpPattern = /<VersionHistoryPanel[\s\S]*?onRestore=\{\(content, title\) => \{[\s\S]*?\}\}\s*\/>/;
code = code.replace(vhpPattern, "");

// 3. Update Toolbar callbacks
const toolbarPattern = /onToggleSettings=\{[^}]*\}\s*onToggleHistory=\{[^}]*\}/;
code = code.replace(toolbarPattern, `onToggleSettings={() => {
          if (rightOpen && rightPanelTab === 'settings') setRightOpen(false);
          else { setRightPanelTab('settings'); setRightOpen(true); }
        }}
        onToggleHistory={() => {
          if (rightOpen && rightPanelTab === 'history') setRightOpen(false);
          else { setRightPanelTab('history'); setRightOpen(true); }
        }}`);

// 4. Update RightPanel props
const rightPanelStart = /<RightPanel\s*key=\{activeProjectId\}/;
code = code.replace(rightPanelStart, `<RightPanel
          key={activeProjectId}
          panel={rightPanelTab}
          onSectionChange={setRightPanelTab}
          activePage={activePage || null}
          onRestore={(content, title) => {
            updateActivePage({ content, title, lastModified: new Date().toISOString() });
            if (activeProjectId) {
              renamePage(activePageId, title);
            }
          }}`);

fs.writeFileSync('src/App.tsx', code);
