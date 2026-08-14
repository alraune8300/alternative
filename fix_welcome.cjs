const fs = require('fs');
let code = fs.readFileSync('src/WelcomeScreen.tsx', 'utf8');

code = code.replace(/setTimeGreeting\('Good morning'\);/, "setTimeGreeting(t(lang, 'goodMorning') || 'Good morning');");
code = code.replace(/setTimeGreeting\('Good afternoon'\);/, "setTimeGreeting(t(lang, 'goodAfternoon') || 'Good afternoon');");
code = code.replace(/setTimeGreeting\('Good evening'\);/, "setTimeGreeting(t(lang, 'goodEvening') || 'Good evening');");

// The useEffect deps list is line 94 `  }, []);` right after the setTimeGreeting block.
code = code.replace(/set([A-Za-z]+)\(t\(lang,\s*'goodEvening'\)\s*\|\|\s*'Good evening'\);\n  }, \[\]\);/, "set$1(t(lang, 'goodEvening') || 'Good evening');\n  }, [lang]);");

fs.writeFileSync('src/WelcomeScreen.tsx', code);
