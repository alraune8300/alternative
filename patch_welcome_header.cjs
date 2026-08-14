const fs = require('fs');
let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

const replacement = `          {/* Header Right Actions */}
          <div className="flex items-center gap-2 pb-1 flex-wrap">
            {onChangeLang && (
              <div className="flex items-center">
                <CustomSelect
                  value={lang}
                  onChange={(val) => onChangeLang(val as Lang)}
                  theme={theme}
                  buttonClassName="bg-transparent text-xs outline-none font-medium flex items-center gap-1 border rounded-full px-3 py-1.5 transition-all cursor-pointer"
                  options={LANGUAGES}
                />
              </div>
            )}
            {tab === 'active' && (
              <>
               {/* Data (Import/Export) Dropdown */}`;

code = code.replace(/\{\/\*\s*Header Right Actions\s*\*\/\}\s*\{tab === 'active' && \(\s*<div className="flex items-center gap-2 pb-1">\s*\{\/\*\s*Data \(Import\/Export\)/, replacement);

// Also need to close the `</>` for the `tab === 'active'` block.
// Wait, the original code had:
//           {tab === 'active' && (
//             <div className="flex items-center gap-2 pb-1">
//               {/* Data (Import/Export) Dropdown */}
//               ...
//               {/* New Button with Dropdown */}
//               ...
//             </div>
//           )}

// So instead of the above which changes the wrapper, it's easier to just inject the Language selector right before the "Data" dropdown.
