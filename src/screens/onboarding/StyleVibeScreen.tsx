// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Onboarding Screen 1: Style Vibe
// Visual aesthetic quiz — 8 cards, pick top 3
// Full spectrum background with morphic glass aesthetic cards
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Dimensions,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  FadeIn, FadeInDown, ZoomIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../stores/userStore';
import { AestheticStyles, Brand, Dark, type AestheticStyle } from '../../theme/colors';
import { FontFamily } from '../../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../../theme/spacing';
import { Springs } from '../../theme/animations';
import { AnimatedButton } from '../../components/AnimatedButton';
import { SpectrumBar, SpectrumOrb } from '../../components/SpectrumBar';

const { width: SW, height: SH } = Dimensions.get('window');
const CARD_W = (SW - 48 - 12) / 2;
const AESTHETICS = Object.entries(AestheticStyles) as [AestheticStyle, typeof AestheticStyles[AestheticStyle]][];

const CARD_GRADIENTS: Record<AestheticStyle, [string, string]> = {
  Minimalist:  ['#A78BFA', '#7C3AED'],
  Boho:        ['#6EE7B7', '#10B981'],
  Classic:     ['#FCD34D', '#F59E0B'],
  Streetwear:  ['#FB923C', '#EF4444'],
  Romantic:    ['#F9A8D4', '#EC4899'],
  Edgy:        ['#6B7280', '#1F2937'],
  Preppy:      ['#93C5FD', '#3B82F6'],
  Athleisure:  ['#86EFAC', '#22C55E'],
};

const CARD_DESCRIPTIONS: Record<AestheticStyle, string> = {
  Minimalist:  'Clean lines, intentional pieces',
  Boho:        'Free-flowing, earthy textures',
  Classic:     'Timeless, polished, refined',
  Streetwear:  'Bold, urban, expressive',
  Romantic:    'Soft, feminine, dreamy',
  Edgy:        'Dark, architectural, powerful',
  Preppy:      'Smart, structured, collegiate',
  Athleisure:  'Active, modern, functional',
};

export function StyleVibeScreen({ navigation }: any) {
  const setSelectedAesthetics = useUserStore((s) => s.setSelectedAesthetics);
  const setStep = useUserStore((s) => s.setOnboardingStep);
  const [selected, setSelected] = useState<Set<AestheticStyle>>(new Set());

  const toggleStyle = useCallback((style: AestheticStyle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(style)) {
        next.delete(style);
      } else if (next.size < 3) {
        next.add(style);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    if (selected.size < 1) return;
    setSelectedAesthetics(Array.from(selected));
    setStep(1);
    navigation.navigate('ColorCheck');
  }, [selected, setSelectedAesthetics, setStep, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background atmosphere */}
      <LinearGradient
        colors={['#0F0A1E', '#1A0A3C', '#0F172A']}
        style={StyleSheet.absoluteFill}
      />
      <SpectrumOrb
        size={400}
        style={{ position: 'absolute', top: -100, right: -100, opacity: 0.12 }}
        colors={['#7C3AED', '#EC4899', '#F59E0B']}
      />
      <SpectrumOrb
        size={300}
        style={{ position: 'absolute', bottom: 100, left: -80, opacity: 0.08 }}
        colors={['#10B981', '#3B82F6', '#7C3AED']}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(700)} style={styles.header}>
          <SpectrumBar height={3} style={{ width: 48, marginBottom: Spacing.lg }} />
          <Text style={styles.overline}>STEP 1 OF 3</Text>
          <Text style={styles.headline}>What's your{'\n'}style vibe?</Text>
          <Text style={styles.subline}>
            Choose up to 3 aesthetics that feel like you.
          </Text>
        </Animated.View>

        {/* Selection count */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.countRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.countDot,
                i < selected.size && styles.countDotActive,
              ]}
            />
          ))}
          <Text style={styles.countText}>
            {selected.size === 0 ? 'Pick your vibes' :
             selected.size === 3 ? 'Perfect ✦' : `${3 - selected.size} more to go`}
          </Text>
        </Animated.View>

        {/* Aesthetic cards grid */}
        <View style={styles.grid}>
          {AESTHETICS.map(([key, meta], idx) => (
            <AestheticCard
              key={key}
              aestheticKey={key}
              meta={meta}
              gradient={CARD_GRADIENTS[key]}
              description={CARD_DESCRIPTIONS[key]}
              selected={selected.has(key)}
              onPress={toggleStyle}
              index={idx}
            />
          ))}
        </View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.cta}>
          <AnimatedButton
            label={selected.size === 0 ? 'Select your aesthetic' : 'Continue →'}
            onPress={handleNext}
            disabled={selected.size === 0}
            size="lg"
            fullWidth
            hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
          />
          <Text style={styles.skipText}>
            Your taste shapes everything Aura suggests.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ── Aesthetic Card ─────────────────────────────────────────────────────────

interface AestheticCardProps {
  aestheticKey: AestheticStyle;
  meta: typeof AestheticStyles[AestheticStyle];
  gradient: [string, string];
  description: string;
  selected: boolean;
  onPress: (key: AestheticStyle) => void;
  index: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function AestheticCard({
  aestheticKey, meta, gradient, description, selected, onPress, index,
}: AestheticCardProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(150 + index * 50).springify()}
      style={animStyle}
    >
      <AnimatedPressable
        onPress={() => onPress(aestheticKey)}
        onPressIn={() => { scale.value = withSpring(0.94, Springs.haptic); }}
        onPressOut={() => { scale.value = withSpring(1, Springs.snappy); }}
      >
        <View
          style={[
            cardStyles.card,
            { width: CARD_W },
            selected && cardStyles.selected,
            selected ? Shadows.violetGlow : Shadows.md,
          ]}
        >
          {/* Gradient background */}
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: BorderRadius.xl, opacity: selected ? 0.6 : 0.25 }]}
          />

          {/* Glass overlay */}
          <View style={[StyleSheet.absoluteFill, {
            borderRadius: BorderRadius.xl,
            backgroundColor: selected ? 'rgba(124,58,237,0.08)' : 'rgba(10,8,24,0.5)',
          }]} />

          {/* Border highlight */}
          {selected && (
            <View style={[StyleSheet.absoluteFill, {
              borderRadius: BorderRadius.xl,
              borderWidth: 1.5,
              borderColor: `${gradient[0]}80`,
            }]} />
          )}

          {/* Content */}
          <View style={cardStyles.content}>
            <Text style={cardStyles.emoji}>{meta.emoji}</Text>
            <Text style={cardStyles.label}>{meta.label}</Text>
            <Text style={cardStyles.desc}>{description}</Text>
          </View>

          {/* Selected indicator */}
          {selected && (
            <Animated.View entering={ZoomIn.duration(200)} style={cardStyles.check}>
              <Text style={cardStyles.checkText}>✓</Text>
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
    paddingTop: 70,
    paddingHorizontal: Spacing['3xl'],
    marginBottom: Spacing.xl,
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
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['3xl'],
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  countDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Dark.borderDefault,
  },
  countDotActive: {
    backgroundColor: Brand.violet,
    ...Shadows.violetGlow,
  },
  countText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Dark.textTertiary,
    letterSpacing: 0.5,
    marginLeft: Spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing['2xl'],
    gap: 12,
    justifyContent: 'space-between',
  },
  cta: {
    paddingHorizontal: Spacing['2xl'],
    paddingTop: Spacing['2xl'],
    gap: Spacing.sm,
  },
  skipText: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 13,
    color: Dark.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    height: 140,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Dark.bg3,
    borderWidth: 1,
    borderColor: Dark.borderSubtle,
    position: 'relative',
  },
  selected: {
    borderColor: `${Brand.violet}80`,
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'flex-end',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  label: {
    fontFamily: FontFamily.serifBold,
    fontSize: 17,
    color: Dark.textPrimary,
    lineHeight: 20,
  },
  desc: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: Dark.textSecondary,
    letterSpacing: 0.3,
    marginTop: 2,
  },
  check: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Brand.violet,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: FontFamily.sansBold,
  },
});
