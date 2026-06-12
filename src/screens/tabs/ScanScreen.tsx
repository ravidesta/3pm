// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Scan Screen
// Camera-based garment digitizer with AI processing pipeline
// Morphic glass scan viewfinder, real-time AI feedback
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Dimensions,
  StatusBar, ScrollView, Alert, TextInput,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withSpring, FadeIn, FadeInDown, FadeOut, SlideInUp,
  interpolate, Easing,
} from 'react-native-reanimated';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useClosetStore } from '../../stores/closetStore';
import { analyzeGarment } from '../../services/gptVision';
import { Brand, Dark } from '../../theme/colors';
import { FontFamily } from '../../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../../theme/spacing';
import { Springs } from '../../theme/animations';
import { SpectrumBar } from '../../components/SpectrumBar';
import { AnimatedButton } from '../../components/AnimatedButton';
import { GlassCard } from '../../components/GlassCard';
import type { Garment, GarmentCategory } from '../../types';

const { width: SW, height: SH } = Dimensions.get('window');
const VIEWFINDER_SIZE = SW - 80;

type ScanStep = 'camera' | 'processing' | 'result' | 'edit';

export function ScanScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { addGarment } = useClosetStore();

  const [step, setStep] = useState<ScanStep>('camera');
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [editedName, setEditedName] = useState('');
  const [editedCategory, setEditedCategory] = useState<GarmentCategory>('tops');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  // Scanning ring animation
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.6);
  const cornerPulse = useSharedValue(0);

  useEffect(() => {
    ringScale.value = withRepeat(
      withTiming(1.04, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
    cornerPulse.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      -1, true
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const cornerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(cornerPulse.value, [0, 1], [0.4, 1]),
  }));

  const capture = useCallback(async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    ringOpacity.value = withTiming(0, { duration: 100 }, () => {
      ringOpacity.value = withTiming(0.6, { duration: 300 });
    });

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: false,
        skipProcessing: false,
      });
      if (photo?.uri) {
        await processImage(photo.uri);
      }
    } catch (err) {
      Alert.alert('Capture failed', 'Please try again.');
    }
  }, []);

  const pickFromLibrary = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  }, []);

  const processImage = useCallback(async (uri: string) => {
    setCapturedUri(uri);
    setStep('processing');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await analyzeGarment(uri);
      setAnalysisResult(result);
      setEditedName(result.name);
      setEditedCategory(result.category);
      setEditedTags(result.tags);
      setStep('result');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      Alert.alert('Analysis failed', 'Could not analyze this garment. Please try again.');
      setStep('camera');
    }
  }, []);

  const saveGarment = useCallback(() => {
    if (!capturedUri || !analysisResult) return;

    const garment: Garment = {
      id: `garment_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: 'user_local',
      imageUri: capturedUri,
      category: editedCategory,
      name: editedName || analysisResult.name,
      colors: analysisResult.colors,
      pattern: analysisResult.pattern,
      material: analysisResult.material,
      formality: analysisResult.formality,
      seasons: analysisResult.seasons,
      occasions: analysisResult.occasions,
      tags: editedTags,
      wearCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addGarment(garment);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScanCount((c) => c + 1);

    Alert.alert(
      'Saved to closet ✦',
      `"${garment.name}" has been added.`,
      [
        { text: 'Scan Another', onPress: resetScan },
        { text: 'View Closet', onPress: () => navigation.navigate('Closet') },
      ]
    );
  }, [capturedUri, analysisResult, editedName, editedCategory, editedTags, addGarment, navigation]);

  const resetScan = useCallback(() => {
    setCapturedUri(null);
    setAnalysisResult(null);
    setStep('camera');
  }, []);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permissionWrap]}>
        <LinearGradient colors={['#060B14', '#0F172A']} style={StyleSheet.absoluteFill} />
        <Text style={styles.permissionText}>Camera access lets Aura scan your closet.</Text>
        <AnimatedButton label="Grant Camera Access" onPress={requestPermission} size="lg" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Camera view (always mounted for speed) */}
      {step === 'camera' && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={isFlashOn}
        />
      )}

      {/* Dark overlay when not in camera step */}
      {step !== 'camera' && (
        <LinearGradient
          colors={['#060B14', '#0A1220', '#0F172A']}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Camera UI */}
      {step === 'camera' && (
        <View style={styles.cameraUI}>
          {/* Top bar */}
          <Animated.View
            entering={FadeInDown.duration(500)}
            style={[styles.topBar, { paddingTop: insets.top + 12 }]}
          >
            <BlurView intensity={40} style={styles.topBarBlur}>
              <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </Pressable>
              <View style={styles.topBarCenter}>
                <SpectrumBar height={2} style={{ width: 40 }} />
                <Text style={styles.scanTitle}>SCAN ITEM</Text>
                {scanCount > 0 && (
                  <Text style={styles.scanCount}>{scanCount} scanned this session</Text>
                )}
              </View>
              <Pressable onPress={() => setIsFlashOn((f) => !f)} style={styles.flashBtn}>
                <Text style={styles.flashBtnText}>{isFlashOn ? '⚡' : '💡'}</Text>
              </Pressable>
            </BlurView>
          </Animated.View>

          {/* Viewfinder */}
          <View style={styles.viewfinderArea}>
            <Animated.View style={[styles.viewfinderRing, ringStyle]}>
              <LinearGradient
                colors={['rgba(124,58,237,0.3)', 'rgba(236,72,153,0.2)']}
                style={styles.viewfinderGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>

            {/* Corner markers */}
            {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
              <Animated.View
                key={corner}
                style={[styles.corner, styles[corner], cornerStyle]}
              />
            ))}

            {/* Center crosshair */}
            <View style={styles.crosshair}>
              <View style={styles.crosshairH} />
              <View style={styles.crosshairV} />
            </View>
          </View>

          {/* Bottom controls */}
          <Animated.View
            entering={FadeIn.delay(300)}
            style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}
          >
            <BlurView intensity={50} style={styles.bottomBarBlur}>
              <Text style={styles.scanHint}>
                Place garment flat or on hanger. Good lighting = better AI.
              </Text>

              <View style={styles.captureRow}>
                {/* Library */}
                <Pressable onPress={pickFromLibrary} style={styles.sideBtn}>
                  <Text style={styles.sideBtnText}>📸</Text>
                  <Text style={styles.sideBtnLabel}>Library</Text>
                </Pressable>

                {/* Shutter */}
                <Pressable onPress={capture} style={styles.shutterOuter}>
                  <LinearGradient
                    colors={[Brand.violet, Brand.pink]}
                    style={styles.shutterInner}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.shutterIcon}>✦</Text>
                  </LinearGradient>
                </Pressable>

                {/* Bulk mode hint */}
                <Pressable style={styles.sideBtn}>
                  <Text style={styles.sideBtnText}>⟳</Text>
                  <Text style={styles.sideBtnLabel}>Bulk</Text>
                </Pressable>
              </View>
            </BlurView>
          </Animated.View>
        </View>
      )}

      {/* Processing overlay */}
      {step === 'processing' && (
        <Animated.View entering={FadeIn} style={styles.processingOverlay}>
          <ProcessingVisual />
        </Animated.View>
      )}

      {/* Result / Edit panel */}
      {(step === 'result' || step === 'edit') && analysisResult && (
        <Animated.View entering={SlideInUp.springify()} style={styles.resultPanel}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          >
            <ResultPanel
              imageUri={capturedUri!}
              analysis={analysisResult}
              editedName={editedName}
              editedCategory={editedCategory}
              editedTags={editedTags}
              onNameChange={setEditedName}
              onCategoryChange={setEditedCategory}
              onTagsChange={setEditedTags}
              onSave={saveGarment}
              onRetake={resetScan}
            />
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

// ── Processing Visual ──────────────────────────────────────────────────────

function ProcessingVisual() {
  const pulse = useSharedValue(0);
  const rotateVal = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
    rotateVal.value = withRepeat(withTiming(360, { duration: 3000 }), -1, false);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.95, 1.05]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.6, 1]),
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateVal.value}deg` }],
  }));

  return (
    <View style={procStyles.wrap}>
      <Animated.View style={[procStyles.circle, pulseStyle]}>
        <LinearGradient
          colors={[Brand.violet, Brand.pink, Brand.amber]}
          style={procStyles.circleGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Animated.View style={[procStyles.ring, rotateStyle]}>
          <SpectrumBar height={3} borderRadius={0} style={{ width: '100%' }} />
        </Animated.View>
        <View style={procStyles.icon}>
          <Text style={procStyles.iconText}>✦</Text>
        </View>
      </Animated.View>

      <Text style={procStyles.title}>AI is reading your garment…</Text>
      <Text style={procStyles.subtitle}>Identifying type, color, style, and occasion.</Text>

      {['Category detection', 'Color extraction', 'Style classification', 'Tag generation'].map((step, i) => (
        <Animated.View
          key={step}
          entering={FadeIn.delay(500 + i * 300)}
          style={procStyles.step}
        >
          <View style={procStyles.stepDot} />
          <Text style={procStyles.stepText}>{step}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

// ── Result Panel ───────────────────────────────────────────────────────────

interface ResultPanelProps {
  imageUri: string;
  analysis: any;
  editedName: string;
  editedCategory: GarmentCategory;
  editedTags: string[];
  onNameChange: (v: string) => void;
  onCategoryChange: (v: GarmentCategory) => void;
  onTagsChange: (v: string[]) => void;
  onSave: () => void;
  onRetake: () => void;
}

const CATEGORIES_MINI: GarmentCategory[] = [
  'tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'bags', 'accessories',
];

function ResultPanel({
  imageUri, analysis, editedName, editedCategory, editedTags,
  onNameChange, onCategoryChange, onTagsChange, onSave, onRetake,
}: ResultPanelProps) {
  return (
    <View style={resultStyles.container}>
      {/* Header */}
      <View style={resultStyles.header}>
        <SpectrumBar height={2} style={{ width: 40 }} />
        <Text style={resultStyles.title}>Garment Identified ✦</Text>
        <Text style={resultStyles.confidence}>
          {Math.round((analysis.confidence ?? 0.9) * 100)}% confidence
        </Text>
      </View>

      {/* Colors */}
      <GlassCard variant="dark" padding={Spacing.lg}>
        <Text style={resultStyles.sectionLabel}>DETECTED COLORS</Text>
        <View style={resultStyles.colorsRow}>
          {analysis.colors?.map((c: any, i: number) => (
            <View key={i} style={resultStyles.colorChip}>
              <View style={[resultStyles.colorSwatch, { backgroundColor: c.hex }]} />
              <Text style={resultStyles.colorName}>{c.name}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Name edit */}
      <GlassCard variant="dark" padding={Spacing.lg} style={{ marginTop: Spacing.sm }}>
        <Text style={resultStyles.sectionLabel}>ITEM NAME</Text>
        <TextInput
          value={editedName}
          onChangeText={onNameChange}
          style={resultStyles.nameInput}
          placeholderTextColor={Dark.textMuted}
        />
      </GlassCard>

      {/* Category selector */}
      <GlassCard variant="dark" padding={Spacing.lg} style={{ marginTop: Spacing.sm }}>
        <Text style={resultStyles.sectionLabel}>CATEGORY</Text>
        <View style={resultStyles.categoryRow}>
          {CATEGORIES_MINI.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => onCategoryChange(cat)}
              style={[
                resultStyles.catChip,
                editedCategory === cat && resultStyles.catChipActive,
              ]}
            >
              <Text
                style={[
                  resultStyles.catChipText,
                  editedCategory === cat && resultStyles.catChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </View>
      </GlassCard>

      {/* Attributes */}
      <GlassCard variant="dark" padding={Spacing.lg} style={{ marginTop: Spacing.sm }}>
        <Text style={resultStyles.sectionLabel}>ATTRIBUTES</Text>
        <View style={resultStyles.tagsRow}>
          {[
            analysis.formality,
            analysis.pattern,
            ...(analysis.seasons ?? []).slice(0, 2),
            ...(analysis.occasions ?? []).slice(0, 2),
          ].filter(Boolean).map((tag: string, i: number) => (
            <View key={i} style={resultStyles.tag}>
              <Text style={resultStyles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Actions */}
      <View style={resultStyles.actions}>
        <AnimatedButton
          label="Save to Closet ✦"
          onPress={onSave}
          size="lg"
          fullWidth
          hapticStyle={Haptics.ImpactFeedbackStyle.Medium}
        />
        <Pressable onPress={onRetake} style={resultStyles.retakeBtn}>
          <Text style={resultStyles.retakeText}>Retake photo</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060B14' },
  permissionWrap: { justifyContent: 'center', alignItems: 'center', gap: Spacing.xl, padding: Spacing['3xl'] },
  permissionText: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 18,
    color: Dark.textSecondary,
    textAlign: 'center',
  },

  // Camera
  cameraUI: { flex: 1 },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBarBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    overflow: 'hidden',
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 16, color: '#fff' },
  topBarCenter: { flex: 1, alignItems: 'center', gap: 4 },
  scanTitle: {
    fontFamily: FontFamily.sansBold,
    fontSize: 11,
    color: '#fff',
    letterSpacing: 3,
  },
  scanCount: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.3,
  },
  flashBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  flashBtnText: { fontSize: 18 },

  viewfinderArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderRing: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(124,58,237,0.5)',
  },
  viewfinderGradient: { flex: 1 },

  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: Brand.violet,
    borderWidth: 3,
  },
  tl: { top: SH / 2 - VIEWFINDER_SIZE / 2 - 2, left: (SW - VIEWFINDER_SIZE) / 2 - 2, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  tr: { top: SH / 2 - VIEWFINDER_SIZE / 2 - 2, right: (SW - VIEWFINDER_SIZE) / 2 - 2, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  bl: { bottom: SH / 2 - VIEWFINDER_SIZE / 2 + 60, left: (SW - VIEWFINDER_SIZE) / 2 - 2, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  br: { bottom: SH / 2 - VIEWFINDER_SIZE / 2 + 60, right: (SW - VIEWFINDER_SIZE) / 2 - 2, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },

  crosshair: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairH: { position: 'absolute', width: 20, height: 1, backgroundColor: 'rgba(255,255,255,0.4)' },
  crosshairV: { position: 'absolute', width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.4)' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBarBlur: {
    padding: Spacing.xl,
    paddingBottom: 0,
    alignItems: 'center',
    gap: Spacing.md,
    overflow: 'hidden',
  },
  scanHint: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 19,
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.lg,
  },
  sideBtn: { alignItems: 'center', gap: 4, minWidth: 60 },
  sideBtnText: { fontSize: 24 },
  sideBtnLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    ...Shadows.violetGlow,
  },
  shutterInner: {
    flex: 1,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterIcon: { fontSize: 28, color: '#fff' },

  // Processing
  processingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
  },

  // Result
  resultPanel: { flex: 1 },
});

const procStyles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.lg },
  circle: { width: 140, height: 140, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  circleGrad: { position: 'absolute', width: 140, height: 140, borderRadius: 70, opacity: 0.2 },
  ring: {
    position: 'absolute',
    width: 140,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  icon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124,58,237,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Brand.violet}40`,
  },
  iconText: { fontSize: 32, color: Brand.violetLight },
  title: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 22,
    color: Dark.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 14,
    color: Dark.textSecondary,
    textAlign: 'center',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    opacity: 0.7,
  },
  stepDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Brand.violet },
  stepText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Dark.textTertiary,
    letterSpacing: 0.3,
  },
});

const resultStyles = StyleSheet.create({
  container: { padding: Spacing.xl, gap: Spacing.sm },
  header: { gap: 4, marginBottom: Spacing.sm },
  title: {
    fontFamily: FontFamily.serifBold,
    fontSize: 30,
    color: Dark.textPrimary,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  confidence: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Brand.emerald,
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 9,
    color: Dark.textMuted,
    letterSpacing: 2.5,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  colorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  colorChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  colorSwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  colorName: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Dark.textSecondary,
  },
  nameInput: {
    fontFamily: FontFamily.serifMedium,
    fontSize: 20,
    color: Dark.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: Dark.borderDefault,
    paddingBottom: 6,
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Dark.glass1,
    borderWidth: 1,
    borderColor: Dark.borderSubtle,
  },
  catChipActive: {
    backgroundColor: Brand.violet,
    borderColor: 'transparent',
  },
  catChipText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Dark.textTertiary,
    letterSpacing: 0.3,
  },
  catChipTextActive: { color: '#fff' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    backgroundColor: Dark.glass2,
    borderWidth: 1,
    borderColor: Dark.borderSubtle,
  },
  tagText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: Dark.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'capitalize',
  },
  actions: { gap: Spacing.sm, paddingTop: Spacing.md },
  retakeBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  retakeText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    color: Dark.textMuted,
    letterSpacing: 0.3,
  },
});
