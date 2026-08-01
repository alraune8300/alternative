const fs = require('fs');

function removeFootnotesApp() {
  let code = fs.readFileSync('src/App.tsx', 'utf8');
  code = code.replace(/const \[footnotes, setFootnotes\] = useState<Footnote\[\]>\(\[\]\);\n/g, '');
  code = code.replace(/const handleAddFootnote = useCallback\(\(\) => \{[\s\S]*?\}, \[footnotes\.length\]\);\n/g, '');
  code = code.replace(/const handleUpdateFootnote = useCallback\(\(id: string, content: string\) => \{[\s\S]*?\}, \[\]\);\n/g, '');
  code = code.replace(/const handleDeleteFootnote = useCallback\(\(id: string\) => \{[\s\S]*?\}, \[\]\);\n/g, '');
  code = code.replace(/footnotesCount=\{footnotes\.length\}\n/g, '');
  code = code.replace(/onInsertFootnote=\{handleAddFootnote\}\n/g, '');
  code = code.replace(/onOpenFootnotesPanel=\{[^\}]+\}\n/g, '');
  code = code.replace(/footnotes=\{footnotes\}\n/g, '');
  code = code.replace(/onUpdateFootnote=\{handleUpdateFootnote\}\n/g, '');
  code = code.replace(/onDeleteFootnote=\{handleDeleteFootnote\}\n/g, '');
  code = code.replace(/onAddFootnote=\{handleAddFootnote\}\n/g, '');
  fs.writeFileSync('src/App.tsx', code);
}

function removeFootnotesEditor() {
  let code = fs.readFileSync('src/Editor.tsx', 'utf8');
  code = code.replace(/footnotes: Footnote\[\];\n/g, '');
  code = code.replace(/footnotes,\n/g, '');
  code = code.replace(/const renderFootnotes = \(\) => \{[\s\S]*?return \([\s\S]*?\);\n\s*\};\n/g, '');
  code = code.replace(/\{\!isPreviewMode && renderFootnotes\(\)\}/g, '');
  code = code.replace(/&& !target\.closest\('\.kgv-footnotes-section'\)/g, '');
  fs.writeFileSync('src/Editor.tsx', code);
}

function removeFootnotesToolbar() {
  let code = fs.readFileSync('src/Toolbar.tsx', 'utf8');
  code = code.replace(/footnotesCount: number;\n/g, '');
  code = code.replace(/onInsertFootnote: \(\) => void;\n/g, '');
  code = code.replace(/onOpenFootnotesPanel: \(\) => void;\n/g, '');
  code = code.replace(/footnotesCount,\n/g, '');
  code = code.replace(/onInsertFootnote,\n/g, '');
  code = code.replace(/onOpenFootnotesPanel,\n/g, '');
  code = code.replace(/<ToolBtn onClick=\{onInsertFootnote\} icon=\{<Footprints size=\{15\} \/>\} label=\{t.footnote\} \/>\n/g, '');
  code = code.replace(/\{footnotesCount > 0 && \(\n\s*<ToolBtn onClick=\{onOpenFootnotesPanel\} icon=\{<Check size=\{15\} \/>\} label=\{t.footnotes\} \/>\n\s*\)\}\n/g, '');
  fs.writeFileSync('src/Toolbar.tsx', code);
}

function removeFootnotesRightPanel() {
  let code = fs.readFileSync('src/RightPanel.tsx', 'utf8');
  code = code.replace(/footnotes: Footnote\[\];\n/g, '');
  code = code.replace(/onUpdateFootnote: \(id: string, content: string\) => void;\n/g, '');
  code = code.replace(/onDeleteFootnote: \(id: string\) => void;\n/g, '');
  code = code.replace(/onAddFootnote: \(\) => void;\n/g, '');
  code = code.replace(/footnotes,\n/g, '');
  code = code.replace(/onUpdateFootnote,\n/g, '');
  code = code.replace(/onDeleteFootnote,\n/g, '');
  code = code.replace(/onAddFootnote,\n/g, '');
  // the footnotes section in RightPanel is likely complex to regex out safely, so we might just use sed for the rest, but let's see.
  fs.writeFileSync('src/RightPanel.tsx', code);
}

removeFootnotesApp();
removeFootnotesEditor();
removeFootnotesToolbar();
removeFootnotesRightPanel();

