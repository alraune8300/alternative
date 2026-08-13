const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');
if (!code.includes('export interface VersionSnapshot')) {
  code += `\nexport interface VersionSnapshot {
  id: string;
  pageId: string;
  timestamp: string;
  content: string;
  title?: string;
  label?: string;
}\n`;
  fs.writeFileSync('src/types.ts', code);
}
