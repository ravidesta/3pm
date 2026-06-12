// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — OutfitCard
// The hero component: beautiful outfit flat-lay card with score, share button
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Image, Dimensions,
  ViewStyle, Share,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  FadeIn, SlideInDown,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import type { Outfit } from '../types';
import { Dark, Brand, ScoreGradient } from '../theme/colors';
import { FontFamily, TypeScale } from '../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../theme/spacing';
import { Springs } from '../theme/animations';
import { GlassCard } from './GlassCard';
import { SpectrumBar } from './SpectrumBar';

const { width: SW } = Dimensions.get('window');
const CARD_W = SW - 40;
const CARD_H = CARD_W * 1.25;

interface OutfitCardProps {
  outfit: Outfit;
  onPress?: (outfit: Outfit) => void;
  onWear?: (outfit: Outfit) => void;
  onShare?: (outfit: Outfit) => void;
  onRemix?: (outfit: Outfit) => void;
  style?: ViewStyle;
  compact?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit, onPress, onWear, onShare, onRemix, style, compact = false,
}) => {
  const scale = useSharedValue(1);
  const [liked, setLiked] = useState(false);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn  = () => scale.value = withSpring(0.97, Springs.gentle);
  const handlePressOut = () => scale.value = withSpring(1, Springs.snappy);

  const handleWear = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onWear?.(outfit);
  }, [outfit, onWear]);

  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `I built this outfit with Aura Closet — "${outfit.styleNarrative}" 💜\n${outfit.deepLink}`,
      });
      onShare?.(outfit);
    } catch (_) {}
  }, [outfit, onShare]);

  const handleRemix = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemix?.(outfit);
  }, [outfit, onRemix]);

  const handleLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLiked((v) => !v);
  }, []);

  const scoreColors = ScoreGradient(outfit.matchScore);
  const garments = outfit.items;

  const imageItems = garments.slice(0, 4);

  return (
    <Animated.View entering={FadeIn.delay(100)} style={[animStyle, style]}>
      <AnimatedPressable
        onPress={() => onPress?.(outfit)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View
          style={[
            styles.card,
            { width: CARD_W, minHeight: compact ? CARD_H * 0.6 : CARD_H },
            Shadows.xl,
          ]}
        >
          {/* Background gradient from outfit colors */}
          <LinearGradient
            colors={[
              garments[0]?.garment.colors[0]?.hex ?? Dark.bg2,
              garments[1]?.garment.colors[0]?.hex ?? Dark.bg1,
              Dark.bg1,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: BorderRadius['2xl'], opacity: 0.3 }]}
          />

          {/* Dark glass base */}
          <View style={[StyleSheet.absoluteFill, styles.darkBase]} />

          {/* Garment image grid */}
          <View style={styles.imageGrid}>
            {imageItems.length === 0 && (
              <View style={styles.emptyGrid}>
                <Text style={styles.emptyText}>Scanning closet...</Text>
              </View>
            )}
            {imageItems.length === 1 && (
              <GarmentPhoto uri={imageItems[0]!.garment.imageUri} style={styles.imageSingle} />
            )}
            {imageItems.length === 2 && (
              <>
                <GarmentPhoto uri={imageItems[0]!.garment.imageUri} style={styles.imageHalf} />
                <GarmentPhoto uri={imageItems[1]!.garment.imageUri} style={styles.imageHalf} />
              </>
            )}
            {imageItems.length === 3 && (
              <>
                <GarmentPhoto uri={imageItems[0]!.garment.imageUri} style={styles.imageLargeLeft} />
                <View style={styles.columnRight}>
                  <GarmentPhoto uri={imageItems[1]!.garment.imageUri} style={styles.imageSmall} />
                  <GarmentPhoto uri={imageItems[2]!.garment.imageUri} style={styles.imageSmall} />
                </View>
              </>
            )}
            {imageItems.length >= 4 && (
              <View style={styles.gridFour}>
                {imageItems.slice(0, 4).map((item, i) => (
                  <GarmentPhoto key={item.garmentId} uri={item.garment.imageUri} style={styles.imageQuarter} />
                ))}
              </View>
            )}

            {/* Score badge */}
            <View style={styles.scoreBadgeWrap}>
              <LinearGradient
                colors={scoreColors as [string, string]}
                style={styles.scoreBadge}
              >
                <Text style={styles.scoreNum}>{outfit.matchScore.toFixed(1)}</Text>
                <Text style={styles.scoreLabel}>AURA</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Info panel */}
          <View style={styles.info}>
            {/* Spectrum line */}
            <SpectrumBar height={2} style={{ marginBottom: Spacing.sm }} />

            {/* Style name */}
            <Text style={styles.styleName}>{outfit.styleNarrative}</Text>
            <Text style={styles.styleDesc}>{outfit.styleDescription}</Text>

            {/* Color palette strip */}
            <View style={styles.colorStrip}>
              {outfit.items.flatMap((i) => i.garment.colors.slice(0, 1)).slice(0, 6).map((c, idx) => (
                <View
                  key={idx}
                  style={[styles.colorDot, { backgroundColor: c.hex }]}
                />
              ))}
            </View>

            {/* Scores row */}
            <View style={styles.scoresRow}>
              <ScorePill label="Color" value={outfit.colorHarmonyScore} />
              <ScorePill label="Occasion" value={outfit.occasionScore} />
              <ScorePill label="Weather" value={outfit.weatherScore} />
              {outfit.sustainabilityScore && (
                <ScorePill label="Eco" value={outfit.sustainabilityScore} color={Brand.emerald} />
              )}
            </View>

            {/* Upgrade suggestion */}
            {outfit.upgradeSuggestion && (
              <View style={styles.upgradeSuggestion}>
                <Text style={styles.upgradeIcon}>✦</Text>
                <Text style={styles.upgradeText} numberOfLines={1}>
                  Add: {outfit.upgradeSuggestion.description}
                </Text>
              </View>
            )}

            {/* Action row */}
            <View style={styles.actions}>
              <ActionButton icon="✦" label="Wear" onPress={handleWear} primary />
              <ActionButton icon="⟳" label="Remix" onPress={handleRemix} />
              <ActionButton icon="↑" label="Share" onPress={handleShare} />
              <ActionButton
                icon={liked ? '♥' : '♡'}
                label="Save"
                onPress={handleLike}
                color={liked ? Brand.pink : Dark.textTertiary}
              />
            </View>

            {/* Watermark */}
            <Text style={styles.watermark}>styled by Aura ✦</Text>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────

const GarmentPhoto: React.FC<{ uri: string; style?: ViewStyle }> = ({ uri, style }) => (
  <View style={[{ overflow: 'hidden', backgroundColor: Dark.bg3 }, style]}>
    {uri ? (
      <Image source={{ uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
    ) : (
      <LinearGradient colors={[Dark.bg3, Dark.bg4]} style={{ flex: 1 }} />
    )}
  </View>
);

const ScorePill: React.FC<{ label: string; value: number; color?: string }> = ({
  label, value, color = Dark.textTertiary,
}) => (
  <View style={scorePillStyles.wrap}>
    <Text style={[scorePillStyles.value, { color: value >= 7 ? Brand.gold : color }]}>
      {value.toFixed(0)}
    </Text>
    <Text style={scorePillStyles.label}>{label.toUpperCase()}</Text>
  </View>
);

const ActionButton: React.FC<{
  icon: string; label: string; onPress: () => void; primary?: boolean; color?: string;
}> = ({ icon, label, onPress, primary, color }) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.88, Springs.haptic); }}
      onPressOut={() => { scale.value = withSpring(1, Springs.snappy); }}
      style={animStyle}
    >
      <View style={[actionStyles.btn, primary && actionStyles.btnPrimary]}>
        <Text style={[actionStyles.icon, color ? { color } : primary && actionStyles.iconPrimary]}>
          {icon}
        </Text>
        <Text style={[actionStyles.label, primary && actionStyles.labelPrimary]}>{label}</Text>
      </View>
    </AnimatedPressable>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    backgroundColor: Dark.bg2,
    borderWidth: 1,
    borderColor: Dark.borderSubtle,
  },
  darkBase: {
    backgroundColor: 'rgba(10, 12, 28, 0.6)',
    borderRadius: BorderRadius['2xl'],
  },
  imageGrid: {
    height: CARD_W * 0.75,
    position: 'relative',
    overflow: 'hidden',
  },
  emptyGrid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Dark.bg3,
  },
  emptyText: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 14,
    color: Dark.textMuted,
  },
  imageSingle:    { width: '100%', height: '100%' },
  imageHalf:      { width: '50%', height: '100%' },
  imageLargeLeft: { width: '60%', height: '100%' },
  columnRight:    { width: '40%', height: '100%' },
  imageSmall:     { width: '100%', height: '50%' },
  gridFour: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
  },
  imageQuarter: { width: '50%', height: '50%' },
  scoreBadgeWrap: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.goldGlow,
  },
  scoreNum: {
    fontFamily: FontFamily.serifBold,
    fontSize: 20,
    color: '#fff',
    lineHeight: 24,
  },
  scoreLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: 8,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
  info: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
  },
  styleName: {
    fontFamily: FontFamily.serifBold,
    fontSize: 26,
    color: Dark.textPrimary,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  styleDesc: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 13,
    color: Dark.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  colorStrip: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  scoresRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  upgradeSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(197,160,89,0.1)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(197,160,89,0.25)',
  },
  upgradeIcon: { color: '#C5A059', fontSize: 10, marginRight: 6 },
  upgradeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: '#C5A059',
    flex: 1,
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  watermark: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 10,
    color: Dark.textMuted,
    textAlign: 'right',
    marginTop: Spacing.sm,
    letterSpacing: 0.5,
  },
});

const scorePillStyles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 2 },
  value: {
    fontFamily: FontFamily.serifBold,
    fontSize: 16,
    color: Dark.textSecondary,
  },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 8,
    color: Dark.textMuted,
    letterSpacing: 1.5,
  },
});

const actionStyles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Dark.glass1,
    minWidth: 60,
  },
  btnPrimary: {
    backgroundColor: Brand.violet,
    ...Shadows.violetGlow,
  },
  icon: {
    fontSize: 18,
    color: Dark.textSecondary,
  },
  iconPrimary: { color: '#fff' },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: Dark.textTertiary,
    letterSpacing: 0.5,
  },
  labelPrimary: { color: '#fff' },
});
