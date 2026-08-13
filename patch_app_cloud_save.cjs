const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const flushSaveCode = `  const handleOpenGithubCloudSave = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const activeProj = projects.find(p => p.id === activeProjectId);
    if (activeProj) {
      const jsonStr = JSON.stringify(activeProj);
      if (jsonStr !== lastSavedProjRef.current) {
        setSaving(true);
        try {
          await saveProjectToDB(activeProj);
          lastSavedProjRef.current = jsonStr;
        } finally {
          setSaving(false);
        }
      }
    }
    setGithubModalOpen(true);
  }, [projects, activeProjectId]);

  const handleContentChange`;

code = code.replace('  const handleContentChange', flushSaveCode);
code = code.replace(/onOpenGithubCloudSave=\{\(\) => setGithubModalOpen\(true\)\}/g, 'onOpenGithubCloudSave={handleOpenGithubCloudSave}');

fs.writeFileSync('src/App.tsx', code);
