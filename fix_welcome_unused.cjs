const fs = require('fs');
let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

const regex2 = /const handleCreateFolderConfirm = async \(\) => \{[\s\S]*?setNewFolderDialog\(\{ isOpen: false, name: '' \}\);\n  \};\n/;
code = code.replace(regex2, '');

fs.writeFileSync('src/WelcomeScreen.tsx', code);
