const fs = require('fs');

let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

// I need to swap:
//   const activeFolders = folders.filter(f => !f.isDeleted);
//   const [folders, setFolders] = useState<Folder[]>([]);
// with:
//   const [folders, setFolders] = useState<Folder[]>([]);
//   const activeFolders = folders.filter(f => !f.isDeleted);

code = code.replace("  const activeFolders = folders.filter(f => !f.isDeleted);\n  const [folders, setFolders] = useState<Folder[]>([]);", "  const [folders, setFolders] = useState<Folder[]>([]);\n  const activeFolders = folders.filter(f => !f.isDeleted);");

fs.writeFileSync('src/WelcomeScreen.tsx', code);
