// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Animation Config
// Resonance OS: motion as breath, spring-based, 60fps
// ─────────────────────────────────────────────────────────────────────────────

import { withSpring, withTiming, Easing } from 'react-native-reanimated';

// Spring configs (react-native-reanimated)
export const Springs = {
  // Gentle, organic (outfit card appear)
  gentle: {
    damping: 18,
    stiffness: 120,
    mass: 1,
    overshootClamping: false,
  },

  // Snappy but not bouncy (button press)
  snappy: {
    damping: 22,
    stiffness: 220,
    mass: 0.8,
    overshootClamping: true,
  },

  // Luxurious, slow settle (onboarding transitions)
  luxe: {
    damping: 28,
    stiffness: 90,
    mass: 1.2,
    overshootClamping: false,
  },

  // Quick response (haptic feedback companion)
  haptic: {
    damping: 30,
    stiffness: 400,
    mass: 0.6,
    overshootClamping: true,
  },

  // Floating (scan ring pulse)
  float: {
    damping: 12,
    stiffness: 80,
    mass: 1.4,
    overshootClamping: false,
  },
} as const;

// Timing configs (exhale-paced)
export const Timing = {
  instant:    80,
  fast:       150,
  normal:     300,
  slow:       500,
  breathe:    700,   // One exhale
  atmospheric:1500,  // Background motion
} as const;

// Easing curves
export const Curves = {
  organic:    Easing.bezier(0.165, 0.84, 0.44, 1),
  easeOut:    Easing.out(Easing.cubic),
  easeInOut:  Easing.inOut(Easing.cubic),
  linear:     Easing.linear,
  spring:     Easing.bezier(0.34, 1.56, 0.64, 1),
} as const;

// Pre-built animation helpers
export const animateIn = (value: any, delay = 0) =>
  withTiming(1, { duration: Timing.breathe, easing: Curves.organic });

export const animateOut = (value: any) =>
  withTiming(0, { duration: Timing.normal, easing: Curves.easeOut });

export const buttonPress = () =>
  withSpring(0.95, Springs.haptic);

export const buttonRelease = () =>
  withSpring(1, Springs.snappy);

// Stagger delay calculator for list animations
export const staggerDelay = (index: number, base = 60) => index * base;
