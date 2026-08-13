const fs = require('fs');
let code = fs.readFileSync('src/Toolbar.tsx', 'utf8');

// Add onToggleHistory in Props
if (!code.includes('onToggleHistory?: () => void;')) {
  code = code.replace(
    "onToggleSettings?: () => void;",
    "onToggleSettings?: () => void;\n  onToggleHistory?: () => void;"
  );
}

// Add onToggleHistory in destructured props
if (!code.includes('onToggleHistory,')) {
  code = code.replace(
    "rightOpen, onToggleSettings,",
    "rightOpen, onToggleSettings, onToggleHistory,"
  );
}

// Add History button in JSX
if (!code.includes('onClick={onToggleHistory}')) {
  const historyBtn = `            <ToolBtn
              onClick={onToggleHistory}
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
              label={t.versionHistory || 'History'}
            />
            <Divider />`;
  
  code = code.replace(
    "{onToggleSettings && (",
    historyBtn + "\n        {onToggleSettings && ("
  );
}

fs.writeFileSync('src/Toolbar.tsx', code);
