// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Onboarding Screen 3: Values Ranking
// Rank 3 of 6 style values — weights the AI algorithm
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Dimensions, StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, FadeIn, FadeInDown, ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../stores/userStore';
import { Brand, Dark } from '../../theme/colors';
import { FontFamily } from '../../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../../theme/spacing';
import { Springs } from '../../theme/animations';
import { AnimatedButton } from '../../components/AnimatedButton';
import { SpectrumBar, SpectrumOrb } from '../../components/SpectrumBar';
import type { StyleValue } from '../../types';

const VALUES_CONFIG: {
  key: StyleValue;
  label: string;
  description: string;
  emoji: string;
  gradient: [string, string];
}[] = [
  { key: 'polished',    label: 'Looking polished',    description: 'Curated, intentional outfits that signal confidence', emoji: '✦', gradient: ['#C5A059', '#9A7A3A'] },
  { key: 'save-money',  label: 'Saving money',        description: 'Smart rewears, cost-per-wear optimization',           emoji: '◎', gradient: ['#10B981', '#065F46'] },
  { key: 'sustainable', label: 'Being sustainable',   description: 'Circular fashion, conscious choices, low footprint',  emoji: '🌿', gradient: ['#6EE7B7', '#10B981'] },
  { key: 'stand-out',   label: 'Standing out',        description: 'Distinctive style, conversation-starting pieces',     emoji: '⚡', gradient: ['#EC4899', '#BE185D'] },
  { key: 'comfort',     label: 'Comfort first',       description: 'Feel-good fabrics, practical all-day wearability',    emoji: '☁️', gradient: ['#A78BFA', '#7C3AED'] },
  { key: 'trends',      label: 'Following trends',    description: 'Current runway energy, seasonal updates',             emoji: '✺', gradient: ['#FB923C', '#EA580C'] },
];

export function ValuesScreen({ navigation }: any) {
  const { setStyleValues, completeOnboarding } = useUserStore();
  const [selected, setSelected] = useState<StyleValue[]>([]);

  const toggleValue = useCallback((val: StyleValue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      if (prev.includes(val)) {
        return prev.filter((v) => v !== val);
      }
      if (prev.length >= 3) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return prev;
      }
      return [...prev, val];
    });
  }, []);

  const getRank = (val: StyleValue) => {
    const idx = selected.indexOf(val);
    return idx === -1 ? null : idx + 1;
  };

  const handleDone = useCallback(() => {
    setStyleValues(selected);
    completeOnboarding();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.replace('Main');
  }, [selected, setStyleValues, completeOnboarding, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#0F0A1E', '#1A0A3C', '#0A1220']}
        style={StyleSheet.absoluteFill}
      />
      <SpectrumOrb
        size={300}
        style={{ position: 'absolute', bottom: 0, right: -60, opacity: 0.1 }}
        colors={['#10B981', '#7C3AED', '#EC4899']}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <SpectrumBar height={3} style={{ width: 48, marginBottom: Spacing.lg }} />
          <Text style={styles.overline}>STEP 3 OF 3</Text>
          <Text style={styles.headline}>What matters{'\n'}most to you?</Text>
          <Text style={styles.subline}>
            Rank 3 values. Your top picks shape every outfit suggestion.
          </Text>
        </Animated.View>

        {/* Rank display */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.rankRow}>
          {[1, 2, 3].map((rank) => {
            const val = selected[rank - 1];
            const config = val ? VALUES_CONFIG.find((v) => v.key === val) : null;
            return (
              <View key={rank} style={styles.rankSlot}>
                <Text style={styles.rankNum}>#{rank}</Text>
                {config ? (
                  <Animated.View entering={ZoomIn.duration(200)}>
                    <LinearGradient
                      colors={config.gradient}
                      style={styles.rankBadge}
                    >
                      <Text style={styles.rankEmoji}>{config.emoji}</Text>
                    </LinearGradient>
                  </Animated.View>
                ) : (
                  <View style={styles.rankSlotEmpty} />
                )}
              </View>
            );
          })}
        </Animated.View>

        {/* Values list */}
        <View style={styles.list}>
          {VALUES_CONFIG.map((item, idx) => {
            const rank = getRank(item.key);
            const isSelected = rank !== null;

            return (
              <ValueCard
                key={item.key}
                config={item}
                rank={rank}
                isSelected={isSelected}
                onPress={toggleValue}
                index={idx}
              />
            );
          })}
        </View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.cta}>
          <AnimatedButton
            label={selected.length < 3 ? `Select ${3 - selected.length} more` : 'Enter Aura Closet ✦'}
            onPress={handleDone}
            disabled={selected.length === 0}
            size="lg"
            fullWidth
            hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
          />
          <Text style={styles.footerNote}>
            You can always adjust this in your profile.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ── Value Card ─────────────────────────────────────────────────────────────

interface ValueCardProps {
  config: typeof VALUES_CONFIG[number];
  rank: number | null;
  isSelected: boolean;
  onPress: (key: StyleValue) => void;
  index: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ValueCard({ config, rank, isSelected, onPress, index }: ValueCardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 60).springify()}
      style={animStyle}
    >
      <AnimatedPressable
        onPress={() => onPress(config.key)}
        onPressIn={() => { scale.value = withSpring(0.96, Springs.haptic); }}
        onPressOut={() => { scale.value = withSpring(1, Springs.snappy); }}
      >
        <View
          style={[
            valueCardStyles.card,
            isSelected && valueCardStyles.selected,
            isSelected ? Shadows.violetGlow : Shadows.sm,
          ]}
        >
          {/* Left gradient accent */}
          <LinearGradient
            colors={config.gradient}
            style={[valueCardStyles.accent, { opacity: isSelected ? 0.5 : 0.15 }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />

          {/* Content */}
          <View style={valueCardStyles.emojiWrap}>
            <Text style={valueCardStyles.emoji}>{config.emoji}</Text>
          </View>

          <View style={valueCardStyles.text}>
            <Text style={[valueCardStyles.label, isSelected && valueCardStyles.labelSelected]}>
              {config.label}
            </Text>
            <Text style={valueCardStyles.desc}>{config.description}</Text>
          </View>

          {/* Rank badge */}
          {rank && (
            <Animated.View entering={ZoomIn.duration(200)} style={valueCardStyles.rankBadgeWrap}>
              <LinearGradient
                colors={config.gradient}
                style={valueCardStyles.rankBadge}
              >
                <Text style={valueCardStyles.rankText}>#{rank}</Text>
              </LinearGradient>
            </Animated.View>
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A1E' },
  scroll: { paddingBottom: 40 },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing['3xl'],
    marginBottom: Spacing.xl,
  },
  back: { marginBottom: Spacing.xl },
  backText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 14,
    color: Brand.violetLight,
    letterSpacing: 0.3,
  },
  overline: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 10,
    letterSpacing: 3,
    color: Brand.violetLight,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  headline: {
    fontFamily: FontFamily.serifBold,
    fontSize: 42,
    lineHeight: 46,
    color: Dark.textPrimary,
    letterSpacing: -1,
    marginBottom: Spacing.sm,
  },
  subline: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 16,
    color: Dark.textSecondary,
    lineHeight: 24,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing['2xl'],
    marginBottom: Spacing['2xl'],
    paddingHorizontal: Spacing['3xl'],
  },
  rankSlot: { alignItems: 'center', gap: 6 },
  rankNum: {
    fontFamily: FontFamily.sansBold,
    fontSize: 11,
    color: Dark.textMuted,
    letterSpacing: 1,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  rankEmoji: { fontSize: 22 },
  rankSlotEmpty: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Dark.borderDefault,
  },
  list: {
    paddingHorizontal: Spacing['2xl'],
    gap: Spacing.sm,
  },
  cta: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    gap: Spacing.sm,
  },
  footerNote: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 12,
    color: Dark.textMuted,
    textAlign: 'center',
  },
});

const valueCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Dark.bg3,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Dark.borderSubtle,
    overflow: 'hidden',
    minHeight: 72,
  },
  selected: {
    borderColor: `${Brand.violet}60`,
    backgroundColor: `${Brand.violet}08`,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  emojiWrap: {
    width: 52,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 22 },
  text: { flex: 1, paddingVertical: Spacing.md, paddingRight: Spacing.sm },
  label: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 16,
    color: Dark.textSecondary,
    lineHeight: 20,
  },
  labelSelected: { color: Dark.textPrimary },
  desc: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Dark.textMuted,
    lineHeight: 16,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  rankBadgeWrap: {
    paddingRight: Spacing.md,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontFamily: FontFamily.sansBold,
    fontSize: 12,
    color: '#fff',
    letterSpacing: 0.3,
  },
});
