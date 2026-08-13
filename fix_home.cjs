const fs = require('fs');
let content = fs.readFileSync('src/LeftPanel.tsx', 'utf8');

content = content.replace(
  "style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}",
  "style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}"
);

fs.writeFileSync('src/LeftPanel.tsx', content);
