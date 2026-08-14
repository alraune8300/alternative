const fs = require('fs');
let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

code = code.replace(/title: 'New Project'/g, "title: t(lang, 'newProject') || 'New Project'");
code = code.replace(/name: 'New Folder'/g, "name: t(lang, 'newFolder') || 'New Folder'");

fs.writeFileSync('src/WelcomeScreen.tsx', code);
