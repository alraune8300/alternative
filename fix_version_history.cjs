const fs = require('fs');
let code = fs.readFileSync('src/VersionHistoryPanel.tsx', 'utf8');

code = code.replace(
  "borderLeft: \\`1px solid \\${theme.border}\\`",
  "borderLeft: \`1px solid \${theme.border}\`"
);

fs.writeFileSync('src/VersionHistoryPanel.tsx', code);
