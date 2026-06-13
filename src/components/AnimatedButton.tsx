// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — AnimatedButton
// Kinetic "dip-in" press effect with haptics + spring animation
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback } from 'react';
import {
  StyleSheet, Text, ViewStyle, TextStyle, Pressable,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Brand, Dark } from '../theme/colors';
import { FontFamily, TypeScale } from '../theme/typography';
import { BorderRadius, Shadows, Spacing, TouchTarget } from '../theme/spacing';
import { Springs } from '../theme/animations';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'glass' | 'danger';
type ButtonSize   = 'sm' | 'md' | 'lg';

interface AnimatedButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  hapticStyle?: Haptics.ImpactFeedbackStyle;
}

const GRADIENTS: Record<ButtonVariant, [string, string]> = {
  primary:   [Brand.violet, Brand.violetDark],
  secondary: [Brand.pink, Brand.pinkDark],
  ghost:     ['transparent', 'transparent'],
  glass:     ['rgba(124,58,237,0.15)', 'rgba(91,33,182,0.1)'],
  danger:    ['#D87050', '#B85A38'],
};

const TEXT_COLORS: Record<ButtonVariant, string> = {
  primary:   '#FFFFFF',
  secondary: '#FFFFFF',
  ghost:     Brand.violetLight,
  glass:     Brand.violetLight,
  danger:    '#FFFFFF',
};

const SIZE_CONFIGS: Record<ButtonSize, { height: number; px: number; fontSize: number }> = {
  sm:  { height: TouchTarget.min, px: Spacing.lg,  fontSize: 13 },
  md:  { height: TouchTarget.md,  px: Spacing['2xl'], fontSize: 15 },
  lg:  { height: TouchTarget.lg,  px: Spacing['3xl'], fontSize: 16 },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
  hapticStyle = Haptics.ImpactFeedbackStyle.Light,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, Springs.haptic);
    opacity.value = withTiming(0.9, { duration: 80 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, Springs.snappy);
    opacity.value = withTiming(1, { duration: 120 });
  }, []);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;
    Haptics.impactAsync(hapticStyle);
    onPress();
  }, [disabled, loading, hapticStyle, onPress]);

  const cfg = SIZE_CONFIGS[size];

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        animStyle,
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      <LinearGradient
        colors={disabled ? ['#2A2440', '#1E1A35'] : GRADIENTS[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            height: cfg.height,
            paddingHorizontal: cfg.px,
            borderRadius: BorderRadius.full,
            ...(variant === 'primary' ? Shadows.violetGlow : {}),
            ...(variant !== 'ghost' && variant !== 'glass' ? styles.border : styles.ghostBorder),
          },
        ]}
      >
        {icon && iconPosition === 'left' && (
          <Animated.View style={styles.iconLeft}>{icon}</Animated.View>
        )}
        <Text
          style={[
            styles.label,
            {
              fontSize: cfg.fontSize,
              color: disabled ? Dark.textMuted : TEXT_COLORS[variant],
            },
            textStyle,
          ]}
        >
          {loading ? '...' : label}
        </Text>
        {icon && iconPosition === 'right' && (
          <Animated.View style={styles.iconRight}>{icon}</Animated.View>
        )}
      </LinearGradient>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  border: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  ghostBorder: {
    borderWidth: 1,
    borderColor: `${Brand.violet}60`,
  },
  label: {
    fontFamily: FontFamily.sansSemiBold,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  iconLeft:  { marginRight: Spacing.sm },
  iconRight: { marginLeft: Spacing.sm },
});
