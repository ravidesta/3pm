// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — SpectrumBar
// Full color wheel strip: pastels → vibrant → midnight blue
// Used as the signature visual brand element throughout the app
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  Easing, interpolate,
} from 'react-native-reanimated';
import { AuraSpectrum } from '../theme/colors';
import { BorderRadius } from '../theme/spacing';

interface SpectrumBarProps {
  height?: number;
  style?: ViewStyle;
  animated?: boolean;
  opacity?: number;
  borderRadius?: number;
}

export const SpectrumBar: React.FC<SpectrumBarProps> = ({
  height = 4,
  style,
  animated = false,
  opacity = 1,
  borderRadius = BorderRadius.full,
}) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      shimmer.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      );
    }
  }, [animated]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: animated
      ? interpolate(shimmer.value, [0, 1], [0.8, 1])
      : opacity,
  }));

  return (
    <Animated.View style={[{ height, borderRadius, overflow: 'hidden' }, style, shimmerStyle]}>
      <LinearGradient
        colors={AuraSpectrum as any}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
};

// ── SpectrumOrb — floating decorative sphere ───────────────────────────────

interface SpectrumOrbProps {
  size?: number;
  style?: ViewStyle;
  colors?: [string, string, ...string[]];
  opacity?: number;
}

export const SpectrumOrb: React.FC<SpectrumOrbProps> = ({
  size = 200,
  style,
  colors = ['#7C3AED', '#EC4899', '#F59E0B'],
  opacity = 0.25,
}) => {
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, -12]) },
    ],
    opacity,
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, style, floatStyle]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      />
    </Animated.View>
  );
};

// ── SpectrumCircle — the full color wheel (onboarding hero element) ────────

export const SpectrumCircle: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size = 280,
  style,
}) => {
  // We create a conic-like effect using multiple LinearGradient arcs via SVG
  // For RN, we approximate with a radial gradient layering technique
  const segments = 12;
  const segmentColors = [
    '#FFF9C4', '#FFE0B2', '#FFD7F0', '#F8BBD9',
    '#E1BEE7', '#D1C4E9', '#C5CAE9',
    '#7C3AED', '#3F51B5', '#1565C0',
    '#0D47A1', '#0F172A',
  ];

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <LinearGradient
        colors={segmentColors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: size, height: size }}
      />
      {/* Inner white glow for depth */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.15)',
          },
        ]}
      />
    </View>
  );
};
