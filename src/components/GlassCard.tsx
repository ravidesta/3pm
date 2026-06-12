// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — GlassCard
// Morphic glass panel with 3D shadow and optional glow border
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { StyleSheet, ViewStyle, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Dark, Brand } from '../theme/colors';
import { BorderRadius, Shadows, Spacing } from '../theme/spacing';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;        // Blur intensity 0–100
  glowColor?: string;        // Optional glow border color
  variant?: 'dark' | 'light' | 'violet' | 'pink';
  padding?: number;
  borderRadius?: number;
  noShadow?: boolean;
}

const TINTS = {
  dark:   'rgba(15, 18, 46, 0.7)',
  light:  'rgba(255, 255, 255, 0.65)',
  violet: 'rgba(124, 58, 237, 0.18)',
  pink:   'rgba(236, 72, 153, 0.14)',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 40,
  glowColor,
  variant = 'dark',
  padding = Spacing.lg,
  borderRadius = BorderRadius.xl,
  noShadow = false,
}) => {
  const tint = TINTS[variant];
  const shadow = noShadow ? {} : (glowColor ? getGlowShadow(glowColor) : Shadows.md);

  return (
    <View
      style={[
        styles.wrapper,
        { borderRadius, ...shadow },
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[styles.blur, { borderRadius }]}
      >
        {/* Inner gradient tint */}
        <LinearGradient
          colors={[tint, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
        />

        {/* Glow border */}
        {glowColor && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderRadius,
                borderWidth: 1,
                borderColor: `${glowColor}60`,
              },
            ]}
            pointerEvents="none"
          />
        )}

        {/* Top highlight line */}
        <View
          style={[
            styles.highlight,
            { borderRadius: borderRadius - 1 },
          ]}
          pointerEvents="none"
        />

        <View style={{ padding }}>{children}</View>
      </BlurView>
    </View>
  );
};

function getGlowShadow(color: string) {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 12,
  };
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  blur: {
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 18, 46, 0.4)',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    pointerEvents: 'none',
  },
});
