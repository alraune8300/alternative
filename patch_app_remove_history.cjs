const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/onToggleHistory=\{[\s\S]*?\}\s*onOpenGithub/, "onOpenGithub");

fs.writeFileSync('src/App.tsx', code);
