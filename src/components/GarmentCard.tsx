// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — GarmentCard
// Wardrobe item thumbnail with category badge, wear count, color swatch
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Image,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { Garment } from '../types';
import { Dark, Brand } from '../theme/colors';
import { FontFamily, TypeScale } from '../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../theme/spacing';
import { Springs } from '../theme/animations';

interface GarmentCardProps {
  garment: Garment;
  onPress: (garment: Garment) => void;
  selected?: boolean;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = { sm: 130, md: 160, lg: 200 };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GarmentCard: React.FC<GarmentCardProps> = ({
  garment, onPress, selected = false, style, size = 'md',
}) => {
  const scale = useSharedValue(1);
  const dim = SIZE_MAP[size];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn  = () => { scale.value = withSpring(0.95, Springs.haptic); };
  const handlePressOut = () => { scale.value = withSpring(1, Springs.snappy); };
  const handlePress    = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(garment);
  }, [garment, onPress]);

  const daysSinceWorn = garment.lastWornDate
    ? Math.floor((Date.now() - new Date(garment.lastWornDate).getTime()) / 86400000)
    : null;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animStyle, style]}
    >
      <View
        style={[
          styles.card,
          { width: dim, borderRadius: BorderRadius.lg },
          selected && styles.selected,
          selected ? Shadows.violetGlow : Shadows.md,
        ]}
      >
        {/* Image */}
        <View style={{ width: dim, height: dim * 1.1, borderTopLeftRadius: BorderRadius.lg, borderTopRightRadius: BorderRadius.lg, overflow: 'hidden' }}>
          {garment.imageUri ? (
            <Image
              source={{ uri: garment.imageUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <LinearGradient
              colors={[
                garment.colors[0]?.hex ?? Dark.bg3,
                garment.colors[1]?.hex ?? Dark.bg4,
              ]}
              style={{ flex: 1 }}
            />
          )}

          {/* Gradient footer */}
          <LinearGradient
            colors={['transparent', 'rgba(10,14,30,0.85)']}
            style={[StyleSheet.absoluteFill, { justifyContent: 'flex-end', padding: Spacing.sm }]}
          >
            {/* Category badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{garment.category.toUpperCase()}</Text>
            </View>
          </LinearGradient>

          {/* Selected checkmark */}
          {selected && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}

          {/* Unworn indicator */}
          {daysSinceWorn !== null && daysSinceWorn > 30 && (
            <View style={styles.unwornDot} />
          )}
        </View>

        {/* Info row */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{garment.name}</Text>

          <View style={styles.bottom}>
            {/* Color swatches */}
            <View style={styles.swatches}>
              {garment.colors.slice(0, 3).map((c, i) => (
                <View
                  key={i}
                  style={[
                    styles.swatch,
                    { backgroundColor: c.hex, marginLeft: i > 0 ? -4 : 0, zIndex: 3 - i },
                  ]}
                />
              ))}
            </View>

            {/* Wear count */}
            <Text style={styles.wearCount}>
              {garment.wearCount > 0 ? `×${garment.wearCount}` : 'New'}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Dark.bg3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Dark.borderSubtle,
  },
  selected: {
    borderColor: Brand.violet,
    borderWidth: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(124,58,237,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontFamily: FontFamily.sansBold,
    fontSize: 8,
    letterSpacing: 1.5,
    color: '#fff',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Brand.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FontFamily.sansBold,
  },
  unwornDot: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.amber,
  },
  info: {
    padding: Spacing.sm,
    paddingTop: Spacing.xs,
    backgroundColor: Dark.bg3,
  },
  name: {
    fontFamily: FontFamily.serifMedium,
    fontSize: 13,
    color: Dark.textPrimary,
    lineHeight: 18,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  swatches: {
    flexDirection: 'row',
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  wearCount: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: Dark.textTertiary,
    letterSpacing: 0.5,
  },
});
