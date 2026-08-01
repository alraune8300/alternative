const fs = require('fs');
let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

code = code.replace(/const \[projects, setProjects\] = useState<Project\[\]>\(\[\]\);\n/g, '');
code = code.replace(/const \[newFolderDialog, setNewFolderDialog\] = useState<\{ isOpen: boolean; name: string \}>\(\{ isOpen: false, name: 'New Folder' \}\);\n/g, '');

fs.writeFileSync('src/WelcomeScreen.tsx', code);
