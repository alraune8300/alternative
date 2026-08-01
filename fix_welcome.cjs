const fs = require('fs');

const missingCode = `
  const [projects, setProjects] = useState<Project[]>([]);
  const activeProjects = projects.filter(p => !p.isDeleted);
  const trashedProjects = projects.filter(p => p.isDeleted);
  const activeFolders = folders.filter(f => !f.isDeleted);
`;

let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

// replace "const [folders, setFolders] = useState<Folder[]>([]);"
// with missingCode + "  const [folders, setFolders] = useState<Folder[]>([]);"

code = code.replace("const [folders, setFolders] = useState<Folder[]>([]);", missingCode + "  const [folders, setFolders] = useState<Folder[]>([]);");

fs.writeFileSync('src/WelcomeScreen.tsx', code);
