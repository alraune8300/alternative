const fs = require('fs');

let code = fs.readFileSync('src/LeftPanel.tsx', 'utf8');

const replacement = `
  const folders: Folder[] = activeProject ? activeProject.folders : (Array.isArray(props.folders) ? (props.folders as Folder[]) : [])
  const activeFolders = folders.filter(f => !f.isDeleted)
`;

code = code.replace("  const folders: Folder[] = activeProject ? activeProject.folders : (Array.isArray(props.folders) ? (props.folders as Folder[]) : [])", replacement);

fs.writeFileSync('src/LeftPanel.tsx', code);
