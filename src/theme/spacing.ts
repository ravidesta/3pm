// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Spacing, Shadows, Borders
// ─────────────────────────────────────────────────────────────────────────────

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96,
} as const;

export const BorderRadius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  '2xl': 24,
  '3xl': 32,
  full: 999,
} as const;

// 3D shadow system — layered for depth
export const Shadows = {
  // Subtle lift
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },

  // Card elevation
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },

  // Modal / drawer
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },

  // Floating (FAB, overlay cards)
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 20,
  },

  // Violet glow — active elements, outfit cards
  violetGlow: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },

  // Pink glow — selection states
  pinkGlow: {
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },

  // Gold glow — reward states
  goldGlow: {
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 10,
  },

  // Outer ring (3D button effect)
  buttonActive: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 14,
  },
} as const;

// Kinetic button press depth
export const ButtonDepth = {
  resting:  1,     // scale
  pressed:  0.95,  // scale (dip-in effect)
  duration: 120,   // ms
};

// Touch targets (Apple HIG: 44pt minimum)
export const TouchTarget = {
  min: 44,
  md:  52,
  lg:  60,
} as const;
