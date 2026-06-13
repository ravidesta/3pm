// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Today Screen
// Daily outfit generation hub: weather, 3 outfit options, morning ritual
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
  StatusBar, RefreshControl, Platform,
} from 'react-native';
import Animated, {
  FadeIn, FadeInDown, SlideInRight,
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  interpolate, useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../stores/userStore';
import { useClosetStore } from '../../stores/closetStore';
import { useOutfitStore } from '../../stores/outfitStore';
import { generateOutfits } from '../../services/outfitGenerator';
import { getCurrentWeather, getLayeringAdvice } from '../../services/weatherService';
import { Brand, Dark, AuraSpectrum } from '../../theme/colors';
import { FontFamily } from '../../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../../theme/spacing';
import { OutfitCard } from '../../components/OutfitCard';
import { SpectrumBar, SpectrumOrb } from '../../components/SpectrumBar';
import { GlassCard } from '../../components/GlassCard';
import { OutfitCardSkeleton } from '../../components/SkeletonLoader';
import { AnimatedButton } from '../../components/AnimatedButton';
import type { Outfit } from '../../types';

const { width: SW, height: SH } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const GREETING = (): string => {
  const h = new Date().getHours();
  if (h < 5)  return 'Still up?';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
};

const DATE_FORMATTED = (): string => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
};

export function TodayScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const profile = useUserStore((s) => s.profile);
  const { garments } = useClosetStore();
  const { todaysOutfits, setTodaysOutfits, weather, setWeather, isGenerating, setGenerating,
          setSelectedOutfit, recordOutfitWorn, incrementShareCount } = useOutfitStore();

  const [refreshing, setRefreshing] = useState(false);
  const [activeOutfitIndex, setActiveOutfitIndex] = useState(0);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 100], [1, 0.6]),
    transform: [{ translateY: interpolate(scrollY.value, [0, 100], [0, -20]) }],
  }));

  useEffect(() => {
    loadData();
  }, [garments.length]);

  const loadData = useCallback(async () => {
    if (!profile) return;

    // Fetch weather
    try {
      const w = await getCurrentWeather(40.7128, -74.0060); // NYC default
      setWeather(w);
    } catch (_) {}

    // Generate outfits if needed
    if (todaysOutfits.length === 0 && garments.length >= 2) {
      generateForToday();
    }
  }, [profile, garments, todaysOutfits]);

  const generateForToday = useCallback(async () => {
    if (!profile || garments.length < 2) return;
    setGenerating(true);
    try {
      const outfits = generateOutfits({
        garments,
        user: profile,
        weather: weather ?? undefined,
        count: 3,
      });
      setTodaysOutfits(outfits);
    } finally {
      setGenerating(false);
    }
  }, [profile, garments, weather, setTodaysOutfits, setGenerating]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await generateForToday();
    setRefreshing(false);
  }, [generateForToday]);

  const handleRemix = useCallback((outfit: Outfit) => {
    if (!profile) return;
    const usedIds = new Set(outfit.items.map((i) => i.garmentId));
    const remixed = generateOutfits({
      garments: garments.filter((g) => !usedIds.has(g.id)),
      user: profile,
      weather: weather ?? undefined,
      count: 1,
    });
    if (remixed.length > 0) {
      const updated = [...todaysOutfits];
      updated[activeOutfitIndex] = remixed[0]!;
      setTodaysOutfits(updated);
    }
  }, [profile, garments, weather, todaysOutfits, activeOutfitIndex, setTodaysOutfits]);

  const handleWear = useCallback((outfit: Outfit) => {
    recordOutfitWorn(outfit.id);
    outfit.items.forEach((item) => {
      useClosetStore.getState().recordWear(item.garmentId);
    });
    // Navigate to detail or show confirmation
  }, [recordOutfitWorn]);

  const hasCloset = garments.length >= 2;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Atmospheric background */}
      <LinearGradient
        colors={['#060B14', '#0A1220', '#0F172A']}
        style={StyleSheet.absoluteFill}
      />
      <SpectrumOrb
        size={500}
        style={{ position: 'absolute', top: -150, right: -150, opacity: 0.07 }}
        colors={['#7C3AED', '#EC4899', '#F59E0B']}
      />
      <SpectrumOrb
        size={400}
        style={{ position: 'absolute', bottom: -100, left: -100, opacity: 0.06 }}
        colors={['#10B981', '#3B82F6', '#7C3AED']}
      />

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Brand.violetLight}
          />
        }
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          {/* Spectrum accent */}
          <SpectrumBar height={2} style={{ width: 40, marginBottom: Spacing.lg, opacity: 0.8 }} />

          <Text style={styles.greeting}>{GREETING()}</Text>
          <Text style={styles.date}>{DATE_FORMATTED()}</Text>

          {/* Weather pill */}
          {weather && (
            <Animated.View entering={FadeIn.delay(300)}>
              <GlassCard
                variant="dark"
                padding={Spacing.sm}
                style={styles.weatherPill}
                intensity={30}
              >
                <View style={styles.weatherInner}>
                  <Text style={styles.weatherIcon}>{weather.icon}</Text>
                  <View>
                    <Text style={styles.weatherTemp}>{weather.temperature}°C</Text>
                    <Text style={styles.weatherCondition}>{weather.condition}</Text>
                  </View>
                  <View style={styles.weatherDivider} />
                  <View>
                    <Text style={styles.layeringLabel}>LAYERING</Text>
                    <Text style={styles.layeringValue}>
                      {getLayeringAdvice(weather.temperature)}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          )}
        </Animated.View>

        {/* Section: Today's Outfits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>TODAY'S OUTFITS</Text>
            {todaysOutfits.length > 0 && (
              <Text style={styles.sectionCount}>{todaysOutfits.length} options</Text>
            )}
          </View>

          {!hasCloset ? (
            <EmptyClosetPrompt onScan={() => navigation.navigate('Scan')} />
          ) : isGenerating ? (
            <>
              <OutfitCardSkeleton />
              <OutfitCardSkeleton />
            </>
          ) : todaysOutfits.length === 0 ? (
            <GeneratePrompt onGenerate={generateForToday} />
          ) : (
            todaysOutfits.map((outfit, i) => (
              <Animated.View
                key={outfit.id}
                entering={SlideInRight.delay(i * 100).springify()}
              >
                <OutfitCard
                  outfit={outfit}
                  onPress={setSelectedOutfit}
                  onWear={handleWear}
                  onShare={(o) => incrementShareCount(o.id)}
                  onRemix={handleRemix}
                  style={styles.outfitCard}
                />
              </Animated.View>
            ))
          )}
        </View>

        {/* Quick stats row */}
        {garments.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400)} style={styles.quickStats}>
            <QuickStat label="In Closet" value={String(garments.length)} emoji="👗" />
            <QuickStat
              label="Unworn 30d"
              value={String(
                useClosetStore.getState().getClosetStats().unwornIn30Days.length
              )}
              emoji="💤"
            />
            <QuickStat
              label="Outfits Possible"
              value={String(
                useClosetStore.getState().getClosetStats().outfitsPossible
              )}
              emoji="✦"
            />
          </Animated.View>
        )}

        <View style={{ height: 100 }} />
      </AnimatedScrollView>
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

const EmptyClosetPrompt = ({ onScan }: { onScan: () => void }) => (
  <Animated.View entering={FadeIn.delay(200)}>
    <GlassCard variant="violet" padding={Spacing['3xl']} style={styles.emptyCard}>
      <Text style={styles.emptyEmoji}>👗</Text>
      <Text style={styles.emptyTitle}>Your closet is waiting</Text>
      <Text style={styles.emptyDesc}>
        Scan your first garment to unlock AI outfit generation.
      </Text>
      <AnimatedButton
        label="Scan your first item →"
        onPress={onScan}
        variant="primary"
        size="md"
        style={{ marginTop: Spacing.lg }}
      />
    </GlassCard>
  </Animated.View>
);

const GeneratePrompt = ({ onGenerate }: { onGenerate: () => void }) => (
  <Animated.View entering={FadeIn.delay(200)}>
    <GlassCard variant="dark" padding={Spacing['2xl']} style={styles.emptyCard}>
      <Text style={styles.emptyEmoji}>✦</Text>
      <Text style={styles.emptyTitle}>Ready to dress you</Text>
      <AnimatedButton
        label="Generate Today's Outfits"
        onPress={onGenerate}
        variant="primary"
        size="md"
        style={{ marginTop: Spacing.md }}
      />
    </GlassCard>
  </Animated.View>
);

const QuickStat = ({ label, value, emoji }: { label: string; value: string; emoji: string }) => (
  <View style={quickStatStyles.wrap}>
    <Text style={quickStatStyles.emoji}>{emoji}</Text>
    <Text style={quickStatStyles.value}>{value}</Text>
    <Text style={quickStatStyles.label}>{label.toUpperCase()}</Text>
  </View>
);

const quickStatStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Dark.glass1,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Dark.borderSubtle,
  },
  emoji: { fontSize: 20, marginBottom: 4 },
  value: {
    fontFamily: FontFamily.serifBold,
    fontSize: 24,
    color: Dark.textPrimary,
    lineHeight: 28,
  },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: Dark.textMuted,
    letterSpacing: 1.5,
    marginTop: 2,
  },
});

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060B14' },
  scroll: { paddingBottom: 40 },

  header: {
    paddingHorizontal: Spacing['2xl'],
    marginBottom: Spacing['2xl'],
  },
  greeting: {
    fontFamily: FontFamily.serifBold,
    fontSize: 44,
    color: Dark.textPrimary,
    lineHeight: 48,
    letterSpacing: -1,
  },
  date: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 15,
    color: Dark.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  weatherPill: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.xl,
  },
  weatherInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  weatherIcon: { fontSize: 24 },
  weatherTemp: {
    fontFamily: FontFamily.serifBold,
    fontSize: 16,
    color: Dark.textPrimary,
    lineHeight: 20,
  },
  weatherCondition: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: Dark.textTertiary,
    letterSpacing: 0.5,
  },
  weatherDivider: {
    width: 1,
    height: 30,
    backgroundColor: Dark.borderSubtle,
  },
  layeringLabel: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 8,
    color: Dark.textMuted,
    letterSpacing: 2,
  },
  layeringValue: {
    fontFamily: FontFamily.serifMedium,
    fontSize: 13,
    color: Dark.textSecondary,
  },

  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 10,
    color: Dark.textMuted,
    letterSpacing: 2.5,
  },
  sectionCount: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Brand.violetLight,
    letterSpacing: 0.5,
  },
  outfitCard: { marginBottom: Spacing.lg },

  emptyCard: { alignItems: 'center', gap: Spacing.sm },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: {
    fontFamily: FontFamily.serifBold,
    fontSize: 22,
    color: Dark.textPrimary,
    textAlign: 'center',
  },
  emptyDesc: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 14,
    color: Dark.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },

  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
});
