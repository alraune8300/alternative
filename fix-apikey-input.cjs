const fs = require('fs');
let content = fs.readFileSync('src/GoogleFontsPanel.tsx', 'utf-8');

const target = `        <>
          <input
            type="text"
            placeholder={t(lang, 'searchFontsPlaceholder')}`;

const replacement = `        <>
          {!props.apiKey && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="password"
                  placeholder="Enter Google Fonts API Key for full library..."
                  value={localApiKey}
                  onChange={e => setLocalApiKey(e.target.value)}
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 6,
                    border: \`1px solid \${c.border}\`, background: c.surface,
                    color: c.text, fontFamily: uiFont, fontSize: '0.85rem', outline: 'none'
                  }}
                />
                <button
                  onClick={() => {
                    if (localApiKey) {
                      localStorage.setItem('kgv-gfonts-api-key', localApiKey);
                      window.location.reload();
                    }
                  }}
                  style={{
                    padding: '8px 12px', borderRadius: 6, border: 'none',
                    background: c.accent, color: '#fff', cursor: 'pointer',
                    fontFamily: uiFont, fontSize: '0.85rem', fontWeight: 600
                  }}
                >
                  Apply
                </button>
              </div>
              <div style={{ fontSize: '0.7rem', color: c.textFaint }}>
                Without an API key, you only see ~60 default fonts.
              </div>
            </div>
          )}
          {isFetching && (
            <div style={{ fontSize: '0.75rem', color: c.accent, marginBottom: 8, textAlign: 'center' }}>
              Fetching full font library...
            </div>
          )}
          <input
            type="text"
            placeholder={t(lang, 'searchFontsPlaceholder')}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/GoogleFontsPanel.tsx', content);
console.log('Success');
