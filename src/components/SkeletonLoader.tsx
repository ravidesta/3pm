// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — SkeletonLoader
// Shimmer placeholder animation for loading states
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius } from '../theme/spacing';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.md,
  style,
}) => {
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1, false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmer.value,
          [-1, 1],
          [-300, 300]
        ),
      },
    ],
  }));

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255,255,255,0.08)',
            'rgba(255,255,255,0.14)',
            'rgba(255,255,255,0.08)',
            'transparent',
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

// ── Outfit Card Skeleton ──────────────────────────────────────────────────

export const OutfitCardSkeleton: React.FC = () => (
  <View style={skeletonStyles.card}>
    <Skeleton height={220} borderRadius={16} />
    <View style={skeletonStyles.body}>
      <Skeleton width="60%" height={24} />
      <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
      <View style={skeletonStyles.row}>
        <Skeleton width={60} height={60} borderRadius={12} />
        <Skeleton width={60} height={60} borderRadius={12} />
        <Skeleton width={60} height={60} borderRadius={12} />
      </View>
    </View>
  </View>
);

// ── Garment Grid Skeleton ─────────────────────────────────────────────────

export const GarmentGridSkeleton: React.FC = () => (
  <View style={skeletonStyles.grid}>
    {Array.from({ length: 6 }).map((_, i) => (
      <View key={i} style={skeletonStyles.gridItem}>
        <Skeleton height={160} borderRadius={12} />
        <Skeleton width="70%" height={12} style={{ marginTop: 8 }} />
      </View>
    ))}
  </View>
);

const skeletonStyles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  body: {
    paddingVertical: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  gridItem: {
    width: '47%',
  },
});
