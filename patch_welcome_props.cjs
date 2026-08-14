const fs = require('fs');
let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

code = code.replace(/lang\?: Lang;/, "lang?: Lang;\n  onChangeLang?: (l: Lang) => void;");
code = code.replace(/refreshTrigger\?: number;\s*}\s*type SortOption/, "refreshTrigger?: number;\n}\n\nconst LANGUAGES: {value: Lang, label: string}[] = [\n  {value: 'en', label: 'English'},\n  {value: 'vi', label: 'Tiếng Việt'},\n  {value: 'fr', label: 'Français'},\n  {value: 'de', label: 'Deutsch'},\n  {value: 'it', label: 'Italiano'},\n  {value: 'es', label: 'Español'},\n  {value: 'ko', label: '한국어'},\n  {value: 'zh', label: '中文'},\n  {value: 'ja', label: '日本語'}\n];\n\ntype SortOption");

code = code.replace(/function WelcomeScreen\(\{ theme, themeMode, onSelectTheme, uiFont, lang = 'vi',/g, "function WelcomeScreen({ theme, themeMode, onSelectTheme, uiFont, lang = 'vi', onChangeLang,");

fs.writeFileSync('src/WelcomeScreen.tsx', code);
