const fs = require('fs');
const content = fs.readFileSync('src/WelcomeScreen.tsx', 'utf-8');
const target = `          </div>
        </div>
      )}

      {/* Sidebar Navigation`;
const replacement = `          </div>
        </div>
      )}

      {/* Move Project Modal */}
      {movingProjectId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setMovingProjectId(null)}>
          <div className="p-5 rounded-2xl shadow-xl flex flex-col gap-4 animate-fade-in-up w-[320px] max-w-full" style={{ backgroundColor: theme.surface, border: \`1px solid \${theme.border}\` }} onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-sm" style={{ color: theme.text }}>{t(lang, 'moveToFolder') || 'Move to folder...'}</h3>
            <div className="flex flex-col gap-1 max-h-[250px] overflow-y-auto">
              <button
                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-colors text-sm"
                style={{ color: theme.text, backgroundColor: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.panel}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => handleMoveProject(null)}
              >
                <Home size={14} style={{ color: theme.textMuted }} />
                <span>{t(lang, 'home') || 'Home'}</span>
              </button>
              {activeFolders.map(folder => (
                <button
                  key={folder.id}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-colors text-sm truncate"
                  style={{ color: theme.text, backgroundColor: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.panel}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => handleMoveProject(folder.id)}
                >
                  <FolderOpen size={14} style={{ color: theme.textMuted }} />
                  <span className="truncate">{folder.name || 'Untitled Folder'}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center justify-end mt-1">
              <button 
                onClick={() => setMovingProjectId(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{ color: theme.textMuted }}
              >
                {t(lang, 'cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation`;
fs.writeFileSync('src/WelcomeScreen.tsx', content.replace(target, replacement));
