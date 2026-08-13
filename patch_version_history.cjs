const fs = require('fs');
let code = fs.readFileSync('src/VersionHistoryPanel.tsx', 'utf8');

// Remove isOpen and onClose from Props
code = code.replace(/isOpen: boolean;\n  onClose: \(\) => void;\n  /g, "");
code = code.replace(/isOpen,\n  onClose,\n  /g, "");

// Modify the effect
code = code.replace(/if \(isOpen && activePage\?\.id\) {/g, "if (activePage?.id) {");
code = code.replace(/}, \[isOpen, activePage\?\.id\]\);/g, "}, [activePage?.id]);");

// Replace the outer div
const outerDivStart = /<div\s+className={`fixed top-0 right-0 h-full w-\[350px\] sm:w-\[450px\] shadow-2xl z-50 transition-transform duration-300 ease-\[cubic-bezier\(0\.2,0\.8,0\.2,1\)\] flex flex-col \${isOpen \? 'translate-x-0' : 'translate-x-full'}`}\s+style={{ backgroundColor: theme\.panel, color: theme\.text, fontFamily: `'`\$\{uiFont\}', sans-serif`, borderLeft: `1px solid \$\{theme\.border\}` }}\s+>/;

code = code.replace(outerDivStart, `<div className="flex-1 flex flex-col h-full" style={{ fontFamily: \`'\${uiFont}', sans-serif\` }}>`);

// Remove the header div with Clock and Close button, we might keep it but simpler
const headerDiv = /<div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: theme\.borderFaint }}>[\s\S]*?<\/div>/;
// Wait, we don't necessarily need to remove the header, but RightPanel already has headers for sections?
// Actually RightPanel doesn't have a global header, each panel renders its own contents. But wait, `RightPanel` has a top bar that says "FORMAT", "SETTINGS", etc!
// Let's remove the header from VersionHistoryPanel since we'll rely on RightPanel's top bar!
code = code.replace(headerDiv, "");

fs.writeFileSync('src/VersionHistoryPanel.tsx', code);
