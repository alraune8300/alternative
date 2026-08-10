const fs = require('fs');
const content = fs.readFileSync('src/WelcomeScreen.tsx', 'utf-8');
const target = `                        <button onClick={(e) => handleStartEditProject(project.id, project.title, e)} className="p-1.5 rounded-md hover:bg-neutral-500/10 transition-colors cursor-pointer" style={{ color: theme.textMuted }} title={t(lang, 'rename')}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={(e) => handleSoftDeleteProject(project, e)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer" title={t(lang, 'moveToTrash')}>
                          <Trash2 size={13} />
                        </button>`;
const replacement = `                        <button onClick={(e) => { e.stopPropagation(); setMovingProjectId(project.id); }} className="p-1.5 rounded-md hover:bg-neutral-500/10 transition-colors cursor-pointer" style={{ color: theme.textMuted }} title={t(lang, 'moveToFolder') || 'Move to Folder'}>
                          <FolderInput size={13} />
                        </button>
                        <button onClick={(e) => handleStartEditProject(project.id, project.title, e)} className="p-1.5 rounded-md hover:bg-neutral-500/10 transition-colors cursor-pointer" style={{ color: theme.textMuted }} title={t(lang, 'rename')}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={(e) => handleSoftDeleteProject(project, e)} className="p-1.5 rounded-md text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer" title={t(lang, 'moveToTrash')}>
                          <Trash2 size={13} />
                        </button>`;
fs.writeFileSync('src/WelcomeScreen.tsx', content.replace(target, replacement));
