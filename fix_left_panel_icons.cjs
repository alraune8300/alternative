const fs = require('fs');

let content = fs.readFileSync('src/LeftPanel.tsx', 'utf8');

// 1. Import Home icon from lucide-react
content = content.replace(
  "import { Folder as FolderIcon, Edit2, FileText, Trash2, ChevronDown, RotateCcw, X, MoreHorizontal, Upload, Plus } from 'lucide-react'",
  "import { Home, Folder as FolderIcon, Edit2, FileText, Trash2, ChevronDown, RotateCcw, X, MoreHorizontal, Upload, Plus } from 'lucide-react'"
);

// 2. Replace the SVG with Home icon
const svgStart = content.indexOf('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">');
const svgEnd = content.indexOf('</svg>', svgStart) + 6;

if (svgStart > -1 && svgEnd > -1) {
  content = content.slice(0, svgStart) + '<Home size={18} />' + content.slice(svgEnd);
}

// 3. Make sure the container for both has exactly the same height and alignment behavior
content = content.replace(
  "style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}",
  "style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, height: 24 }}"
);

fs.writeFileSync('src/LeftPanel.tsx', content);
console.log("Fixed LeftPanel icons.");
