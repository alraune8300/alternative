const fs = require('fs');
let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

// The messed up part is at the end:
//                 </button>
//               </div>
//             </div>
//             )}
//           </div>
//         </div>
//         {/* Breadcrumbs */}

code = code.replace(/              <\/div>\n            <\/div>\n            \)\}\n          <\/div>\n        <\/div>\n        \{\/\* Breadcrumbs \*\/\}/,
`              </div>
            </div>
          </div>
        </div>
        {/* Breadcrumbs */}`);

fs.writeFileSync('src/WelcomeScreen.tsx', code);
