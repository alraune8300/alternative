const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('const [refreshTrigger, setRefreshTrigger] = useState(0);')) {
  code = code.replace(
    "  const [githubModalOpen, setGithubModalOpen] = useState(false);",
    "  const [githubModalOpen, setGithubModalOpen] = useState(false);\n  const [refreshTrigger, setRefreshTrigger] = useState(0);"
  );

  code = code.replace(
    /handleSelectProject\(projs\[0\]\.id\);\n              \}\n            \}/g,
    "handleSelectProject(projs[0].id);\n              }\n            }\n            setRefreshTrigger(prev => prev + 1);"
  );

  code = code.replace(
    "          onEmptyAllTrash={emptyAllTrash}",
    "          onEmptyAllTrash={emptyAllTrash}\n          refreshTrigger={refreshTrigger}"
  );

  fs.writeFileSync('src/App.tsx', code);
}
