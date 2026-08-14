const fs = require('fs');
let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

const regex = /                <\/div>\n            <\/div>\n          \)\}\n        <\/div>\n\n        \{\/\* Quick Actions & Navigation Toolbar \*\/\}/;
const replacement = `                </div>
            </div>
          )}
        </div>
        </div>

        {/* Quick Actions & Navigation Toolbar */}`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/WelcomeScreen.tsx', code);
