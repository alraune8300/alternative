const fs = require('fs');

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  return {
    r: parseInt(hex.substring(0,2), 16),
    g: parseInt(hex.substring(2,4), 16),
    b: parseInt(hex.substring(4,6), 16)
  };
}

function rgbToHex(r, g, b) {
  return '#' + [r,g,b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0'+hex : hex;
  }).join('');
}

function mixBlack(hex, percent) {
  const c = hexToRgb(hex);
  return rgbToHex(c.r * percent, c.g * percent, c.b * percent);
}

let code = fs.readFileSync('src/theme.ts', 'utf8');

// Find all objects in PRESETS
const presetMatch = code.match(/export const PRESETS: PresetColors\[\] = \[([\s\S]*?)\]\n\nexport function buildPresetTheme/);
if (presetMatch) {
  let presetsCode = presetMatch[1];
  
  const blocks = presetsCode.split(/,\s*\{\s*name:/);
  
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].includes('isDark: true')) {
      const accentMatch = blocks[i].match(/accent:\s*'([^']+)'/);
      if (accentMatch) {
        const accent = accentMatch[1];
        
        blocks[i] = blocks[i].replace(/bg:\s*'[^']+'/, `bg: '#000000'`);
        blocks[i] = blocks[i].replace(/bgAlt:\s*'[^']+'/, `bg: '${mixBlack(accent, 0.08)}'`);
        blocks[i] = blocks[i].replace(/surface:\s*'[^']+'/, `surface: '${mixBlack(accent, 0.04)}'`);
        blocks[i] = blocks[i].replace(/borderFaint:\s*'[^']+'/, `borderFaint: '${mixBlack(accent, 0.1)}'`);
        blocks[i] = blocks[i].replace(/border:\s*'[^']+'/, `border: '${mixBlack(accent, 0.18)}'`);
      }
    }
  }
  
  const newPresetsCode = blocks.join(',\n  {\n    name:');
  code = code.replace(presetMatch[1], newPresetsCode);
  
  // also let's replace buildHueTheme dark bg:
  // From: bg: `linear-gradient(150deg, #000000 0%, hsl(${(hue + 20) % 360}, 28%, 2%) 100%)`,
  // It's already #000000. So we are good.
  
  fs.writeFileSync('src/theme.ts', code);
  console.log('Fixed themes');
} else {
  console.log('Regex failed');
}

