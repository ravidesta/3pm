// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Theme Index
// ─────────────────────────────────────────────────────────────────────────────

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './animations';

import { Dark, Light, Brand, AuraSpectrum, SpectrumColors } from './colors';
import { FontFamily, TypeScale, TextStyles } from './typography';
import { Spacing, BorderRadius, Shadows, ButtonDepth, TouchTarget } from './spacing';
import { Springs, Timing, Curves } from './animations';

export const Theme = {
  colors: {
    dark: Dark,
    light: Light,
    brand: Brand,
    spectrum: AuraSpectrum,
    spectrumMap: SpectrumColors,
  },
  fonts: FontFamily,
  type: { scale: TypeScale, styles: TextStyles },
  spacing: Spacing,
  radius: BorderRadius,
  shadows: Shadows,
  buttonDepth: ButtonDepth,
  touchTarget: TouchTarget,
  springs: Springs,
  timing: Timing,
  curves: Curves,
} as const;

export default Theme;
