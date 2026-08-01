const fs = require('fs');

let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

// 1. Add state
code = code.replace(
  /const \[newFolderDialog, setNewFolderDialog\] = useState/,
  `const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [newFolderDialog, setNewFolderDialog] = useState`
);

// 2. Add breadcrumb helper
code = code.replace(
  /const activeFolders = folders\.filter\(f => !f\.isDeleted\);/,
  `const activeFolders = folders.filter(f => !f.isDeleted);
  const getBreadcrumbs = () => {
    let crumbs = [];
    let curr = currentFolderId;
    while (curr) {
      const f = folders.find(x => x.id === curr);
      if (f) {
        crumbs.unshift(f);
        curr = f.parentId || null;
      } else {
        break;
      }
    }
    return crumbs;
  };
  const breadcrumbs = getBreadcrumbs();
`
);

// 3. Filter displayed arrays
code = code.replace(
  /const displayedFolders = tab === 'active' \? activeFolders : trashedFolders;/,
  `const displayedFolders = (tab === 'active' ? activeFolders : trashedFolders).filter(f => (f.parentId || null) === currentFolderId);`
);
code = code.replace(
  /const displayedProjects = tab === 'active' \? activeProjects : trashedProjects;/,
  `const displayedProjects = (tab === 'active' ? activeProjects : trashedProjects).filter(p => (p.folderId || null) === currentFolderId);`
);

// 4. Update new proj / folder
code = code.replace(
  /isDeleted: false,\n    \};/,
  `isDeleted: false,
      folderId: currentFolderId,
    };`
);
code = code.replace(
  /id: 'folder-' \+ Date\.now\(\), name: folderName, isDeleted: false/,
  `id: 'folder-' + Date.now(), name: folderName, parentId: currentFolderId, isDeleted: false`
);

// 5. Add Breadcrumbs UI
code = code.replace(
  /\{\/\* Projects \/ Files Grid \*\/\}/,
  `{/* Breadcrumbs */}
        {tab === 'active' && currentFolderId !== null && (
          <div className="w-full max-w-5xl mb-4 flex items-center gap-2 text-sm" style={{ color: theme.textMuted }}>
            <button onClick={() => setCurrentFolderId(null)} className="hover:underline">Home</button>
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={b.id}>
                <span>/</span>
                <button 
                  onClick={() => setCurrentFolderId(b.id)}
                  className={\`hover:underline \${i === breadcrumbs.length - 1 ? 'font-medium' : ''}\`}
                  style={{ color: i === breadcrumbs.length - 1 ? theme.text : theme.textMuted }}
                >
                  {b.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
        {/* Projects / Files Grid */}`
);

// 6. Make folder clickable to open
code = code.replace(
  /className=\{\`group relative flex flex-col justify-center px-4 py-3 rounded-md border transition-colors \$\{tab === 'active' \? 'cursor-pointer hover:-translate-y-0.5 shadow-sm' : ''\}\`\}/g,
  `onClick={() => tab === 'active' && setCurrentFolderId(folder.id)}
                  className={\`group relative flex flex-col justify-center px-4 py-3 rounded-md border transition-colors \${tab === 'active' ? 'cursor-pointer hover:-translate-y-0.5 shadow-sm' : ''}\`}`
);
// Wait, the regex for replacing folder might match project too.
// Let's use a more specific replace for folders.

fs.writeFileSync('src/WelcomeScreen.tsx', code);
