const fs = require('fs');
let code = fs.readFileSync('src/VersionHistoryPanel.tsx', 'utf8');

// Add state for confirm deletion
if (!code.includes('const [confirmDeleteId, setConfirmDeleteId]')) {
  code = code.replace(
    "const [isCreating, setIsCreating] = useState(false);",
    "const [isCreating, setIsCreating] = useState(false);\n  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);"
  );
}

// Update handleDelete
code = code.replace(
  /const handleDelete = async \(\id: string, e: React\.MouseEvent\) => \{[\s\S]*?\};\s*const selectedVersion/,
  `const executeDelete = async (id: string) => {
    await deletePageVersionFromDB(id);
    if (selectedVersionId === id) setSelectedVersionId(null);
    setConfirmDeleteId(null);
    await loadVersions();
  };

  const selectedVersion`
);

// Update JSX inside the map loop
const targetJSX = /<button onClick=\{\(e\) => handleDelete\(v\.id, e\)\} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-500\/10">\s*<Trash2 size=\{14\} \/>\s*<\/button>/;

const newJSX = `{confirmDeleteId === v.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); executeDelete(v.id); }} className="px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600 transition-colors">
                          {t(lang, 'delete') || 'Delete'}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }} className="px-2 py-1 text-xs rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors" style={{ color: theme.text }}>
                          {t(lang, 'cancel') || 'Cancel'}
                        </button>
                      </div>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(v.id); }} className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-500/10">
                        <Trash2 size={14} />
                      </button>
                    )}`;

code = code.replace(targetJSX, newJSX);

fs.writeFileSync('src/VersionHistoryPanel.tsx', code);
