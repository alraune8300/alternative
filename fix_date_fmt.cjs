const fs = require('fs');
let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

// Replace format(new Date(...), 'MMM d, yyyy') with Intl.DateTimeFormat
code = code.replace(/format\(new Date\(folder\.created_at\), 'MMM d, yyyy'\)/g, "Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(folder.created_at))");
code = code.replace(/format\(new Date\(project\.lastModified \|\| project\.createdAt \|\| Date\.now\(\)\), 'MMM d, yyyy'\)/g, "Intl.DateTimeFormat(lang, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(project.lastModified || project.createdAt || Date.now()))");

// Replace 'Recently' with t(lang, 'recently') || 'Recently'
code = code.replace(/: 'Recently'/g, ": t(lang, 'recently') || 'Recently'");

fs.writeFileSync('src/WelcomeScreen.tsx', code);
