// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Onboarding Screen 2: Color Check
// Selfie-based skin tone analysis → Color Season reveal
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Dimensions,
  StatusBar, ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  FadeIn, FadeInDown, withSequence, withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useUserStore } from '../../stores/userStore';
import { Brand, Dark, ColorSeasons, type ColorSeason } from '../../theme/colors';
import { FontFamily } from '../../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../../theme/spacing';
import { Springs } from '../../theme/animations';
import { AnimatedButton } from '../../components/AnimatedButton';
import { SpectrumBar, SpectrumOrb } from '../../components/SpectrumBar';
import { GlassCard } from '../../components/GlassCard';
import { analyzeSkinTone } from '../../services/gptVision';
import { ShareModal } from '../../components/ShareModal';
import { ColorSeasonShareCard, useColorSeasonCapture } from '../../components/ColorSeasonShareCard';

const { width: SW } = Dimensions.get('window');

type Step = 'intro' | 'capturing' | 'analyzing' | 'result';

export function ColorCheckScreen({ navigation }: any) {
  const { setColorSeason, setOnboardingStep } = useUserStore();
  const [step, setStep] = useState<Step>('intro');
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [season, setSeason] = useState<ColorSeason | null>(null);
  const [undertone, setUndertone] = useState<'warm' | 'cool' | 'neutral' | null>(null);
  const [subSeason, setSubSeason] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const { cardRef: seasonCardRef, capture: captureSeasonCard } = useColorSeasonCapture();

  const progressVal = useSharedValue(0);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progressVal.value * 100}%` }));

  const takeSelfie = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        // Fall back to library
        const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!libPerm.granted) return;
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.85,
          base64: false,
        });
        if (!result.canceled && result.assets[0]) {
          await processImage(result.assets[0].uri);
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        cameraType: ImagePicker.CameraType.front,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (err) {
      console.warn('Camera error:', err);
      // Demo mode — use mock data
      await processImage('mock');
    }
  }, []);

  const processImage = useCallback(async (uri: string) => {
    setSelfieUri(uri);
    setStep('analyzing');

    // Animate progress bar
    progressVal.value = 0;
    progressVal.value = withSequence(
      withTiming(0.3, { duration: 800 }),
      withDelay(200, withTiming(0.7, { duration: 600 })),
      withDelay(200, withTiming(1, { duration: 400 }))
    );

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await analyzeSkinTone(uri === 'mock' ? '' : uri);
      setSeason(result.season);
      setUndertone(result.undertone);
      setSubSeason(result.subSeason);
      setRationale(result.rationale);
      setColorSeason(result.season, result.undertone);
      setStep('result');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      // Fallback
      setSeason('Summer');
      setUndertone('cool');
      setSubSeason('Soft Summer');
      setRationale('Cool, muted tones suit your natural coloring.');
      setColorSeason('Summer', 'cool');
      setStep('result');
    }
  }, [setColorSeason, progressVal]);

  const handleNext = useCallback(() => {
    setOnboardingStep(2);
    navigation.navigate('Values');
  }, [setOnboardingStep, navigation]);

  const handleSkip = useCallback(() => {
    setColorSeason('Summer', 'cool');
    setOnboardingStep(2);
    navigation.navigate('Values');
  }, [setColorSeason, setOnboardingStep, navigation]);

  const currentSeason = season ? ColorSeasons[season] : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#0F0A1E', '#1A0A3C', '#0F172A']}
        style={StyleSheet.absoluteFill}
      />
      <SpectrumOrb
        size={350}
        style={{ position: 'absolute', top: -80, left: -80, opacity: 0.1 }}
        colors={currentSeason
          ? [currentSeason.palette[0] ?? '#7C3AED', currentSeason.palette[4] ?? '#EC4899', currentSeason.palette[8] ?? '#F59E0B']
          : ['#7C3AED', '#EC4899', '#F59E0B']}
      />

      <View style={styles.inner}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(600)} style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <SpectrumBar height={3} style={{ width: 48, marginBottom: Spacing.lg }} />
          <Text style={styles.overline}>STEP 2 OF 3</Text>
          <Text style={styles.headline}>
            {step === 'result' ? `Your color\nseason ✦` : 'Quick color\ncheck'}
          </Text>
          <Text style={styles.subline}>
            {step === 'result'
              ? 'Your personal color palette, personalized to you.'
              : 'Take a selfie and AI will analyze your skin tone.'}
          </Text>
        </Animated.View>

        {/* Content by step */}
        {step === 'intro' && (
          <Animated.View entering={FadeIn.delay(200)} style={styles.introContent}>
            {/* Selfie illustration / prompt */}
            <View style={styles.selfiePrompt}>
              <LinearGradient
                colors={['rgba(124,58,237,0.15)', 'rgba(236,72,153,0.1)']}
                style={styles.selfieCircle}
              >
                <Text style={styles.selfieEmoji}>🤳</Text>
              </LinearGradient>
              <Text style={styles.selfieHint}>
                Stand near natural light{'\n'}for best results.
              </Text>
            </View>

            <AnimatedButton
              label="Take Color Selfie"
              onPress={takeSelfie}
              size="lg"
              fullWidth
              hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
            />

            <Pressable onPress={handleSkip} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip for now →</Text>
            </Pressable>
          </Animated.View>
        )}

        {step === 'analyzing' && (
          <Animated.View entering={FadeIn} style={styles.analyzingContent}>
            <View style={styles.analysisVisual}>
              <LinearGradient
                colors={['#7C3AED', '#EC4899']}
                style={styles.analysisPulse}
              />
              <ActivityIndicator size="large" color={Brand.violetLight} style={{ position: 'absolute' }} />
            </View>

            <Text style={styles.analysisTitle}>Analyzing your coloring…</Text>
            <Text style={styles.analysisSubtitle}>
              Reading undertones, depth, and chroma
            </Text>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <Animated.View style={[styles.progressFill, progressStyle]} />
            </View>

            <Text style={styles.analysisHint}>This takes about 3 seconds.</Text>
          </Animated.View>
        )}

        {step === 'result' && currentSeason && (
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.resultContent}>
            {/* Season hero */}
            <GlassCard
              glowColor={currentSeason.hero}
              variant="violet"
              padding={Spacing['2xl']}
              style={styles.seasonCard}
            >
              <Text style={styles.seasonEmoji}>{currentSeason.emoji}</Text>
              <Text style={styles.seasonLabel}>Your Color Season</Text>
              <Text style={styles.seasonName}>{currentSeason.label}</Text>
              <Text style={styles.subSeasonName}>{subSeason}</Text>
              <Text style={styles.seasonSubLabel}>{currentSeason.subLabel}</Text>

              <Text style={styles.seasonDesc}>{rationale}</Text>
            </GlassCard>

            {/* Palette grid */}
            <View style={styles.paletteSection}>
              <Text style={styles.paletteLabel}>YOUR 12-COLOR PALETTE</Text>
              <View style={styles.paletteGrid}>
                {currentSeason.palette.map((color, i) => (
                  <Animated.View
                    key={i}
                    entering={ZoomInDelay(i * 40)}
                    style={[styles.paletteSwatch, { backgroundColor: color }]}
                  />
                ))}
              </View>
            </View>

            {/* Share your season — viral CTA */}
            <Pressable
              onPress={() => setShowShareModal(true)}
              style={styles.shareSeasonBtn}
            >
              <LinearGradient
                colors={['rgba(124,58,237,0.2)', 'rgba(236,72,153,0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shareSeasonGrad}
              >
                <Text style={styles.shareSeasonEmoji}>✦</Text>
                <View>
                  <Text style={styles.shareSeasonTitle}>Share your color season</Text>
                  <Text style={styles.shareSeasonSub}>Instagram · TikTok · Pinterest</Text>
                </View>
                <Text style={styles.shareSeasonArrow}>↑</Text>
              </LinearGradient>
            </Pressable>

            <AnimatedButton
              label="This is me ✦"
              onPress={handleNext}
              size="lg"
              fullWidth
              hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
            />

            {/* Hidden share card */}
            {season && (
              <ColorSeasonShareCard
                ref={seasonCardRef}
                season={season}
                subSeason={subSeason}
                visible={false}
              />
            )}

            {/* Share modal */}
            <ShareModal
              visible={showShareModal}
              onClose={() => setShowShareModal(false)}
              contentType="color-season"
              seasonName={season ?? undefined}
              onRequestCapture={async () => captureSeasonCard()}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

// Helper for staggered animation
const ZoomInDelay = (delay: number) => {
  const { ZoomIn } = require('react-native-reanimated');
  return ZoomIn.delay(delay);
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0A1E' },
  inner: { flex: 1, paddingBottom: 40 },
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

  // Intro
  introContent: { paddingHorizontal: Spacing['3xl'], gap: Spacing.lg },
  selfiePrompt: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing['3xl'] },
  selfieCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Brand.violet}40`,
    ...Shadows.violetGlow,
  },
  selfieEmoji: { fontSize: 56 },
  selfieHint: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 15,
    color: Dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  skipBtn: { alignItems: 'center', paddingTop: Spacing.sm },
  skipText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Dark.textMuted,
    letterSpacing: 0.3,
  },

  // Analyzing
  analyzingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing.lg,
  },
  analysisVisual: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisPulse: {
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
  },
  analysisTitle: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 22,
    color: Dark.textPrimary,
    textAlign: 'center',
  },
  analysisSubtitle: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 14,
    color: Dark.textSecondary,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: Dark.borderSubtle,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Brand.violet,
    borderRadius: 2,
  },
  analysisHint: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Dark.textMuted,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // Result
  resultContent: { paddingHorizontal: Spacing['2xl'], gap: Spacing.lg },
  seasonCard: { alignItems: 'center' },
  seasonEmoji: { fontSize: 48, marginBottom: Spacing.sm },
  seasonLabel: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 10,
    letterSpacing: 2.5,
    color: Brand.violetLight,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  seasonName: {
    fontFamily: FontFamily.serifBold,
    fontSize: 40,
    color: Dark.textPrimary,
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  subSeasonName: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 18,
    color: Dark.textSecondary,
    marginBottom: 2,
  },
  seasonSubLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Dark.textTertiary,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  seasonDesc: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 14,
    color: Dark.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  paletteSection: { gap: Spacing.sm },
  paletteLabel: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 10,
    letterSpacing: 2,
    color: Dark.textMuted,
    textTransform: 'uppercase',
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paletteSwatch: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    ...Shadows.sm,
  },
  shareSeasonBtn: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.3)',
  },
  shareSeasonGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  shareSeasonEmoji: { fontSize: 24 },
  shareSeasonTitle: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 15,
    color: Dark.textPrimary,
    lineHeight: 19,
  },
  shareSeasonSub: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: Dark.textTertiary,
    letterSpacing: 0.3,
  },
  shareSeasonArrow: {
    marginLeft: 'auto',
    fontSize: 18,
    color: Brand.violetLight,
  },
});
