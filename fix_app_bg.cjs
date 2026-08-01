const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
  // Sync document body styles with the current active theme
  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
    document.documentElement.style.setProperty('--bg-color', theme.bg);
  }, [theme.bg, theme.text]);
`;

code = code.replace(/[\s]*\/\/ Sync document body styles with the current active theme[\s]*useEffect\(\(\) => \{[\s]*document\.body\.style\.background = theme\.bg;[\s]*document\.body\.style\.color = theme\.text;[\s]*\}, \[theme\.bg, theme\.text\]\);/, replacement);

fs.writeFileSync('src/App.tsx', code);
