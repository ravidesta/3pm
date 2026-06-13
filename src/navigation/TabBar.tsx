// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Custom Tab Bar
// Morphic glass floating tab bar with spectrum accent + kinetic press
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Brand, Dark } from '../theme/colors';
import { FontFamily } from '../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../theme/spacing';
import { Springs } from '../theme/animations';
import { SpectrumBar } from '../components/SpectrumBar';

const { width: SW } = Dimensions.get('window');
const TAB_BAR_W = SW - 40;

const TAB_CONFIG: Record<string, { label: string; icon: string; activeIcon: string }> = {
  Today: {
    label: 'Today',
    icon: '◎',
    activeIcon: '◉',
  },
  Closet: {
    label: 'Closet',
    icon: '◻',
    activeIcon: '◼',
  },
  Scan: {
    label: 'Scan',
    icon: '⊕',
    activeIcon: '⊕',
  },
  Style: {
    label: 'Style',
    icon: '✦',
    activeIcon: '✦',
  },
  Shop: {
    label: 'Stats',
    icon: '◈',
    activeIcon: '◈',
  },
};

export function AuraTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Spectrum line at top of tab bar */}
      <SpectrumBar height={1} style={styles.spectrumLine} opacity={0.6} />

      <BlurView intensity={60} tint="dark" style={styles.blur}>
        {/* Glass background */}
        <LinearGradient
          colors={['rgba(10,12,28,0.85)', 'rgba(15,18,46,0.95)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Border highlight */}
        <View style={styles.borderHighlight} pointerEvents="none" />

        {/* Tab items */}
        <View style={styles.tabRow}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const config = TAB_CONFIG[route.name] ?? { label: route.name, icon: '◎', activeIcon: '◉' };
            const isScan = route.name === 'Scan';

            return (
              <TabItem
                key={route.key}
                label={config.label}
                icon={isFocused ? config.activeIcon : config.icon}
                isFocused={isFocused}
                isScan={isScan}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isFocused && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

// ── Tab Item ──────────────────────────────────────────────────────────────

interface TabItemProps {
  label: string;
  icon: string;
  isFocused: boolean;
  isScan: boolean;
  onPress: () => void;
}

function TabItem({ label, icon, isFocused, isScan, onPress }: TabItemProps) {
  const scale = useSharedValue(1);
  const dotOpacity = useSharedValue(isFocused ? 1 : 0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [{ scaleX: interpolate(dotOpacity.value, [0, 1], [0.5, 1]) }],
  }));

  // Update dot when focus changes
  React.useEffect(() => {
    dotOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  const handlePress = useCallback(() => {
    scale.value = withSpring(0.85, Springs.haptic, () => {
      scale.value = withSpring(1, Springs.snappy);
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  if (isScan) {
    return (
      <Pressable onPress={handlePress} style={styles.scanTabWrap}>
        <Animated.View style={[styles.scanBtn, animStyle, isFocused && Shadows.violetGlow]}>
          <LinearGradient
            colors={[Brand.violet, Brand.pink]}
            style={styles.scanBtnGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.scanIcon}>✦</Text>
          </LinearGradient>
        </Animated.View>
        <Text style={styles.scanLabel}>Scan</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress} style={styles.tab}>
      <Animated.View style={[styles.tabInner, animStyle]}>
        {isFocused && (
          <Animated.View style={[styles.activeBackground, dotStyle]}>
            <LinearGradient
              colors={[`${Brand.violet}25`, 'transparent']}
              style={{ flex: 1, borderRadius: BorderRadius.lg }}
            />
          </Animated.View>
        )}

        <Text style={[styles.tabIcon, isFocused && styles.tabIconActive]}>
          {icon}
        </Text>

        <Text
          style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
          numberOfLines={1}
        >
          {label}
        </Text>

        {/* Active dot */}
        <Animated.View style={[styles.activeDot, dotStyle]} />
      </Animated.View>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    width: TAB_BAR_W,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.xl,
  },
  spectrumLine: {
    marginHorizontal: Spacing.xl,
    marginBottom: 0,
  },
  blur: {
    overflow: 'hidden',
    borderRadius: BorderRadius['2xl'],
    borderWidth: 1,
    borderColor: Dark.borderDefault,
  },
  borderHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },

  tab: {
    flex: 1,
    alignItems: 'center',
  },
  tabInner: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    minWidth: 52,
    position: 'relative',
  },
  activeBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: BorderRadius.lg,
  },
  tabIcon: {
    fontSize: 18,
    color: Dark.textMuted,
    lineHeight: 22,
  },
  tabIconActive: {
    color: Brand.violetLight,
  },
  tabLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: Dark.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  tabLabelActive: {
    color: Brand.violetLight,
    fontFamily: FontFamily.sansSemiBold,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Brand.violet,
    marginTop: 2,
  },

  // Scan (center) button
  scanTabWrap: {
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    gap: 3,
  },
  scanBtn: {
    width: 52,
    height: 52,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: -4,
  },
  scanBtnGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanIcon: {
    fontSize: 22,
    color: '#fff',
  },
  scanLabel: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 9,
    color: Brand.violetLight,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
