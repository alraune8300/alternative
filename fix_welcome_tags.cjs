const fs = require('fs');
let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

// The messed up lines are 760-766:
// 760               </div>
// 761             </div>
// 762           </div>
// 763         </div>
// 764             )}
// 765           </div>
// 766         </div>
// 767         {/* Breadcrumbs */}

code = code.replace(/              <\/div>\n            <\/div>\n          <\/div>\n        <\/div>\n            \)\}\n          <\/div>\n        <\/div>\n        \{\/\* Breadcrumbs \*\/\}/,
`              </div>
            </div>
            )}
          </div>
        </div>
        {/* Breadcrumbs */}`);

fs.writeFileSync('src/WelcomeScreen.tsx', code);
