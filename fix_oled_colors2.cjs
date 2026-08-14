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

// The file now has duplicate `bg:` in the dark themes because of the previous script.
// `bg: '#000000',\n    bg: '#100e14',`

const lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("bg: '#000000'")) {
    if (lines[i+1].includes("bg: '#")) {
      lines[i+1] = lines[i+1].replace("bg:", "bgAlt:");
    }
  }
}
fs.writeFileSync('src/theme.ts', lines.join('\n'));
console.log("Fixed duplicates");
