const fs = require('fs');

let content = fs.readFileSync('src/GoogleFontsPanel.tsx', 'utf-8');

// Add imports
content = content.replace(
  "import React, { useState } from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';\nimport { fetchGoogleFonts, GoogleFontItem } from './googleFontsApi';"
);

// Create FontItem component
const fontItemComponent = `
function FontItem({ name, isSelected, handleApplyToSelection, handleLoad, toggleFav, isFav, c, preview }: any) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        handleLoad(name);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [name]);

  return (
    <div
      ref={ref}
      onClick={() => handleApplyToSelection(name)}
      onMouseEnter={() => handleLoad(name)}
      style={{
        padding: '8px 10px',
        cursor: 'pointer',
        background: isSelected ? c.accentLight : 'transparent',
        borderRadius: 6,
        borderBottom: \`1px solid \${c.borderFaint}\`,
        transition: 'background 0.1s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      onMouseOver={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = c.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
      }}
      onMouseOut={(e) => {
        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
      }}
    >
      <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: c.text }}>{name}</span>
          {isSelected && <span style={{ fontSize: '0.65rem', background: c.accent, color: '#fff', padding: '1px 4px', borderRadius: 4 }}>Applied</span>}
        </div>
        <div style={{
          fontFamily: isVisible ? \`'\${name}', sans-serif\` : 'sans-serif',
          fontSize: '1.2rem',
          color: c.text,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {preview || name}
        </div>
      </div>
      <button
        onClick={(e) => toggleFav(name, e)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 4, color: isFav ? '#f59e0b' : c.textFaint,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        title={isFav ? "Remove from favorites" : "Add to favorites"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </button>
    </div>
  );
}
`;

content = content.replace(
  "export default function GoogleFontsPanel(props",
  fontItemComponent + "\nexport default function GoogleFontsPanel(props"
);

// State for API fonts and key
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'catalog' | 'roles'>('catalog');",
  "const [activeTab, setActiveTab] = useState<'catalog' | 'roles'>('catalog');\n  const [apiFonts, setApiFonts] = useState<GoogleFontItem[]>([]);\n  const [isFetching, setIsFetching] = useState(false);\n  const [localApiKey, setLocalApiKey] = useState('');\n  \n  useEffect(() => {\n    if (props.apiKey) {\n      setIsFetching(true);\n      fetchGoogleFonts(props.apiKey).then(fonts => {\n        if (fonts && fonts.length > 0) setApiFonts(fonts);\n      }).finally(() => setIsFetching(false));\n    }\n  }, [props.apiKey]);\n  "
);

// Map apiFonts into categories if present
content = content.replace(
  "let displayCategories = FONT_CATEGORIES;",
  `let displayCategories = FONT_CATEGORIES;
  if (apiFonts.length > 0) {
    const cats: Record<string, string[]> = {};
    apiFonts.forEach(f => {
      const cName = (f.category || 'other').toUpperCase();
      if (!cats[cName]) cats[cName] = [];
      cats[cName].push(f.family);
    });
    displayCategories = Object.keys(cats).map(k => ({ category: k, fonts: cats[k] }));
  }`
);

// Replace font mapping in catalog tab
const oldMap = `{cat.fonts.map(name => {
                  const isLoaded = loaded.has(name);
                  const isSelected = selected === name;
                  return (
                    <div
                      key={name}
                      onClick={() => handleApplyToSelection(name)}
                      onMouseEnter={() => handleLoad(name)}
                      style={{
                        padding: '8px 10px',
                        cursor: 'pointer',
                        background: isSelected ? c.accentLight : 'transparent',
                        borderRadius: 6,
                        borderBottom: \`1px solid \${c.borderFaint}\`,
                        transition: 'background 0.1s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onMouseOver={(e) => {
                        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = c.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                      }}
                      onMouseOut={(e) => {
                        if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: c.text }}>{name}</span>
                          {isSelected && <span style={{ fontSize: '0.65rem', background: c.accent, color: '#fff', padding: '1px 4px', borderRadius: 4 }}>Applied</span>}
                        </div>
                        <div style={{
                          fontFamily: isLoaded ? \`'\${name}', sans-serif\` : uiFont,
                          fontSize: '1.2rem',
                          color: c.text,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {preview || name}
                        </div>
                      </div>
                      <button
                        onClick={(e) => toggleFav(name, e)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: 4, color: favorites.has(name) ? '#f59e0b' : c.textFaint,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        title={favorites.has(name) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill={favorites.has(name) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>
                  );
                })}`;
                
const newMap = `{cat.fonts.map(name => (
                  <FontItem
                    key={name}
                    name={name}
                    isSelected={selected === name}
                    handleApplyToSelection={handleApplyToSelection}
                    handleLoad={handleLoad}
                    toggleFav={toggleFav}
                    isFav={favorites.has(name)}
                    c={c}
                    preview={preview}
                  />
                ))}`;

content = content.replace(oldMap, newMap);

// Add API Key section in Catalog
const searchSection = `        <input
          type="text"
          placeholder={t(lang, 'searchFontsPlaceholder')}
          value={search}`;
          
const apiKeySection = `
        {!props.apiKey && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input
              type="password"
              placeholder="Enter Google Fonts API Key for full library"
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
                  window.location.reload(); // Refresh to apply
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
        )}
        <input
          type="text"
          placeholder={t(lang, 'searchFontsPlaceholder')}
          value={search}`;

content = content.replace(searchSection, apiKeySection);

fs.writeFileSync('src/GoogleFontsPanel.tsx', content);
console.log('Success');
