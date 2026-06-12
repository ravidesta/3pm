// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Typography
// Resonance OS: Cormorant Garamond (content), Manrope (structure)
// ─────────────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';

export const FontFamily = {
  // Cormorant Garamond — the content of life
  serifRegular:    'CormorantGaramond-Regular',
  serifMedium:     'CormorantGaramond-Medium',
  serifSemiBold:   'CormorantGaramond-SemiBold',
  serifBold:       'CormorantGaramond-Bold',
  serifItalic:     'CormorantGaramond-Italic',
  serifBoldItalic: 'CormorantGaramond-BoldItalic',

  // Manrope — the trellis (labels, navigation, dates)
  sansLight:       'Manrope-Light',
  sansRegular:     'Manrope-Regular',
  sansMedium:      'Manrope-Medium',
  sansSemiBold:    'Manrope-SemiBold',
  sansBold:        'Manrope-Bold',
  sansExtraBold:   'Manrope-ExtraBold',

  // Fallbacks
  systemSerif:     Platform.select({ ios: 'Georgia', android: 'serif' }) ?? 'Georgia',
  systemSans:      Platform.select({ ios: 'SF Pro Display', android: 'Roboto' }) ?? 'System',
} as const;

export const TypeScale = {
  // Display (Cormorant Garamond — large, expressive)
  display2xl:  { fontSize: 72, lineHeight: 72, letterSpacing: -1.5 },
  displayXl:   { fontSize: 56, lineHeight: 60, letterSpacing: -1.2 },
  displayLg:   { fontSize: 48, lineHeight: 52, letterSpacing: -1 },
  displayMd:   { fontSize: 40, lineHeight: 44, letterSpacing: -0.8 },
  displaySm:   { fontSize: 32, lineHeight: 36, letterSpacing: -0.5 },

  // Headings (Cormorant Garamond)
  h1:          { fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  h2:          { fontSize: 24, lineHeight: 30, letterSpacing: -0.2 },
  h3:          { fontSize: 20, lineHeight: 26, letterSpacing: -0.1 },
  h4:          { fontSize: 18, lineHeight: 24, letterSpacing: 0 },

  // Body (Cormorant Garamond)
  bodyLg:      { fontSize: 17, lineHeight: 26 },
  bodyMd:      { fontSize: 15, lineHeight: 23 },
  bodySm:      { fontSize: 14, lineHeight: 21 },

  // Labels/Caps (Manrope, uppercase with tracking)
  labelXl:     { fontSize: 13, lineHeight: 18, letterSpacing: 2.5 },
  labelLg:     { fontSize: 11, lineHeight: 16, letterSpacing: 2.2 },
  labelMd:     { fontSize: 10, lineHeight: 14, letterSpacing: 2 },
  labelSm:     { fontSize: 9,  lineHeight: 12, letterSpacing: 1.8 },

  // UI (Manrope)
  uiLg:        { fontSize: 16, lineHeight: 22, letterSpacing: 0 },
  uiMd:        { fontSize: 14, lineHeight: 20, letterSpacing: 0 },
  uiSm:        { fontSize: 12, lineHeight: 18, letterSpacing: 0.2 },
  uiXs:        { fontSize: 11, lineHeight: 16, letterSpacing: 0.3 },

  // Caption
  caption:     { fontSize: 11, lineHeight: 15, letterSpacing: 0.4 },
  micro:       { fontSize: 9,  lineHeight: 12, letterSpacing: 0.5 },
} as const;

// Pre-composed text styles
export const TextStyles = {
  // Outfit style name — the hero text
  outfitTitle: {
    fontFamily: FontFamily.serifBold,
    ...TypeScale.displaySm,
    letterSpacing: -0.5,
  },

  // Garment category labels — all caps, tracked
  categoryLabel: {
    fontFamily: FontFamily.sansSemiBold,
    ...TypeScale.labelMd,
    textTransform: 'uppercase' as const,
  },

  // Screen headlines
  screenTitle: {
    fontFamily: FontFamily.serifSemiBold,
    ...TypeScale.h1,
  },

  // Section headers
  sectionHeader: {
    fontFamily: FontFamily.sansSemiBold,
    ...TypeScale.labelLg,
    textTransform: 'uppercase' as const,
  },

  // Intention / breath text (italic serif)
  intention: {
    fontFamily: FontFamily.serifItalic,
    ...TypeScale.bodyLg,
    letterSpacing: 0.3,
  },

  // Body copy
  body: {
    fontFamily: FontFamily.serifRegular,
    ...TypeScale.bodyMd,
  },

  // Navigation labels
  navLabel: {
    fontFamily: FontFamily.sansMedium,
    ...TypeScale.uiXs,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  },

  // Score / stat numbers
  stat: {
    fontFamily: FontFamily.serifBold,
    ...TypeScale.displayMd,
  },

  // Buttons
  buttonLg: {
    fontFamily: FontFamily.sansSemiBold,
    ...TypeScale.uiLg,
    letterSpacing: 0.5,
  },
  buttonMd: {
    fontFamily: FontFamily.sansSemiBold,
    ...TypeScale.uiMd,
    letterSpacing: 0.4,
  },
} as const;
