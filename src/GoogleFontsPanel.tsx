import React, { useState } from 'react';
import type { ThemeColors } from './types';
import type { Theme } from './theme';
import { t, Lang } from './i18n';

const FONT_CATEGORIES = [
  {
    category: 'SANS-SERIF',
    fonts: [
      'Inter', 'Roboto', 'Montserrat', 'Helvetica', 'Open Sans', 'Lato',
      'Abel', 'Acme', 'Alata', 'Alegreya Sans', 'Arimo', 'Assistant', 'Barlow',
      'Cabin', 'Catamaran', 'Chivo', 'Comfortaa', 'DM Sans', 'Dosis', 'Encode Sans',
      'Exo 2', 'Fira Sans', 'Fjalla One', 'Heebo', 'Hind', 'IBM Plex Sans',
      'Josefin Sans', 'Kanit', 'Karla', 'Libre Franklin', 'Manrope', 'Mukta',
      'Mulish', 'Noto Sans', 'Nunito', 'Nunito Sans', 'Oswald', 'Outfit',
      'Oxanium', 'Poppins', 'PT Sans', 'Questrial', 'Quicksand', 'Raleway',
      'Rubik', 'Source Sans 3', 'Titillium Web', 'Ubuntu', 'Varela Round',
      'Work Sans', 'Yantramanav', 'Zilla Slab'
    ]
  },
  {
    category: 'SERIF',
    fonts: [
      'Lora', 'EB Garamond', 'Playfair Display', 'Merriweather', 'Georgia',
      'Abril Fatface', 'Alegreya', 'Alice', 'Amiri', 'Arvo', 'Bitter',
      'Bodoni Moda', 'Cinzel', 'Cormorant', 'Cormorant Garamond', 'Crete Round',
      'Domine', 'Faustina', 'Fenix', 'Frank Ruhl Libre', 'Fraunces', 'GFS Didot',
      'Gelasio', 'Gentium Book Plus', 'Gilda Display', 'Gravitas One', 'Headland One',
      'Imbue', 'Josefin Slab', 'Judson', 'Kameron', 'Libre Baskerville', 'Lustria',
      'Martel', 'Neuton', 'Noticia Text', 'Noto Serif', 'Old Standard TT',
      'Podkova', 'Poly', 'PT Serif', 'Quattrocento', 'Roboto Slab', 'Rokkitt',
      'Rufina', 'Slabo 27px', 'Source Serif 4', 'Spectral', 'Tinos', 'Ultra', 'Unna'
    ]
  },
  {
    category: 'MONOSPACE',
    fonts: [
      'JetBrains Mono', 'Fira Code', 'Source Code Pro',
      'Anonymous Pro', 'Azeret Mono', 'B612 Mono', 'Courier Prime', 'DM Mono',
      'Fira Mono', 'Fragment Mono', 'IBM Plex Mono', 'Inconsolata', 'Jura',
      'Nanum Gothic Coding', 'Noto Sans Mono', 'Overpass Mono', 'PT Mono',
      'Roboto Mono', 'Share Tech Mono', 'Space Mono', 'Ubuntu Mono', 'Xanh Mono'
    ]
  }
];

const loadedFonts = new Set<string>();

function loadGoogleFont(name: string) {
  if (loadedFonts.has(name)) return;
  loadedFonts.add(name);
  const fontSlug = name.toLowerCase().replace(/\s+/g, '-');
  const id = `gf-${fontSlug}`;
  if (document.getElementById(id)) return;

  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    @font-face {
      font-family: '${name}';
      src: url('/fonts/${fontSlug}.woff2') format('woff2'),
           url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:ital,wght@0,400;0,700;1,400&display=swap');
      font-display: swap;
    }
  `;
  document.head.appendChild(style);

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:ital,wght@0,400;0,700;1,400&display=swap`;
  document.head.appendChild(link);
}

interface TiptapEditorType {
  chain: () => {
    focus: () => {
      setFontFamily: (family: string) => { run: () => void };
    };
  };
}

interface GoogleFontsPanelProps {
  onSelect?: (fontName: string) => void;
  c?: Theme | Record<string, unknown>;
  theme?: ThemeColors | Record<string, unknown>;
  uiFont?: string;
  lang?: Lang;
  t?: unknown;
  apiKey?: string;
  onClose?: () => void;
  onApplyToSelection?: (family: string) => void;
  onApplyToUi?: (family: string) => void;
  onApplyToDoc?: (family: string) => void;
  editor?: TiptapEditorType | null;
  onAssignRole?: (role: 'body' | 'heading' | 'ui' | 'mono', fontName: string) => void;
  bodyFont?: string;
  headingFont?: string;
  uiFontRole?: string;
  monoFont?: string;
}

export default function GoogleFontsPanel(props: GoogleFontsPanelProps) {
  const {
    onSelect,
    uiFont = 'Inter',
    lang = 'en',
    onClose,
    onApplyToSelection,
    onApplyToUi,
    onApplyToDoc,
    editor,
    onAssignRole,
    bodyFont = 'Merriweather',
    headingFont = 'Playfair Display',
    uiFontRole = 'Inter',
    monoFont = 'JetBrains Mono',
  } = props;

  const rawTheme = (props.c || props.theme) as Record<string, unknown> | undefined;
  const c = {
    bg: (rawTheme?.bg || '#ffffff') as string,
    text: (rawTheme?.text || '#111827') as string,
    accent: (rawTheme?.accent || '#2563eb') as string,
    accentLight: (rawTheme?.accentLight || rawTheme?.accentSoft || '#dbeafe') as string,
    accentMid: (rawTheme?.accentMid || rawTheme?.accent || '#60a5fa') as string,
    border: (rawTheme?.border || '#e5e7eb') as string,
    borderFaint: (rawTheme?.borderFaint || '#f3f4f6') as string,
    isDark: Boolean(rawTheme?.isDark ?? false),
    surface: (rawTheme?.surface || '#ffffff') as string,
    textMuted: (rawTheme?.textMuted || rawTheme?.muted || '#4b5563') as string,
    textFaint: (rawTheme?.textFaint || rawTheme?.faint || '#9ca3af') as string,
  };

  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState('The quick brown fox jumps over the lazy dog');
  const [loaded, setLoaded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'catalog' | 'roles'>('catalog');

  const handleLoad = (name: string) => {
    loadGoogleFont(name);
    setLoaded((prev) => new Set([...prev, name]));
  };

  const handleApplyToSelection = (name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    handleLoad(name);
    setSelected(name);
    if (editor && typeof editor.chain === 'function') {
      editor.chain().focus().setFontFamily(name).run();
    } else if (onApplyToSelection) {
      onApplyToSelection(name);
    } else {
      window.dispatchEvent(new CustomEvent('kgv-apply-font-selection', { detail: name }));
    }
  };

  const handleAssignRole = (role: 'body' | 'heading' | 'ui' | 'mono', name: string) => {
    handleLoad(name);
    if (onAssignRole) {
      onAssignRole(role, name);
    }
    document.documentElement.style.setProperty(`--kgv-${role}-font`, name);
    if (role === 'ui' && onApplyToUi) onApplyToUi(name);
    if (role === 'body' && onApplyToDoc) onApplyToDoc(name);
    if (onSelect) onSelect(name);
  };

  const filteredCategories = FONT_CATEGORIES.map(cat => ({
    category: cat.category,
    fonts: cat.fonts.filter(f => f.toLowerCase().includes(search.toLowerCase()))
  })).filter(cat => cat.fonts.length > 0);

  const panelContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Top Navigation Tabs */}
      <div style={{ display: 'flex', gap: 6, padding: 3, background: c.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: 8 }}>
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          style={{
            flex: 1, padding: '6px 8px', borderRadius: 6, border: 'none',
            background: activeTab === 'catalog' ? c.accent : 'transparent',
            color: activeTab === 'catalog' ? '#ffffff' : c.textMuted,
            fontFamily: uiFont, fontSize: '0.75rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {t(lang, 'fontCatalog')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          style={{
            flex: 1, padding: '6px 8px', borderRadius: 6, border: 'none',
            background: activeTab === 'roles' ? c.accent : 'transparent',
            color: activeTab === 'roles' ? '#ffffff' : c.textMuted,
            fontFamily: uiFont, fontSize: '0.75rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {t(lang, 'fontRolesAndVars')}
        </button>
      </div>

      {activeTab === 'roles' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 0' }}>
          <div style={{ fontSize: '0.78rem', color: c.textMuted, marginBottom: 4 }}>
            {t(lang, 'fontRolesDesc')}
          </div>
          
          {[
            { role: 'body' as const, label: t(lang, 'bodyFontRole'), current: bodyFont },
            { role: 'heading' as const, label: t(lang, 'headingFontRole'), current: headingFont },
            { role: 'ui' as const, label: t(lang, 'uiFontRole'), current: uiFontRole },
            { role: 'mono' as const, label: t(lang, 'monoFontRole'), current: monoFont },
          ].map(({ role, label, current }) => (
            <div key={role} style={{ background: c.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', padding: 10, borderRadius: 8, border: `1px solid ${c.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: c.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                <span style={{ fontSize: '0.75rem', fontFamily: `'${current}', serif`, color: c.accent }}>{current}</span>
              </div>
              <select
                value={current}
                onChange={(e) => handleAssignRole(role, e.target.value)}
                style={{
                  width: '100%', padding: '6px 8px', borderRadius: 6,
                  border: `1px solid ${c.border}`, background: c.surface,
                  color: c.text, fontFamily: uiFont, fontSize: '0.8rem', cursor: 'pointer', outline: 'none'
                }}
              >
                {FONT_CATEGORIES.map(cat => (
                  <optgroup key={cat.category} label={`[${cat.category}]`}>
                    {cat.fonts.map(fontName => (
                      <option key={fontName} value={fontName}>{fontName}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : (
        <>
          <input
            type="text"
            placeholder={t(lang, 'searchFontsPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '6px 10px',
              fontFamily: uiFont, fontSize: '0.78rem',
              border: `1px solid ${c.border}`,
              borderRadius: 6, background: 'transparent',
              color: c.text, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <input
            type="text"
            placeholder={t(lang, 'previewTextPlaceholder')}
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            style={{
              width: '100%', padding: '5px 10px',
              fontFamily: uiFont, fontSize: '0.75rem',
              border: `1px solid ${c.borderFaint}`,
              borderRadius: 6, background: 'transparent',
              color: c.textMuted, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div style={{
            maxHeight: 340, overflowY: 'auto',
            border: `1px solid ${c.borderFaint}`,
            borderRadius: 8, padding: 4,
          }}>
            {filteredCategories.map(cat => (
              <div key={cat.category} style={{ marginBottom: 12 }}>
                <div style={{
                  fontFamily: uiFont, fontSize: '0.68rem', fontWeight: 700,
                  color: c.accent, padding: '6px 8px', letterSpacing: '0.08em',
                  background: c.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  borderRadius: 4, marginBottom: 4
                }}>
                  [{cat.category}]
                </div>
                {cat.fonts.map(name => {
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
                        borderBottom: `1px solid ${c.borderFaint}`,
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
                      <div style={{ flex: 1, overflow: 'hidden', paddingRight: 8 }}>
                        <div style={{
                          fontFamily: isLoaded ? `'${name}', serif` : uiFont,
                          fontSize: '0.9rem',
                          color: isSelected ? c.accent : c.text,
                          lineHeight: 1.4,
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                        }}>
                          {preview || name}
                        </div>
                        <div style={{
                          fontFamily: uiFont, fontSize: '0.65rem',
                          color: isSelected ? c.accentMid : c.textFaint,
                          marginTop: 1,
                        }}>
                          {name}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button
                          type="button"
                          onClick={(e) => handleApplyToSelection(name, e)}
                          title="Apply font to selected text boundary"
                          style={{
                            padding: '3px 8px', borderRadius: 5,
                            border: `1px solid ${c.border}`,
                            background: 'transparent',
                            color: c.accent, fontFamily: uiFont,
                            fontSize: '0.68rem', fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = c.accent; e.currentTarget.style.color = '#ffffff'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.accent; }}
                        >
                          ✦ {t(lang, 'selectFont')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {filteredCategories.length === 0 && (
              <div style={{ padding: '16px 10px', fontFamily: uiFont, fontSize: '0.78rem', color: c.textFaint, textAlign: 'center' }}>
                No fonts found matching "{search}"
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  if (onClose) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg rounded-xl shadow-2xl p-5 flex flex-col max-h-[85vh] overflow-hidden"
          style={{ background: c.surface, border: `1px solid ${c.border}`, color: c.text, fontFamily: uiFont }}
        >
          <div className="flex items-center justify-between pb-3 mb-3" style={{ borderBottom: `1px solid ${c.borderFaint}` }}>
            <h3 className="font-semibold text-sm uppercase tracking-wider">{t(lang, 'googleFontsEngine')}</h3>
            <button
              onClick={onClose}
              className="px-2 py-1 rounded-md text-sm hover:opacity-75 transition-opacity"
              style={{ color: c.textFaint, background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {panelContent}
          </div>
        </div>
      </div>
    );
  }

  return panelContent;
}
