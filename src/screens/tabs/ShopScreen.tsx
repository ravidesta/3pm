// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Shop Screen (Wardrobe Stats + Upgrade Suggestions)
// Analytics dashboard + curated upgrade suggestions
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions,
  StatusBar, Pressable,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useClosetStore } from '../../stores/closetStore';
import { useOutfitStore } from '../../stores/outfitStore';
import { useUserStore } from '../../stores/userStore';
import { Brand, Dark, AuraSpectrum } from '../../theme/colors';
import { FontFamily } from '../../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../../theme/spacing';
import { GlassCard } from '../../components/GlassCard';
import { SpectrumBar, SpectrumOrb } from '../../components/SpectrumBar';
import { AnimatedButton } from '../../components/AnimatedButton';
import { ShareModal } from '../../components/ShareModal';
import { ClosetStatsShareCard, useClosetStatsCapture } from '../../components/ClosetStatsShareCard';

const { width: SW } = Dimensions.get('window');
const BAR_MAX_W = SW - 120;

export function ShopScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { garments, getClosetStats } = useClosetStore();
  const { outfits } = useOutfitStore();
  const profile = useUserStore((s) => s.profile);

  const [showShareModal, setShowShareModal] = useState(false);
  const { cardRef: statsCardRef, capture: captureStatsCard } = useClosetStatsCapture();

  const stats = useMemo(() => getClosetStats(), [garments]);

  const totalShares = useMemo(
    () => outfits.reduce((sum, o) => sum + o.shareCount, 0),
    [outfits]
  );

  const totalWears = useMemo(
    () => garments.reduce((sum, g) => sum + g.wearCount, 0),
    [garments]
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#060B14', '#0A1220', '#0F172A']}
        style={StyleSheet.absoluteFill}
      />
      <SpectrumOrb
        size={350}
        style={{ position: 'absolute', top: 200, right: -100, opacity: 0.07 }}
        colors={['#F59E0B', '#EC4899', '#7C3AED']}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20 }]}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <SpectrumBar height={2} style={{ width: 40, marginBottom: Spacing.md }} />
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Wardrobe Stats</Text>
              <Text style={styles.subtitle}>
                Your closet, quantified. Make every item earn its place.
              </Text>
            </View>
            {stats.totalItems > 0 && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowShareModal(true);
                }}
                style={styles.shareStatsBtn}
              >
                <LinearGradient
                  colors={[Brand.violet, Brand.pink]}
                  style={styles.shareStatsBtnGrad}
                >
                  <Text style={styles.shareStatsBtnText}>↑ Share</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Hero stats */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.heroStats}>
          <StatCard
            label="Total Items"
            value={stats.totalItems}
            emoji="👗"
            color={Brand.violet}
          />
          <StatCard
            label="Outfits Possible"
            value={stats.outfitsPossible}
            emoji="✦"
            color={Brand.pink}
          />
          <StatCard
            label="Total Wears"
            value={totalWears}
            emoji="🌟"
            color={Brand.amber}
          />
          {totalShares > 0 && (
            <StatCard
              label="Outfit Shares"
              value={totalShares}
              emoji="↑"
              color={Brand.emerald}
            />
          )}
        </Animated.View>

        {/* Cost per wear */}
        {stats.totalValue != null && stats.totalValue > 0 && (
          <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
            <GlassCard glowColor={Brand.gold} variant="dark" padding={Spacing.xl}>
              <Text style={styles.sectionLabel}>COST INTELLIGENCE</Text>
              <View style={styles.cpwRow}>
                <View>
                  <Text style={styles.cpwValue}>${stats.totalValue?.toFixed(0)}</Text>
                  <Text style={styles.cpwLabel}>Total Closet Value</Text>
                </View>
                <View style={styles.cpwDivider} />
                <View>
                  <Text style={[styles.cpwValue, { color: Brand.gold }]}>
                    ${totalWears > 0 ? ((stats.totalValue ?? 0) / totalWears).toFixed(2) : '–'}
                  </Text>
                  <Text style={styles.cpwLabel}>Avg Cost-per-Wear</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Unworn items nudge */}
        {stats.unwornIn30Days.length > 0 && (
          <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
            <GlassCard variant="dark" glowColor={Brand.amber} padding={Spacing.xl}>
              <View style={styles.nudgeRow}>
                <Text style={styles.nudgeEmoji}>💤</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nudgeTitle}>
                    {stats.unwornIn30Days.length} items haven't been worn in 30+ days
                  </Text>
                  <Text style={styles.nudgeDesc}>
                    Remix them into today's looks or consider passing them on.
                  </Text>
                </View>
              </View>
              <AnimatedButton
                label="View unworn items →"
                onPress={() => {
                  useClosetStore.getState().setActiveCategory('all');
                  navigation.navigate('Closet');
                }}
                variant="ghost"
                size="sm"
                style={{ marginTop: Spacing.md }}
              />
            </GlassCard>
          </Animated.View>
        )}

        {/* Category breakdown */}
        {stats.totalItems > 0 && (
          <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
            <Text style={styles.sectionLabel}>CATEGORY BREAKDOWN</Text>
            <GlassCard variant="dark" padding={Spacing.xl}>
              {Object.entries(stats.itemsByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => (
                  <CategoryBar
                    key={cat}
                    label={cat}
                    count={count as number}
                    total={stats.totalItems}
                  />
                ))}
            </GlassCard>
          </Animated.View>
        )}

        {/* Color distribution */}
        {stats.colorDistribution.length > 0 && (
          <Animated.View entering={FadeInDown.delay(350)} style={styles.section}>
            <Text style={styles.sectionLabel}>COLOR PALETTE IN YOUR CLOSET</Text>
            <GlassCard variant="dark" padding={Spacing.xl}>
              <View style={styles.colorPaletteRow}>
                {stats.colorDistribution.slice(0, 10).map((c, i) => (
                  <View key={i} style={styles.colorBlock}>
                    <View
                      style={[
                        styles.colorBlockSwatch,
                        { backgroundColor: c.color, height: 40 + (c.percentage / 100) * 40 },
                      ]}
                    />
                    <Text style={styles.colorBlockPct}>{c.percentage}%</Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Upgrade suggestions */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <Text style={styles.sectionLabel}>UPGRADE OPPORTUNITIES</Text>
          <GlassCard glowColor={Brand.gold} variant="dark" padding={Spacing.xl}>
            <Text style={styles.upgradeIntro}>
              Items that would expand your outfit count significantly:
            </Text>
            {getUpgradeSuggestions(stats).map((sug, i) => (
              <View key={i} style={styles.upgradeSug}>
                <View style={styles.upgradeDot} />
                <View>
                  <Text style={styles.sugTitle}>{sug.title}</Text>
                  <Text style={styles.sugDesc}>{sug.desc}</Text>
                </View>
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Hidden stats card + share modal */}
      {stats.totalItems > 0 && (
        <ClosetStatsShareCard
          ref={statsCardRef}
          stats={stats}
          outfitCount={outfits.length}
          topSeason={profile?.colorSeason}
          visible={false}
        />
      )}
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        contentType="closet-stats"
        seasonName={profile?.colorSeason}
        onRequestCapture={captureStatsCard}
      />
    </View>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getUpgradeSuggestions(stats: any) {
  const suggestions = [];
  const by = stats.itemsByCategory ?? {};

  if (!by['outerwear'] || by['outerwear'] < 2) {
    suggestions.push({
      title: 'Add a classic coat',
      desc: 'A camel or black trench coat is the single highest-leverage purchase for most wardrobes.',
    });
  }
  if (!by['shoes'] || by['shoes'] < 3) {
    suggestions.push({
      title: 'Diversify footwear',
      desc: 'A neutral heel, a clean sneaker, and a loafer cover 90% of occasions.',
    });
  }
  if (!by['bags'] || by['bags'] < 2) {
    suggestions.push({
      title: 'A structured bag',
      desc: 'A quality leather tote or crossbody elevates every outfit it touches.',
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      title: 'Your closet is well-rounded',
      desc: 'Focus on quality rewears. Every piece already in your closet has value.',
    });
  }
  return suggestions.slice(0, 3);
}

// ── Sub-components ─────────────────────────────────────────────────────────

const StatCard = ({ label, value, emoji, color }: {
  label: string; value: number; emoji: string; color: string;
}) => (
  <View style={[statCardStyles.card, { borderColor: `${color}30` }]}>
    <LinearGradient
      colors={[`${color}18`, 'transparent']}
      style={StyleSheet.absoluteFill}
    />
    <Text style={statCardStyles.emoji}>{emoji}</Text>
    <Text style={[statCardStyles.value, { color }]}>{value}</Text>
    <Text style={statCardStyles.label}>{label.toUpperCase()}</Text>
  </View>
);

const CategoryBar = ({ label, count, total }: { label: string; count: number; total: number }) => {
  const pct = total > 0 ? count / total : 0;
  return (
    <View style={catBarStyles.row}>
      <Text style={catBarStyles.label}>{label}</Text>
      <View style={catBarStyles.track}>
        <View style={[catBarStyles.fill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={catBarStyles.count}>{count}</Text>
    </View>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060B14' },
  scroll: { paddingBottom: 40 },
  header: { paddingHorizontal: Spacing['2xl'], marginBottom: Spacing['2xl'] },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
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
    maxWidth: '80%',
  },
  shareStatsBtn: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginTop: 8,
  },
  shareStatsBtnGrad: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  shareStatsBtnText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 12,
    color: '#fff',
    letterSpacing: 0.5,
  },
  heroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 10,
    color: Dark.textMuted,
    letterSpacing: 2.5,
    marginBottom: Spacing.md,
  },

  cpwRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing['2xl'] },
  cpwValue: {
    fontFamily: FontFamily.serifBold,
    fontSize: 28,
    color: Dark.textPrimary,
    lineHeight: 32,
  },
  cpwLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: Dark.textMuted,
    letterSpacing: 0.5,
  },
  cpwDivider: { width: 1, height: 40, backgroundColor: Dark.borderDefault },

  nudgeRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start' },
  nudgeEmoji: { fontSize: 28 },
  nudgeTitle: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 15,
    color: Dark.textPrimary,
    lineHeight: 20,
  },
  nudgeDesc: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 13,
    color: Dark.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },

  colorPaletteRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 90,
  },
  colorBlock: { flex: 1, alignItems: 'center', gap: 4 },
  colorBlockSwatch: { width: '100%', borderRadius: 6, minHeight: 20 },
  colorBlockPct: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 8,
    color: Dark.textMuted,
    letterSpacing: 0.5,
  },

  upgradeIntro: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 14,
    color: Dark.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  upgradeSug: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  upgradeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Brand.gold,
    marginTop: 6,
  },
  sugTitle: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 14,
    color: Brand.goldLight,
    lineHeight: 18,
  },
  sugDesc: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Dark.textMuted,
    lineHeight: 16,
    marginTop: 2,
    maxWidth: SW - 120,
  },
});

const statCardStyles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: (SW - 48 - 8) / 2,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: Dark.bg3,
    gap: 4,
  },
  emoji: { fontSize: 22 },
  value: {
    fontFamily: FontFamily.serifBold,
    fontSize: 32,
    lineHeight: 36,
  },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: Dark.textMuted,
    letterSpacing: 1.5,
  },
});

const catBarStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Dark.textSecondary,
    width: 80,
    letterSpacing: 0.3,
    textTransform: 'capitalize',
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: Dark.glass1,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Brand.violet,
    borderRadius: 3,
  },
  count: {
    fontFamily: FontFamily.sansBold,
    fontSize: 11,
    color: Dark.textTertiary,
    width: 24,
    textAlign: 'right',
  },
});
