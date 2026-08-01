const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

const baseCSS = `
html, body, #root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: var(--bg-color, #fff); /* fallback */
}

body {
  transition: background-color 0.3s ease;
}
`;

// Replace the old html, body, #root block
css = css.replace(/html, body, #root \{[\s\S]*?body \{[\s\S]*?\}/, baseCSS.trim());

fs.writeFileSync('src/index.css', css);
