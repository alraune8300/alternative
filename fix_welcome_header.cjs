const fs = require('fs');
let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

// Replace:
//           {/* Header Right Actions */}
//           {tab === 'active' && (
//             <div className="flex items-center gap-2 pb-1">

const original = `{/* Header Right Actions */}
          {tab === 'active' && (
            <div className="flex items-center gap-2 pb-1">`;

const replacement = `{/* Header Right Actions */}
          <div className="flex flex-wrap items-center gap-2 pb-1">
            {onChangeLang && (
              <div className="flex items-center">
                <CustomSelect
                  value={lang}
                  onChange={(val) => onChangeLang(val)}
                  theme={theme}
                  buttonClassName="bg-transparent text-xs outline-none font-medium flex items-center gap-1 border rounded-full px-3 py-1.5 transition-all cursor-pointer"
                  options={LANGUAGES}
                />
              </div>
            )}
            {tab === 'active' && (
              <div className="flex items-center gap-2">`;

code = code.replace(original, replacement);

// Then we need to replace the closing `</div>\n          )}` before `</div>\n        {/* Breadcrumbs */}`
// This could be tricky, let's just use regex.

const endingRegex = /<\/div>\s*\)\}\s*<\/div>\s*\{\/\*\s*Breadcrumbs\s*\*\/\}/;
code = code.replace(endingRegex, "</div>\n            )}\n          </div>\n        </div>\n        {/* Breadcrumbs */}");

fs.writeFileSync('src/WelcomeScreen.tsx', code);
