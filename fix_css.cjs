const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const baseCSS = `
html, body, #root {
  height: 100dvh;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

body {
  transition: background-color 0.3s ease;
}
`;

if (!css.includes('html, body, #root')) {
  css = baseCSS + css;
}

fs.writeFileSync('src/index.css', css);
