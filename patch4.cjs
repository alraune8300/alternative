const fs = require('fs');
let content = fs.readFileSync('src/WelcomeScreen.tsx', 'utf-8');

// 1. Add drag state
content = content.replace(
  `const [movingProjectId, setMovingProjectId] = useState<string | null>(null);`,
  `const [movingProjectId, setMovingProjectId] = useState<string | null>(null);
  const [dragProjectId, setDragProjectId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null | 'root'>(null);`
);

// 2. Update handleMoveProject
const moveTarget = `  const handleMoveProject = async (folderId: string | null) => {
    if (!movingProjectId) return;
    const project = activeProjects.find(p => p.id === movingProjectId) || trashedProjects.find(p => p.id === movingProjectId);
    if (!project) return;
    await saveProjectToDB({
      ...project,
      folderId,
      lastModified: new Date().toISOString()
    });
    setMovingProjectId(null);
    await loadData();
    if (onReloadProjects) onReloadProjects();
    setToastMsg(t(lang, 'projectMoved') || 'Project moved successfully');
  };`;

const moveReplacement = `  const handleMoveProject = async (folderId: string | null, targetProjId?: string) => {
    const pId = targetProjId || movingProjectId;
    if (!pId) return;
    const project = activeProjects.find(p => p.id === pId) || trashedProjects.find(p => p.id === pId);
    if (!project) return;
    
    const updatedProj = { ...project, lastModified: new Date().toISOString() };
    if (folderId) {
      updatedProj.folderId = folderId;
    } else {
      delete updatedProj.folderId;
    }

    await saveProjectToDB(updatedProj);
    setMovingProjectId(null);
    setDragProjectId(null);
    await loadData();
    if (onReloadProjects) onReloadProjects();
    setToastMsg(t(lang, 'projectMoved') || 'Project moved successfully');
  };`;
content = content.replace(moveTarget, moveReplacement);

// 3. Add drag events to Breadcrumb Home
const breadcrumbTarget = `<button onClick={() => setCurrentFolderId(null)} className="hover:underline">{t(lang, 'home')}</button>`;
const breadcrumbReplacement = `<button 
              onClick={() => setCurrentFolderId(null)} 
              className={\`hover:underline px-2 py-1 -ml-2 rounded transition-colors \${dragOverFolderId === 'root' ? 'bg-black/10 dark:bg-white/10' : ''}\`}
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverFolderId('root'); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverFolderId(null); }}
              onDrop={(e) => {
                e.preventDefault(); e.stopPropagation(); setDragOverFolderId(null);
                if (dragProjectId) handleMoveProject(null, dragProjectId);
              }}
            >
              {t(lang, 'home')}
            </button>`;
content = content.replace(breadcrumbTarget, breadcrumbReplacement);

// 4. Add drag events to Grid Folder
const gridFolderTarget = `className={\`group relative w-full h-[140px] pt-[16px] transition-all \${tab === 'active' ? 'cursor-pointer hover:-translate-y-1' : ''}\`}`;
const gridFolderReplacement = `className={\`group relative w-full h-[140px] pt-[16px] transition-all \${tab === 'active' ? 'cursor-pointer hover:-translate-y-1' : ''}\`}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverFolderId(folder.id); }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverFolderId(null); }}
                      onDrop={(e) => {
                        e.preventDefault(); e.stopPropagation(); setDragOverFolderId(null);
                        if (dragProjectId) handleMoveProject(folder.id, dragProjectId);
                      }}`;
content = content.replace(gridFolderTarget, gridFolderReplacement);

// 4.1 Update Grid Folder border to show drop target
const gridFolderBodyTarget = `className="folder-bg absolute top-[16px] left-0 right-0 bottom-0 rounded-b-2xl rounded-tr-2xl border transition-colors shadow-sm"
                        style={{ backgroundColor: theme.surface, borderColor: theme.borderFaint, borderTopLeftRadius: 0 }}`;
const gridFolderBodyReplacement = `className="folder-bg absolute top-[16px] left-0 right-0 bottom-0 rounded-b-2xl rounded-tr-2xl border transition-colors shadow-sm"
                        style={{ backgroundColor: theme.surface, borderColor: dragOverFolderId === folder.id ? theme.accent : theme.borderFaint, borderTopLeftRadius: 0, borderWidth: dragOverFolderId === folder.id ? 2 : 1 }}`;
content = content.replace(gridFolderBodyTarget, gridFolderBodyReplacement);

// 5. Add drag events to List Folder
const listFolderTarget = `className={\`group relative flex flex-col justify-center px-4 py-3 rounded-md border transition-colors \${tab === 'active' ? 'cursor-pointer hover:-translate-y-0.5 shadow-sm' : ''}\`}`;
const listFolderReplacement = `className={\`group relative flex flex-col justify-center px-4 py-3 rounded-md border transition-colors \${tab === 'active' ? 'cursor-pointer hover:-translate-y-0.5 shadow-sm' : ''}\`}
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverFolderId(folder.id); }}
                  onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOverFolderId(null); }}
                  onDrop={(e) => {
                    e.preventDefault(); e.stopPropagation(); setDragOverFolderId(null);
                    if (dragProjectId) handleMoveProject(folder.id, dragProjectId);
                  }}`;
content = content.replace(listFolderTarget, listFolderReplacement);

// 5.1 Update List Folder border
const listFolderBorderTarget = `borderColor: theme.borderFaint`;
const listFolderBorderReplacement = `borderColor: dragOverFolderId === folder.id ? theme.accent : theme.borderFaint`;
content = content.replace(listFolderBorderTarget, listFolderBorderReplacement);

// 6. Add drag events to Project
const projectTarget = `key={project.id}
                  onClick={() => tab === 'active' && onOpenProject(project.id)}
                  className={\`group relative flex flex-col justify-center px-4 py-3 rounded-md border transition-colors \${tab === 'active' ? 'cursor-pointer hover:-translate-y-0.5 shadow-sm' : ''}\`}`;
const projectReplacement = `key={project.id}
                  draggable={tab === 'active'}
                  onDragStart={(e) => { e.stopPropagation(); setDragProjectId(project.id); }}
                  onDragEnd={(e) => { e.stopPropagation(); setDragProjectId(null); setDragOverFolderId(null); }}
                  onClick={() => tab === 'active' && onOpenProject(project.id)}
                  className={\`group relative flex flex-col justify-center px-4 py-3 rounded-md border transition-colors \${tab === 'active' ? 'cursor-pointer hover:-translate-y-0.5 shadow-sm' : ''} \${dragProjectId === project.id ? 'opacity-50' : ''}\`}`;
content = content.replace(projectTarget, projectReplacement);

fs.writeFileSync('src/WelcomeScreen.tsx', content);
