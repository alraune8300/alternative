const fs = require('fs');
let code = fs.readFileSync('src/theme.ts', 'utf8');

// We can just use a regex to replace bg, bgAlt, surface for blocks where isDark is true.
// Actually, it's easier to find all objects in the PRESETS array.
const blocks = code.split(/,\s*\{\s*name:/);
for (let i = 0; i < blocks.length; i++) {
  if (blocks[i].includes('isDark: true')) {
    blocks[i] = blocks[i].replace(/bg:\s*'#[0-9a-fA-F]+'/, "bg: '#000000'");
    
    // We can extract accent to generate bgAlt and surface
    const accentMatch = blocks[i].match(/accent:\s*'([^']+)'/);
    if (accentMatch) {
      // Very simple: just make surface very dark, e.g. #050505
      // Or we can just restore original bgAlt and surface by looking up the old ones?
      // Since I don't have the old ones exactly, I'll just use a generic very dark color based on the previous state.
      // E.g. #050505 for surface, #0a0a0a for bgAlt
      blocks[i] = blocks[i].replace(/surface:\s*'#[0-9a-fA-F]+'/, "surface: '#050505'");
      blocks[i] = blocks[i].replace(/bgAlt:\s*'#[0-9a-fA-F]+'/, "bgAlt: '#0a0a0a'");
    }
  }
}
fs.writeFileSync('src/theme.ts', blocks.join(',\n  {\n    name:'));
