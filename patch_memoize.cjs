const fs = require('fs');

function memoize(file, funcName) {
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes(`export default React.memo(${funcName})`)) return;
  if (!code.includes("import React")) {
    // try to add it if needed, or assume React is imported or memo can be imported
  }
  
  code = code.replace(`export default function ${funcName}`, `function ${funcName}`);
  code += `\nexport default React.memo(${funcName});\n`;
  
  if (!code.includes("import React")) {
      code = "import React from 'react';\n" + code;
  }
  
  fs.writeFileSync(file, code);
}

memoize('src/Editor.tsx', 'Editor');
memoize('src/LeftPanel.tsx', 'LeftPanel');
memoize('src/RightPanel.tsx', 'RightPanel');
memoize('src/Toolbar.tsx', 'Toolbar');
memoize('src/WelcomeScreen.tsx', 'WelcomeScreen');

