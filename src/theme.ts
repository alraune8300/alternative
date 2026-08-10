export interface Theme {
  bg: string
  heroGrad: string
  cardGrad: string
  text: string
  textMuted: string
  textFaint: string
  accent: string
  accentLight: string
  accentMid: string
  border: string
  borderFaint: string
  surface: string
  header: string
  panel: string
  status: string
  isDark: boolean
  muted: string
  faint: string
  accentSoft: string
}

export interface PresetColors {
  name: string
  emoji: string
  accent: string
  bg: string
  bgAlt: string
  text: string
  textMuted: string
  textFaint: string
  accentLight: string
  accentMid: string
  border: string
  borderFaint: string
  surface: string
  isDark: boolean
}

export const PRESETS: PresetColors[] = [
  {
    name: 'Sky',
    emoji: '☁',
    accent: '#3a78d0',
    bg: '#f0f5fc',
    bgAlt: '#e4edf8',
    text: '#1a2a3a',
    textMuted: '#5a7090',
    textFaint: '#8aaabf',
    accentLight: '#ddeafb',
    accentMid: '#7aaade',
    border: '#c8d8ee',
    borderFaint: '#ddeafb',
    surface: '#f8fbff',
    isDark: false,
  },
  {
    name: 'Ivory',
    emoji: '🕯',
    accent: '#b8693a',
    bg: '#faf7f0',
    bgAlt: '#f3ede0',
    text: '#2a1f12',
    textMuted: '#8a6a50',
    textFaint: '#b8a090',
    accentLight: '#f5e8d8',
    accentMid: '#d49070',
    border: '#e0d0bc',
    borderFaint: '#ede5d4',
    surface: '#fdfaf5',
    isDark: false,
  },
  {
    name: 'Sage',
    emoji: '🌿',
    accent: '#3d7a5c',
    bg: '#f0f5f0',
    bgAlt: '#e4ede6',
    text: '#1a2a1e',
    textMuted: '#507060',
    textFaint: '#88a890',
    accentLight: '#d8ece3',
    accentMid: '#72b090',
    border: '#c4d8c8',
    borderFaint: '#d8ece3',
    surface: '#f6fbf7',
    isDark: false,
  },
  {
    name: 'Dusk',
    emoji: '🌆',
    accent: '#7c5cc4',
    bg: '#f4f0fb',
    bgAlt: '#ece4f6',
    text: '#1e1530',
    textMuted: '#6a5088',
    textFaint: '#a088c0',
    accentLight: '#ede5fb',
    accentMid: '#a888dc',
    border: '#d4c8ec',
    borderFaint: '#e8dff6',
    surface: '#faf8ff',
    isDark: false,
  },
  {
    name: 'Sepia',
    emoji: '📜',
    accent: '#8a5a30',
    bg: '#f5eedf',
    bgAlt: '#eee3cc',
    text: '#2a1e0e',
    textMuted: '#7a5a38',
    textFaint: '#b09070',
    accentLight: '#f0dfc8',
    accentMid: '#c09060',
    border: '#d8c4a0',
    borderFaint: '#e8d8bc',
    surface: '#faf6ec',
    isDark: false,
  },
  {
    name: 'Night',
    emoji: '🌙',
    accent: '#c084fc',
    bg: '#18122b',
    bgAlt: '#21183c',
    text: '#f8fafc',
    textMuted: '#f1f5f9',
    textFaint: '#cbd5e1',
    accentLight: 'rgba(192, 132, 252, 0.2)',
    accentMid: '#a855f7',
    border: '#6b4fbc',
    borderFaint: '#4c3a7d',
    surface: '#21183c',
    isDark: true,
  },
  {
    name: 'Midnight',
    emoji: '🌊',
    accent: '#60a5fa',
    bg: '#0f172a',
    bgAlt: '#1e293b',
    text: '#f8fafc',
    textMuted: '#f1f5f9',
    textFaint: '#cbd5e1',
    accentLight: 'rgba(96, 165, 250, 0.2)',
    accentMid: '#3b82f6',
    border: '#64748b',
    borderFaint: '#475569',
    surface: '#1e293b',
    isDark: true,
  },
  {
    name: 'Forest',
    emoji: '🌲',
    accent: '#4ade80',
    bg: '#051f15',
    bgAlt: '#0c2e21',
    text: '#f0fdf4',
    textMuted: '#ecfdf5',
    textFaint: '#a7f3d0',
    accentLight: 'rgba(74, 222, 128, 0.2)',
    accentMid: '#22c55e',
    border: '#278c5e',
    borderFaint: '#1e6645',
    surface: '#0c2e21',
    isDark: true,
  },
  {
    name: 'Obsidian',
    emoji: '🖤',
    accent: '#fbbf24',
    bg: '#0f0f11',
    bgAlt: '#18181b',
    text: '#fafafa',
    textMuted: '#f4f4f5',
    textFaint: '#e4e4e7',
    accentLight: 'rgba(251, 191, 36, 0.2)',
    accentMid: '#d97706',
    border: '#52525b',
    borderFaint: '#3f3f46',
    surface: '#18181b',
    isDark: true,
  },
  {
    name: 'Carbon',
    emoji: '⚡',
    accent: '#38bdf8',
    bg: '#18181b',
    bgAlt: '#27272a',
    text: '#f4f4f5',
    textMuted: '#f1f5f9',
    textFaint: '#cbd5e1',
    accentLight: 'rgba(56, 189, 248, 0.2)',
    accentMid: '#0284c7',
    border: '#71717a',
    borderFaint: '#52525b',
    surface: '#27272a',
    isDark: true,
  },
  {
    name: 'Ash',
    emoji: '🌋',
    accent: '#fb923c',
    bg: '#1c1917',
    bgAlt: '#292524',
    text: '#fafaf9',
    textMuted: '#f5f5f4',
    textFaint: '#e7e5e4',
    accentLight: 'rgba(251, 146, 60, 0.2)',
    accentMid: '#ea580c',
    border: '#78716c',
    borderFaint: '#57534e',
    surface: '#292524',
    isDark: true,
  },
  {
    name: 'Charcoal',
    emoji: '🌑',
    accent: '#e09e37',
    bg: '#161618',
    bgAlt: '#202024',
    text: '#f4f4f5',
    textMuted: '#e4e4e7',
    textFaint: '#cbd5e1',
    accentLight: 'rgba(224, 158, 55, 0.18)',
    accentMid: '#c68a2b',
    border: '#52525b',
    borderFaint: '#3a3a40',
    surface: '#202024',
    isDark: true,
  },
  {
    name: 'Lavender',
    emoji: '🔮',
    accent: '#b388ff',
    bg: '#181524',
    bgAlt: '#221d33',
    text: '#f5f3ff',
    textMuted: '#e9d5ff',
    textFaint: '#d8b4fe',
    accentLight: 'rgba(179, 136, 255, 0.18)',
    accentMid: '#9564f0',
    border: '#6d53a2',
    borderFaint: '#423862',
    surface: '#221d33',
    isDark: true,
  },
  {
    name: 'Ember',
    emoji: '🔥',
    accent: '#e07a5f',
    bg: '#1a1512',
    bgAlt: '#261f1b',
    text: '#fdf4ed',
    textMuted: '#fed7aa',
    textFaint: '#fdba74',
    accentLight: 'rgba(224, 122, 95, 0.18)',
    accentMid: '#cc6244',
    border: '#7c4a3a',
    borderFaint: '#463830',
    surface: '#261f1b',
    isDark: true,
  },
  {
    name: 'Dark Sepia',
    emoji: '☕',
    accent: '#d4a373',
    bg: '#241f18',
    bgAlt: '#332a20',
    text: '#fef3c7',
    textMuted: '#fde047',
    textFaint: '#fef08a',
    accentLight: 'rgba(212, 163, 115, 0.18)',
    accentMid: '#bc8a59',
    border: '#785e45',
    borderFaint: '#4e3f30',
    surface: '#332a20',
    isDark: true,
  },
  {
    name: 'Matcha Light',
    emoji: '🍵',
    accent: '#4B6B40',
    bg: '#F2F5F0',
    bgAlt: '#E8EDE5',
    text: '#232F20',
    textMuted: '#5A6F55',
    textFaint: '#8E9E8A',
    accentLight: 'rgba(75, 107, 64, 0.12)',
    accentMid: '#5C824F',
    border: '#E2E8DF',
    borderFaint: '#D4DECF',
    surface: '#FAFBF9',
    isDark: false,
  },
  {
    name: 'Matcha Dark',
    emoji: '🍃',
    accent: '#83B872',
    bg: '#131912',
    bgAlt: '#1A2219',
    text: '#E5EFE3',
    textMuted: '#A0B29C',
    textFaint: '#6E806A',
    accentLight: 'rgba(131, 184, 114, 0.18)',
    accentMid: '#6B965D',
    border: '#2A3629',
    borderFaint: '#1F291E',
    surface: '#1A2219',
    isDark: true,
  },
  {
    name: 'Cinema Light',
    emoji: '🎞️',
    accent: '#5E5E5E',
    bg: '#F0EFEA',
    bgAlt: '#E6E5E0',
    text: '#1C1C1C',
    textMuted: '#666666',
    textFaint: '#999999',
    accentLight: 'rgba(94, 94, 94, 0.12)',
    accentMid: '#7A7A7A',
    border: '#E1E0DA',
    borderFaint: '#D3D2CC',
    surface: '#F7F6F2',
    isDark: false,
  },
  {
    name: 'Cinema Dark',
    emoji: '🎥',
    accent: '#A3A3A3',
    bg: '#141415',
    bgAlt: '#18181A',
    text: '#E1E1E6',
    textMuted: '#9E9EA6',
    textFaint: '#68686E',
    accentLight: 'rgba(163, 163, 163, 0.18)',
    accentMid: '#8A8A8A',
    border: '#262629',
    borderFaint: '#1C1C1E',
    surface: '#18181A',
    isDark: true,
  },
  {
    name: 'Sakura Light',
    emoji: '🌸',
    accent: '#d81b60',
    bg: '#fff0f5',
    bgAlt: '#fce4ec',
    text: '#4a148c',
    textMuted: '#880e4f',
    textFaint: '#c2185b',
    accentLight: 'rgba(216, 27, 96, 0.12)',
    accentMid: '#e91e63',
    border: '#f8bbd0',
    borderFaint: '#fce4ec',
    surface: '#ffffff',
    isDark: false,
  },
  {
    name: 'Sakura Dark',
    emoji: '💮',
    accent: '#f48fb1',
    bg: '#250812',
    bgAlt: '#30131e',
    text: '#fce4ec',
    textMuted: '#f8bbd0',
    textFaint: '#f06292',
    accentLight: 'rgba(244, 143, 177, 0.18)',
    accentMid: '#e91e63',
    border: '#5c1d38',
    borderFaint: '#441428',
    surface: '#331623',
    isDark: true,
  },
  {
    name: 'Christmas Light',
    emoji: '🎄',
    accent: '#c62828',
    bg: '#f1f8e9',
    bgAlt: '#dcedc8',
    text: '#1b5e20',
    textMuted: '#2e7d32',
    textFaint: '#388e3c',
    accentLight: 'rgba(198, 40, 40, 0.12)',
    accentMid: '#d32f2f',
    border: '#c5e1a5',
    borderFaint: '#dcedc8',
    surface: '#ffffff',
    isDark: false,
  },
  {
    name: 'Christmas Dark',
    emoji: '🎅',
    accent: '#ef5350',
    bg: '#0f1a14',
    bgAlt: '#16271d',
    text: '#e8f5e9',
    textMuted: '#a5d6a7',
    textFaint: '#81c784',
    accentLight: 'rgba(239, 83, 80, 0.18)',
    accentMid: '#e53935',
    border: '#2a4633',
    borderFaint: '#1d3325',
    surface: '#1a2c21',
    isDark: true,
  },
  {
    name: 'Pastel Pink Light',
    emoji: '🩰',
    accent: '#f48fb1',
    bg: '#fdf5f6',
    bgAlt: '#faeaeb',
    text: '#5d4037',
    textMuted: '#8d6e63',
    textFaint: '#bcaaa4',
    accentLight: 'rgba(244, 143, 177, 0.12)',
    accentMid: '#f06292',
    border: '#f8bbd0',
    borderFaint: '#fce4ec',
    surface: '#ffffff',
    isDark: false,
  },
  {
    name: 'Pastel Pink Dark',
    emoji: '🎀',
    accent: '#f8bbd0',
    bg: '#1a1012',
    bgAlt: '#24171a',
    text: '#fce4ec',
    textMuted: '#f8bbd0',
    textFaint: '#f48fb1',
    accentLight: 'rgba(248, 187, 208, 0.18)',
    accentMid: '#f06292',
    border: '#4a2531',
    borderFaint: '#331a22',
    surface: '#24171a',
    isDark: true,
  },
  {
    name: 'Cyan Light',
    emoji: '💧',
    accent: '#00acc1',
    bg: '#e0f7fa',
    bgAlt: '#b2ebf2',
    text: '#004d40',
    textMuted: '#00695c',
    textFaint: '#00796b',
    accentLight: 'rgba(0, 172, 193, 0.12)',
    accentMid: '#00bcd4',
    border: '#80deea',
    borderFaint: '#b2ebf2',
    surface: '#ffffff',
    isDark: false,
  },
  {
    name: 'Cyan Dark',
    emoji: '🌊',
    accent: '#26c6da',
    bg: '#001a1c',
    bgAlt: '#00282b',
    text: '#e0f7fa',
    textMuted: '#b2ebf2',
    textFaint: '#80deea',
    accentLight: 'rgba(38, 198, 218, 0.18)',
    accentMid: '#00bcd4',
    border: '#004d40',
    borderFaint: '#00363a',
    surface: '#00282b',
    isDark: true,
  },
]

export function buildPresetTheme(p: PresetColors, overrides?: Partial<PresetColors>): Theme {
  const m = { ...p, ...overrides }
  const headerSuffix = m.isDark ? 'd8' : 'e8'
  return {
    bg: `linear-gradient(150deg, ${m.bg} 0%, ${m.bgAlt} 100%)`,
    heroGrad: `linear-gradient(148deg, ${m.bg} 0%, ${m.bgAlt} 55%, ${m.bg} 100%)`,
    cardGrad: `linear-gradient(135deg, ${m.surface} 0%, ${m.bgAlt} 100%)`,
    text: m.text,
    textMuted: m.textMuted,
    textFaint: m.textFaint,
    accent: m.accent,
    accentLight: m.accentLight,
    accentMid: m.accentMid,
    border: m.border,
    borderFaint: m.borderFaint,
    surface: m.surface,
    header: m.bg + headerSuffix,
    panel: m.surface,
    status: m.bg,
    isDark: m.isDark,
    muted: m.textMuted,
    faint: m.textFaint,
    accentSoft: m.accentLight,
  }
}

export function buildHueTheme(hue: number, isDark: boolean = false): Theme {
  if (isDark) {
    const muted = `hsl(${hue}, 12%, 80%)`
    const faint = `hsl(${hue}, 10%, 65%)`
    const accentLight = `hsla(${hue}, 68%, 50%, 0.22)`
    return {
      bg: `linear-gradient(150deg, hsl(${hue}, 24%, 10%) 0%, hsl(${(hue + 20) % 360}, 28%, 6%) 100%)`,
      heroGrad: `linear-gradient(148deg, hsl(${hue}, 24%, 10%) 0%, hsl(${(hue + 20) % 360}, 28%, 6%) 100%)`,
      cardGrad: `linear-gradient(135deg, hsl(${hue}, 20%, 14%) 0%, hsl(${(hue + 20) % 360}, 22%, 10%) 100%)`,
      text: '#f8fafc',
      textMuted: muted,
      textFaint: faint,
      accent: `hsl(${hue}, 75%, 65%)`,
      accentLight,
      accentMid: `hsl(${hue}, 65%, 50%)`,
      border: `hsl(${hue}, 15%, 25%)`,
      borderFaint: `hsl(${hue}, 15%, 18%)`,
      surface: `hsl(${hue}, 20%, 12%)`,
      header: `hsla(${hue}, 20%, 10%, 0.9)`,
      panel: `hsl(${hue}, 20%, 12%)`,
      status: `hsl(${hue}, 20%, 10%)`,
      isDark: true,
      muted,
      faint,
      accentSoft: accentLight,
    }
  }

  const muted = `hsl(${hue}, 12%, 40%)`
  const faint = `hsl(${hue}, 10%, 55%)`
  const accentLight = `hsl(${hue}, 68%, 95%)`
  return {
    bg: `linear-gradient(150deg, hsl(${hue}, 26%, 97%) 0%, hsl(${(hue + 48) % 360}, 20%, 93%) 100%)`,
    heroGrad: `linear-gradient(148deg, hsl(${hue}, 34%, 95%) 0%, hsl(${(hue + 28) % 360}, 28%, 91%) 55%, hsl(${(hue + 68) % 360}, 26%, 94%) 100%)`,
    cardGrad: `linear-gradient(135deg, hsl(${hue}, 16%, 99%) 0%, hsl(${(hue + 22) % 360}, 14%, 97%) 100%)`,
    text: `hsl(${hue}, 25%, 12%)`,
    textMuted: muted,
    textFaint: faint,
    accent: `hsl(${hue}, 58%, 46%)`,
    accentLight,
    accentMid: `hsl(${hue}, 44%, 72%)`,
    border: `hsl(${hue}, 14%, 87%)`,
    borderFaint: `hsl(${hue}, 14%, 92%)`,
    surface: `hsl(${hue}, 14%, 99%)`,
    header: `hsla(${hue}, 20%, 98%, 0.9)`,
    panel: `hsl(${hue}, 13%, 98%)`,
    status: `hsl(${hue}, 13%, 97%)`,
    isDark: false,
    muted,
    faint,
    accentSoft: accentLight,
  }
}

export const WELCOME_ID = 'welcome-doc-1'

export const BUILTIN_FONTS = [
  { family: 'Merriweather', label: 'Merriweather' },
  { family: 'Times New Roman', label: 'Times New Roman' },
  { family: 'Georgia', label: 'Georgia' },
  { family: 'Courier New', label: 'Courier New' },
  { family: 'Verdana', label: 'Verdana' },
  { family: 'Lora', label: 'Lora' },
  { family: 'Playfair Display', label: 'Playfair Display' },
  { family: 'EB Garamond', label: 'EB Garamond' },
  { family: 'Libre Baskerville', label: 'Libre Baskerville' },
  { family: 'Inter', label: 'Inter' },
  { family: 'Roboto', label: 'Roboto' },
  { family: 'Open Sans', label: 'Open Sans' },
  { family: 'Montserrat', label: 'Montserrat' },
  { family: 'Lato', label: 'Lato' },
  { family: 'Helvetica', label: 'Helvetica' },
  { family: 'Arial', label: 'Arial' },
  { family: 'Source Sans 3', label: 'Source Sans 3' },
  { family: 'DM Sans', label: 'DM Sans' },
  { family: 'JetBrains Mono', label: 'JetBrains Mono' },
]

export const THEMES: Record<string, Theme> = {
  light: buildPresetTheme(PRESETS[0]),
  dark: buildPresetTheme(PRESETS[5]),
  sepia: buildPresetTheme(PRESETS[4]),
  ...Object.fromEntries(PRESETS.map(p => [p.name.toLowerCase(), buildPresetTheme(p)])),
}

function isHexDark(color: string): boolean {
  if (!color || typeof color !== 'string') return false
  if (color.startsWith('hsl')) {
    const match = color.match(/hsl\s*\(\s*\d+\s*,\s*\d+%\s*,\s*(\d+)%\s*\)/i)
    if (match) return parseInt(match[1], 10) < 45
  }
  const hex = color.replace('#', '')
  if (hex.length !== 6) return false
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 0.45
}

export function deriveCustomTheme(bg: string, text: string, accent: string): Theme {
  const isDark = isHexDark(bg)
  let textColor = text
  if (isDark && isHexDark(text)) {
    textColor = '#f8fafc'
  } else if (!isDark && !isHexDark(text)) {
    textColor = '#0f172a'
  }
  const muted = isDark ? '#cbd5e1' : '#475569'
  const faint = isDark ? '#94a3b8' : '#64748b'
  const accentSoft = isDark ? 'rgba(255, 255, 255, 0.12)' : (accent.startsWith('#') ? accent + '22' : 'rgba(37, 99, 235, 0.12)')
  return {
    bg,
    heroGrad: bg,
    cardGrad: bg,
    text: textColor,
    textMuted: muted,
    textFaint: faint,
    accent,
    accentLight: accentSoft,
    accentMid: accent.startsWith('#') ? accent + '88' : accent,
    border: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)',
    borderFaint: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    surface: isDark ? 'rgba(255, 255, 255, 0.04)' : bg,
    header: bg,
    panel: isDark ? '#18181b' : bg,
    status: bg,
    isDark,
    muted,
    faint,
    accentSoft,
  }
}
