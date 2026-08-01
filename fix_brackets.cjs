const fs = require('fs');

let lines = fs.readFileSync('src/LeftPanel.tsx', 'utf8').split('\n');

// At line 330:
// 327               </div>
// 328             </div>
// 329           )}
// 330
// 331
// 332         {/* Children */}
// We need to add </div> here.
lines.splice(330, 0, '        </div>');

fs.writeFileSync('src/LeftPanel.tsx', lines.join('\n'));
