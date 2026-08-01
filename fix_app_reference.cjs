const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

// Find the index of "const handleContentChange ="
const handleIdx = lines.findIndex(l => l.includes('const handleContentChange = useCallback'));

if (handleIdx !== -1) {
  // Remove lines
  const handleLines = lines.splice(handleIdx, 3);
  
  // Find where to insert it: after "const updateActivePage" ends
  // It ends with: "  }, [activeProjectId, activePageId, scheduleSaveProject]);"
  const updateIdx = lines.findIndex(l => l.includes('}, [activeProjectId, activePageId, scheduleSaveProject]);'));
  if (updateIdx !== -1) {
    lines.splice(updateIdx + 1, 0, '', ...handleLines);
  }
}

fs.writeFileSync('src/App.tsx', lines.join('\n'));
