// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Color System
// Full spectrum from pastel yellows → vibrant → midnight blue
// Resonance OS Design Language × Luxury Fashion
// ─────────────────────────────────────────────────────────────────────────────

export const SpectrumColors = {
  // ── PASTEL ZONE ──────────────────────────────────────────────────────────
  pastelYellow:    '#FFF9C4',
  pastelAmber:     '#FFECB3',
  pastelOrange:    '#FFE0B2',
  pastelPeach:     '#FFDAD6',
  pastelRose:      '#FFD7F0',
  pastelPink:      '#F8BBD9',
  pastelLilac:     '#E1BEE7',
  pastelLavender:  '#D1C4E9',
  pastelPeriwinkle:'#C5CAE9',
  pastelBlue:      '#BBDEFB',
  pastelCyan:      '#B2EBF2',
  pastelMint:      '#B2DFDB',

  // ── VIBRANT ZONE ─────────────────────────────────────────────────────────
  vibrantYellow:   '#FFD700',
  vibrantAmber:    '#FFC107',
  vibrantOrange:   '#FF9800',
  vibrantDeepOrange:'#FF5722',
  vibrantCoral:    '#FF6B6B',
  vibrantPink:     '#FF4081',
  vibrantHotPink:  '#F50057',
  vibrantMagenta:  '#E040FB',
  vibrantPurple:   '#9C27B0',
  vibrantViolet:   '#7C3AED',
  vibrantIndigo:   '#3F51B5',
  vibrantBlue:     '#2196F3',
  vibrantCyan:     '#00BCD4',
  vibrantTeal:     '#009688',
  vibrantEmerald:  '#10B981',

  // ── DEEP MIDNIGHT ZONE ───────────────────────────────────────────────────
  deepPurple:      '#4527A0',
  deepIndigo:      '#283593',
  deepBlue:        '#1565C0',
  navy:            '#0D47A1',
  deepNavy:        '#0A2463',
  midnightBlue:    '#0F172A',
  void:            '#060B14',
} as const;

// Full linear spectrum array for gradient rendering
export const AuraSpectrum = [
  SpectrumColors.pastelYellow,
  SpectrumColors.pastelAmber,
  SpectrumColors.pastelOrange,
  SpectrumColors.pastelPeach,
  SpectrumColors.pastelRose,
  SpectrumColors.pastelPink,
  SpectrumColors.pastelLilac,
  SpectrumColors.vibrantAmber,
  SpectrumColors.vibrantOrange,
  SpectrumColors.vibrantCoral,
  SpectrumColors.vibrantPink,
  SpectrumColors.vibrantMagenta,
  SpectrumColors.vibrantPurple,
  SpectrumColors.vibrantViolet,
  SpectrumColors.vibrantIndigo,
  SpectrumColors.vibrantBlue,
  SpectrumColors.deepPurple,
  SpectrumColors.deepIndigo,
  SpectrumColors.deepBlue,
  SpectrumColors.navy,
  SpectrumColors.midnightBlue,
];

// ── BRAND PALETTE ─────────────────────────────────────────────────────────
export const Brand = {
  // Primary
  violet:          '#7C3AED',
  violetLight:     '#A78BFA',
  violetDark:      '#5B21B6',
  violetDeep:      '#3B0764',

  // Accent Pink
  pink:            '#EC4899',
  pinkLight:       '#F9A8D4',
  pinkDark:        '#BE185D',

  // Accent Emerald
  emerald:         '#10B981',
  emeraldLight:    '#6EE7B7',
  emeraldDark:     '#065F46',

  // Accent Amber
  amber:           '#F59E0B',
  amberLight:      '#FCD34D',
  amberDark:       '#92400E',

  // Gold (Resonance reward color)
  gold:            '#C5A059',
  goldLight:       '#E6D0A1',
  goldDark:        '#9A7A3A',
} as const;

// ── DARK THEME (Primary) ──────────────────────────────────────────────────
export const Dark = {
  bg0:             '#060B14',   // Deepest void
  bg1:             '#0A1220',   // Base background
  bg2:             '#0F1A2E',   // Elevated surface
  bg3:             '#162035',   // Card background
  bg4:             '#1E2D45',   // Hover state

  // Glass layers
  glass1:          'rgba(255,255,255,0.04)',
  glass2:          'rgba(255,255,255,0.08)',
  glass3:          'rgba(255,255,255,0.12)',
  glassViolet:     'rgba(124, 58, 237, 0.15)',
  glassPink:       'rgba(236, 72, 153, 0.12)',

  // Text
  textPrimary:     '#F8F6FF',
  textSecondary:   '#C4B5FD',
  textTertiary:    '#7C6FAB',
  textMuted:       '#4C4575',

  // Borders
  borderSubtle:    'rgba(255,255,255,0.06)',
  borderDefault:   'rgba(255,255,255,0.12)',
  borderBright:    'rgba(124, 58, 237, 0.4)',

  // Status
  success:         '#10B981',
  warning:         '#F59E0B',
  info:            '#60A5FA',
  coral:           '#D87050',  // Resonance energy (never red)
} as const;

// ── LIGHT THEME ───────────────────────────────────────────────────────────
export const Light = {
  bg0:             '#FDFBFF',
  bg1:             '#F8F4FF',
  bg2:             '#F2ECFF',
  bg3:             '#FFFFFF',
  bg4:             '#EDE6FF',

  glass1:          'rgba(255,255,255,0.6)',
  glass2:          'rgba(255,255,255,0.75)',
  glass3:          'rgba(255,255,255,0.9)',
  glassViolet:     'rgba(124, 58, 237, 0.08)',
  glassPink:       'rgba(236, 72, 153, 0.06)',

  textPrimary:     '#1A0A3C',
  textSecondary:   '#4C3A85',
  textTertiary:    '#8B7ABF',
  textMuted:       '#BDB0DC',

  borderSubtle:    'rgba(124,58,237,0.08)',
  borderDefault:   'rgba(124,58,237,0.16)',
  borderBright:    'rgba(124,58,237,0.5)',

  success:         '#059669',
  warning:         '#D97706',
  info:            '#2563EB',
  coral:           '#D87050',
} as const;

// ── COLOR SEASONS (for skin tone analysis) ────────────────────────────────
export const ColorSeasons = {
  Spring: {
    label: 'Spring',
    subLabel: 'Warm & Light',
    description: 'Clear, warm, and delicate. Your colors are fresh and alive.',
    emoji: '🌸',
    palette: ['#FFD700','#FFA500','#FF8C00','#FF6B35','#FFC0CB','#FFE4B5','#FFDEAD','#F5DEB3','#98FB98','#90EE90','#87CEEB','#00CED1'],
    hero: '#FFD700',
  },
  Summer: {
    label: 'Summer',
    subLabel: 'Cool & Muted',
    description: 'Soft, cool, and romantic. Your colors whisper in dusty hues.',
    emoji: '🌊',
    palette: ['#B0C4DE','#778899','#708090','#4682B4','#DDA0DD','#EE82EE','#9370DB','#BA55D3','#DB7093','#DC143C','#BC8F8F','#F4A460'],
    hero: '#B0C4DE',
  },
  Autumn: {
    label: 'Autumn',
    subLabel: 'Warm & Deep',
    description: 'Rich, warm, and earthy. Your colors glow like the harvest.',
    emoji: '🍂',
    palette: ['#8B4513','#A0522D','#CD853F','#DEB887','#D2691E','#B8860B','#DAA520','#808000','#556B2F','#6B8E23','#8B6914','#C68642'],
    hero: '#D2691E',
  },
  Winter: {
    label: 'Winter',
    subLabel: 'Cool & Vivid',
    description: 'Bold, cool, and striking. Your colors are pure and intense.',
    emoji: '❄️',
    palette: ['#000000','#FFFFFF','#C0C0C0','#0000FF','#00008B','#800080','#8B0000','#DC143C','#FF1493','#00FFFF','#008080','#2F4F4F'],
    hero: '#000080',
  },
} as const;

export type ColorSeason = keyof typeof ColorSeasons;

// ── AESTHETIC STYLES (internal spiral mapping, never exposed) ─────────────
export const AestheticStyles = {
  Minimalist:   { label: 'Minimalist',   emoji: '◽', color: '#A78BFA', energyLevel: 'restorative', internalTag: 'yellow' },
  Boho:         { label: 'Boho',         emoji: '🌿', color: '#6EE7B7', energyLevel: 'light',       internalTag: 'green'  },
  Classic:      { label: 'Classic',      emoji: '👑', color: '#FCD34D', energyLevel: 'flow',        internalTag: 'orange' },
  Streetwear:   { label: 'Streetwear',   emoji: '🔥', color: '#FB923C', energyLevel: 'deep',        internalTag: 'red'    },
  Romantic:     { label: 'Romantic',     emoji: '🌸', color: '#F9A8D4', energyLevel: 'light',       internalTag: 'green'  },
  Edgy:         { label: 'Edgy',         emoji: '⚡', color: '#D87050', energyLevel: 'deep',        internalTag: 'red'    },
  Preppy:       { label: 'Preppy',       emoji: '🎀', color: '#93C5FD', energyLevel: 'flow',        internalTag: 'orange' },
  Athleisure:   { label: 'Athleisure',   emoji: '✨', color: '#6EE7B7', energyLevel: 'light',       internalTag: 'orange' },
} as const;

export type AestheticStyle = keyof typeof AestheticStyles;

// Outfit match score gradient
export const ScoreGradient = (score: number): string[] => {
  if (score >= 8) return [Brand.emerald, Brand.violet];
  if (score >= 6) return [Brand.amber, Brand.pink];
  if (score >= 4) return [Brand.gold, Brand.violetLight];
  return [Dark.textMuted, Dark.bg4];
};
