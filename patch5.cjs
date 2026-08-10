const fs = require('fs');
let content = fs.readFileSync('src/WelcomeScreen.tsx', 'utf-8');

// Undo bad replacement
content = content.replace(
  `style={{ borderColor: dragOverFolderId === folder.id ? theme.accent : theme.borderFaint, backgroundColor: theme.surface }}`,
  `style={{ borderColor: theme.borderFaint, backgroundColor: theme.surface }}`
);

// Do correct replacement for List Folder
const listFolderBorderTarget = `                  style={{ 
                    backgroundColor: 'transparent',
                    borderColor: theme.borderFaint
                  }}`;
const listFolderBorderReplacement = `                  style={{ 
                    backgroundColor: 'transparent',
                    borderColor: dragOverFolderId === folder.id ? theme.accent : theme.borderFaint
                  }}`;
content = content.replace(listFolderBorderTarget, listFolderBorderReplacement);

fs.writeFileSync('src/WelcomeScreen.tsx', content);
