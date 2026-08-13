const fs = require('fs');
let code = fs.readFileSync('src/Toolbar.tsx', 'utf8');

// Remove from Props
code = code.replace(/onToggleHistory\?:\s*\(\)\s*=>\s*void;\s*/, "");
code = code.replace(/onToggleHistory,?\s*/, "");

// Remove the JSX button
code = code.replace(/<ToolBtn\s+onClick=\{onToggleHistory\}[\s\S]*?label=\{t\.versionHistory \|\| 'History'\}\s+\/>\s+<Divider \/>/, "");

fs.writeFileSync('src/Toolbar.tsx', code);
