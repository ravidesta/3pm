// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Style Screen
// On-demand outfit generator with occasion/weather filters
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  StatusBar, Dimensions,
} from 'react-native';
import Animated, {
  FadeIn, FadeInDown, SlideInRight, useSharedValue,
  useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../stores/userStore';
import { useClosetStore } from '../../stores/closetStore';
import { useOutfitStore } from '../../stores/outfitStore';
import { generateOutfits } from '../../services/outfitGenerator';
import { Brand, Dark } from '../../theme/colors';
import { FontFamily } from '../../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../../theme/spacing';
import { Springs } from '../../theme/animations';
import { OutfitCard } from '../../components/OutfitCard';
import { SpectrumBar, SpectrumOrb } from '../../components/SpectrumBar';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedButton } from '../../components/AnimatedButton';
import { OutfitCardSkeleton } from '../../components/SkeletonLoader';
import type { GarmentOccasion, Outfit } from '../../types';

const OCCASIONS: { key: GarmentOccasion | 'any'; label: string; emoji: string }[] = [
  { key: 'any',       label: 'Surprise me',   emoji: '✦' },
  { key: 'casual',    label: 'Casual day',    emoji: '☁️' },
  { key: 'work',      label: 'Work',          emoji: '💼' },
  { key: 'date-night',label: 'Date night',    emoji: '🌙' },
  { key: 'weekend',   label: 'Weekend',       emoji: '🌿' },
  { key: 'formal',    label: 'Formal',        emoji: '✺' },
  { key: 'active',    label: 'Active',        emoji: '⚡' },
];

export function StyleScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const profile = useUserStore((s) => s.profile);
  const { garments } = useClosetStore();
  const { weather, isGenerating, setGenerating, setTodaysOutfits } = useOutfitStore();

  const [selectedOccasion, setSelectedOccasion] = useState<GarmentOccasion | 'any'>('any');
  const [generatedOutfits, setGeneratedOutfits] = useState<Outfit[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generate = useCallback(async () => {
    if (!profile || garments.length < 2) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGenerating(true);
    setHasGenerated(false);

    // Small delay for UX
    await new Promise((r) => setTimeout(r, 600));

    try {
      const outfits = generateOutfits({
        garments,
        user: profile,
        weather: weather ?? undefined,
        occasion: selectedOccasion === 'any' ? undefined : selectedOccasion,
        count: 5,
      });
      setGeneratedOutfits(outfits);
      setHasGenerated(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setGenerating(false);
    }
  }, [profile, garments, weather, selectedOccasion, setGenerating]);

  const handleRemix = useCallback((outfit: Outfit) => {
    if (!profile) return;
    const usedIds = new Set(outfit.items.map((i) => i.garmentId));
    const remixed = generateOutfits({
      garments: garments.filter((g) => !usedIds.has(g.id)),
      user: profile,
      weather: weather ?? undefined,
      occasion: selectedOccasion === 'any' ? undefined : selectedOccasion,
      count: 1,
    });
    if (remixed.length > 0) {
      setGeneratedOutfits((prev) =>
        prev.map((o) => (o.id === outfit.id ? remixed[0]! : o))
      );
    }
  }, [profile, garments, weather, selectedOccasion]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#060B14', '#0A1220', '#0F172A']}
        style={StyleSheet.absoluteFill}
      />
      <SpectrumOrb
        size={400}
        style={{ position: 'absolute', top: -80, left: -100, opacity: 0.07 }}
        colors={['#EC4899', '#7C3AED', '#10B981']}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20 }]}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <SpectrumBar height={2} style={{ width: 40, marginBottom: Spacing.md }} />
          <Text style={styles.title}>Style Generator</Text>
          <Text style={styles.subtitle}>
            Generate outfit options from your closet for any occasion.
          </Text>
        </Animated.View>

        {/* Occasion selector */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.occasionSection}>
          <Text style={styles.sectionLabel}>OCCASION</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.occasionList}
          >
            {OCCASIONS.map((occ) => (
              <OccasionChip
              key={occ.key}
              emoji={occ.emoji}
              label={occ.label}
              active={selectedOccasion === occ.key}
              onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedOccasion(occ.key);
                }}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Closet check */}
        {garments.length < 2 && (
          <Animated.View entering={FadeIn.delay(300)} style={styles.section}>
            <GlassCard variant="dark" padding={Spacing['2xl']} style={styles.noticeCard}>
              <Text style={styles.noticeEmoji}>👗</Text>
              <Text style={styles.noticeTitle}>Scan at least 2 items first</Text>
              <AnimatedButton
                label="Go to Scanner →"
                onPress={() => navigation.navigate('Scan')}
                size="md"
                variant="secondary"
                style={{ marginTop: Spacing.md }}
              />
            </GlassCard>
          </Animated.View>
        )}

        {/* Generate button */}
        {garments.length >= 2 && (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.generateSection}>
            <AnimatedButton
              label={isGenerating ? 'Curating your look…' : '✦ Generate Outfits'}
              onPress={generate}
              loading={isGenerating}
              size="lg"
              fullWidth
              hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
            />

            {!hasGenerated && (
              <Text style={styles.generateHint}>
                Aura reads your closet, weather, and taste to build your looks.
              </Text>
            )}
          </Animated.View>
        )}

        {/* Generated outfits */}
        {isGenerating && (
          <View style={styles.section}>
            <OutfitCardSkeleton />
            <OutfitCardSkeleton />
          </View>
        )}

        {hasGenerated && !isGenerating && (
          <View style={styles.section}>
            <View style={styles.resultsHeader}>
              <Text style={styles.sectionLabel}>
                {generatedOutfits.length} LOOKS CURATED
              </Text>
              <Text style={styles.resultsSubtitle}>Sorted by Aura score</Text>
            </View>

            {generatedOutfits.map((outfit, i) => (
              <Animated.View
                key={outfit.id}
                entering={SlideInRight.delay(i * 80).springify()}
              >
                <OutfitCard
                  outfit={outfit}
                  onPress={(o) => navigation.navigate('OutfitDetail', { outfitId: o.id })}
                  onRemix={handleRemix}
                  style={styles.outfitCard}
                />
              </Animated.View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ── OccasionChip ────────────────────────────────────────────────────────────

function OccasionChip({
  emoji, label, active, onPress,
}: { emoji: string; label: string; active: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.93, Springs.haptic); }}
        onPressOut={() => { scale.value = withSpring(1, Springs.snappy); }}
      >
        <View style={[chipStyles.chip, active && chipStyles.chipActive, active && Shadows.violetGlow]}>
          {active && (
            <LinearGradient
              colors={[Brand.violet, Brand.violetDark]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}
          <Text style={chipStyles.emoji}>{emoji}</Text>
          <Text style={[chipStyles.label, active && chipStyles.labelActive]}>{label}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060B14' },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: Spacing['2xl'], marginBottom: Spacing['2xl'] },
  title: {
    fontFamily: FontFamily.serifBold,
    fontSize: 38,
    color: Dark.textPrimary,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 15,
    color: Dark.textSecondary,
    marginTop: 4,
    lineHeight: 22,
  },

  occasionSection: { marginBottom: Spacing['2xl'] },
  sectionLabel: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 10,
    color: Dark.textMuted,
    letterSpacing: 2.5,
    paddingHorizontal: Spacing['2xl'],
    marginBottom: Spacing.md,
  },
  occasionList: { paddingHorizontal: Spacing['2xl'], gap: 8 },

  section: { paddingHorizontal: Spacing.xl, marginBottom: Spacing.xl },
  noticeCard: { alignItems: 'center', gap: Spacing.sm },
  noticeEmoji: { fontSize: 40 },
  noticeTitle: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 18,
    color: Dark.textPrimary,
    textAlign: 'center',
  },

  generateSection: {
    paddingHorizontal: Spacing['2xl'],
    marginBottom: Spacing['2xl'],
    gap: Spacing.sm,
  },
  generateHint: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 13,
    color: Dark.textMuted,
    textAlign: 'center',
  },

  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  resultsSubtitle: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Brand.violetLight,
    letterSpacing: 0.3,
  },
  outfitCard: { marginBottom: Spacing.lg },
});

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    gap: 6,
    backgroundColor: Dark.bg3,
    borderWidth: 1,
    borderColor: Dark.borderSubtle,
    overflow: 'hidden',
    minHeight: 40,
  },
  chipActive: { borderColor: 'transparent' },
  emoji: { fontSize: 14 },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Dark.textTertiary,
    letterSpacing: 0.3,
  },
  labelActive: { color: '#fff', fontFamily: FontFamily.sansSemiBold },
});
