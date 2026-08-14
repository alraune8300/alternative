const fs = require('fs');
let code = fs.readFileSync('src/LeftPanel.tsx', 'utf8');

const regex = /function timeSince\(date: Date, lang: Lang\): string \{[\s\S]*?return `\$\{Math\.floor\(minutes \/ 60\)\}h ago`\n\}/;

const replacement = `function timeSince(date: Date, lang: Lang): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 10) return i18nT(lang, 'justNow') || 'just now'
  
  try {
    const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto', style: 'short' });
    if (seconds < 60) return rtf.format(-seconds, 'second');
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return rtf.format(-minutes, 'minute');
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return rtf.format(-hours, 'hour');
    const days = Math.floor(hours / 24);
    return rtf.format(-days, 'day');
  } catch(e) {
    if (seconds < 60) return \`\${seconds}s ago\`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return \`\${minutes}m ago\`;
    return \`\${Math.floor(minutes / 60)}h ago\`;
  }
}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/LeftPanel.tsx', code);
