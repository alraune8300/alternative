const fs = require('fs');
let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

const regex = /\{\/\* View Mode Toggle \*\/\}[\s\S]*?<List size=\{15\} strokeWidth=\{1\.5\} \/>\s*<\/button>\s*<\/div>\s*(<\/div>\s*)*\s*\)\}\s*(<\/div>\s*)*\s*\{\/\* Breadcrumbs \*\/\}/;

const replacement = `{/* View Mode Toggle */}
              <div className="flex items-center gap-1 rounded-xl p-1 border" style={{ backgroundColor: theme.surface, borderColor: theme.borderFaint }}>
                <button 
                  onClick={() => setViewMode('grid')} 
                  className="p-1.5 rounded-lg transition-all cursor-pointer"
                  title={t(lang, 'viewGrid')}
                  style={{ 
                    backgroundColor: viewMode === 'grid' ? theme.bg : 'transparent',
                    color: viewMode === 'grid' ? theme.text : theme.textFaint
                  }}
                >
                  <Grid size={15} strokeWidth={1.5} />
                </button>
                <button 
                  onClick={() => setViewMode('list')} 
                  className="p-1.5 rounded-lg transition-all cursor-pointer"
                  title={t(lang, 'viewList')}
                  style={{ 
                    backgroundColor: viewMode === 'list' ? theme.bg : 'transparent',
                    color: viewMode === 'list' ? theme.text : theme.textFaint
                  }}
                >
                  <List size={15} strokeWidth={1.5} />
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
        {/* Breadcrumbs */}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/WelcomeScreen.tsx', code);
