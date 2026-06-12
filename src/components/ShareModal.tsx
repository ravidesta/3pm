// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — ShareModal
// Platform-specific share picker bottom sheet
// Surfaces the platforms this demographic actually uses, in priority order:
//   Instagram Stories → TikTok → Pinterest → iMessage → Twitter → Camera Roll → More
//
// Features:
// - Format toggle: Stories (9:16) vs Feed (4:5) vs Pin (2:3)
// - Pre-written captions that sound authentic, not corporate
// - Copy link option
// - Share count celebration (milestone moments)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, Clipboard,
  Dimensions, ScrollView, Modal, Animated as RNAnimated,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  FadeIn, SlideInDown, FadeOut, SlideOutDown,
  runOnJS, interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import type { SharePlatform, SharePayload, ShareContentType } from '../services/shareService';
import {
  shareToplatform, canOpenInstagram, canOpenTikTok,
  canOpenPinterest, buildCaption, buildDeepLink, logShare, saveToCameraRoll,
} from '../services/shareService';
import { Brand, Dark, AuraSpectrum } from '../theme/colors';
import { FontFamily } from '../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../theme/spacing';
import { Springs } from '../theme/animations';

const { height: SH, width: SW } = Dimensions.get('window');

// ── Platform config ────────────────────────────────────────────────────────

interface PlatformOption {
  id: SharePlatform;
  label: string;
  sublabel: string;
  emoji: string;
  gradient: [string, string];
  priority: number;
}

const ALL_PLATFORMS: PlatformOption[] = [
  {
    id: 'instagram-stories',
    label: 'Instagram',
    sublabel: 'Stories',
    emoji: '📸',
    gradient: ['#833AB4', '#FD1D1D'],
    priority: 1,
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    sublabel: 'Video',
    emoji: '🎵',
    gradient: ['#010101', '#EE1D52'],
    priority: 2,
  },
  {
    id: 'instagram-feed',
    label: 'Instagram',
    sublabel: 'Feed Post',
    emoji: '🖼',
    gradient: ['#833AB4', '#F77737'],
    priority: 3,
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    sublabel: 'Save Pin',
    emoji: '📌',
    gradient: ['#E60023', '#AD081B'],
    priority: 4,
  },
  {
    id: 'imessage',
    label: 'Message',
    sublabel: 'iMessage',
    emoji: '💬',
    gradient: ['#3BC55A', '#2D9C46'],
    priority: 5,
  },
  {
    id: 'snapchat',
    label: 'Snapchat',
    sublabel: 'Snap',
    emoji: '👻',
    gradient: ['#FFFC00', '#FFD700'],
    priority: 6,
  },
  {
    id: 'twitter',
    label: 'Twitter/X',
    sublabel: 'Post',
    emoji: '🐦',
    gradient: ['#1DA1F2', '#0D8FDB'],
    priority: 7,
  },
  {
    id: 'camera-roll',
    label: 'Save',
    sublabel: 'Camera Roll',
    emoji: '⬇️',
    gradient: ['#374151', '#1F2937'],
    priority: 8,
  },
  {
    id: 'native',
    label: 'More',
    sublabel: 'Share sheet',
    emoji: '⊕',
    gradient: [Brand.violet, Brand.violetDark],
    priority: 9,
  },
];

// ── Format selector config ────────────────────────────────────────────────

const FORMATS = [
  { id: 'feed'    as const, label: 'Feed', sublabel: '4:5', emoji: '□' },
  { id: 'stories' as const, label: 'Stories', sublabel: '9:16', emoji: '▯' },
];

// Caption variants — authentic tone for the demographic
const CAPTION_VARIANTS: Record<ShareContentType, string[]> = {
  'outfit': [
    'Aura built this for me today and I\'m obsessed ✦',
    'AI knows me better than I know myself at this point',
    'Another day, another outfit from my AI stylist 💜',
    'When the algorithm has taste ✦',
  ],
  'color-season': [
    'Finally know my color season and it\'s changing everything 🎨',
    'Aura analyzed my skin tone and now I can\'t stop buying the right colors',
    'Me finding out I\'m a [season] and crying a little',
    'Color season analysis >>> personality tests for outfit decisions',
  ],
  'closet-stats': [
    'Aura quantified my entire wardrobe and I have thoughts',
    'Did not know my closet could be this organized 💜',
    'My wardrobe by the numbers. Numbers don\'t lie.',
    '[X] pieces, infinite possibilities. This AI gets it.',
  ],
  'aura-score': [
    'My Aura score is [score] and I earned every point',
    'AI gave me a [score]/10 on color harmony today ✦',
    'Getting [score]/10 on my outfit from an AI felt unexpectedly good',
  ],
};

function getRandomCaption(type: ShareContentType): string {
  const options = CAPTION_VARIANTS[type];
  return options[Math.floor(Math.random() * options.length)] ?? '';
}

// ── Props ─────────────────────────────────────────────────────────────────

export interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  contentType: ShareContentType;
  contentId?: string;
  imageUri?: string;                    // Already-captured card image
  onRequestCapture?: (format: 'feed' | 'stories') => Promise<string | null>;
  onShareComplete?: (platform: SharePlatform) => void;
  // Optional: pre-set values
  scoreValue?: number;
  seasonName?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ShareModal({
  visible, onClose, contentType, contentId,
  imageUri, onRequestCapture, onShareComplete,
  scoreValue, seasonName,
}: ShareModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'feed' | 'stories'>('stories');
  const [activeCaption, setActiveCaption] = useState(getRandomCaption(contentType));
  const [isSharing, setIsSharing] = useState(false);
  const [lastSharedPlatform, setLastSharedPlatform] = useState<SharePlatform | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(imageUri ?? null);

  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(600);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      sheetTranslateY.value = withSpring(0, Springs.luxe);
    } else {
      backdropOpacity.value = withTiming(0, { duration: 250 });
      sheetTranslateY.value = withSpring(600, Springs.snappy);
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const handleFormatChange = useCallback(async (format: 'feed' | 'stories') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFormat(format);
    setCapturedUri(null); // Reset — need to recapture in new format
  }, []);

  const getOrCaptureImage = useCallback(async (): Promise<string | null> => {
    if (capturedUri) return capturedUri;
    if (onRequestCapture) {
      const uri = await onRequestCapture(selectedFormat);
      if (uri) setCapturedUri(uri);
      return uri;
    }
    return null;
  }, [capturedUri, onRequestCapture, selectedFormat]);

  const handleShare = useCallback(async (platform: SharePlatform) => {
    if (isSharing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSharing(true);

    try {
      // Prepare caption (fill in dynamic values)
      let caption = activeCaption
        .replace('[season]', seasonName ?? 'Summer')
        .replace('[score]', scoreValue?.toFixed(1) ?? '8.5');

      const imageURI = await getOrCaptureImage();

      const payload: SharePayload = {
        imageUri: imageURI ?? undefined,
        contentType,
        deepLink: buildDeepLink(contentType, contentId),
        caption,
        hashtags: ['AuraCloset', 'OOTD', 'AIStyle', 'OutfitInspo', 'StyleAI'],
        backgroundColor: Brand.violetDeep,
      };

      const result = await shareToplatform(platform, payload);

      if (result.success) {
        logShare({ platform, contentType, contentId, timestamp: new Date().toISOString() });
        setLastSharedPlatform(platform);
        setShareSuccess(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onShareComplete?.(platform);

        // Auto-close after success
        setTimeout(() => {
          setShareSuccess(false);
          onClose();
        }, 1800);
      }
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, activeCaption, contentType, contentId, seasonName, scoreValue,
      getOrCaptureImage, onShareComplete, onClose]);

  const handleCopyLink = useCallback(() => {
    const link = buildDeepLink(contentType, contentId);
    Clipboard.setString(link);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [contentType, contentId]);

  const refreshCaption = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCaption(getRandomCaption(contentType));
  }, [contentType]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View style={[styles.sheet, sheetStyle]} pointerEvents="box-none">
        <BlurView intensity={80} tint="dark" style={styles.sheetBlur}>
          <LinearGradient
            colors={['rgba(15,18,46,0.95)', 'rgba(6,11,20,0.98)']}
            style={StyleSheet.absoluteFill}
          />

          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              {/* Spectrum line */}
              <View style={styles.spectrumLine}>
                {AuraSpectrum.slice(0, 14).map((c, i) => (
                  <View key={i} style={[styles.spectrumSeg, { backgroundColor: c }]} />
                ))}
              </View>
              <Text style={styles.headerTitle}>Share your look</Text>
              <Text style={styles.headerSubtitle}>
                {contentType === 'outfit' ? 'Where does it go first?' :
                 contentType === 'color-season' ? 'Tell them your season ✦' :
                 'Your wardrobe in numbers'}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Format selector (outfit + stats only) */}
          {(contentType === 'outfit' || contentType === 'closet-stats') && (
            <View style={styles.formatRow}>
              {FORMATS.map((fmt) => (
                <FormatTab
                  key={fmt.id}
                  {...fmt}
                  active={selectedFormat === fmt.id}
                  onPress={() => handleFormatChange(fmt.id)}
                />
              ))}
              <View style={styles.formatSpacer} />
              <Text style={styles.formatHint}>
                {selectedFormat === 'stories' ? 'Best for Stories & TikTok' : 'Best for Feed & Pinterest'}
              </Text>
            </View>
          )}

          {/* Platform grid */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.platformList}
          >
            {ALL_PLATFORMS.map((platform) => (
              <PlatformButton
                key={platform.id}
                platform={platform}
                onPress={() => handleShare(platform.id)}
                isLoading={isSharing && lastSharedPlatform === platform.id}
                disabled={isSharing}
              />
            ))}
          </ScrollView>

          {/* Caption section */}
          <View style={styles.captionSection}>
            <View style={styles.captionHeader}>
              <Text style={styles.captionLabel}>CAPTION</Text>
              <Pressable onPress={refreshCaption} style={styles.refreshBtn}>
                <Text style={styles.refreshBtnText}>⟳ New</Text>
              </Pressable>
            </View>
            <View style={styles.captionBox}>
              <Text style={styles.captionText}>
                {activeCaption
                  .replace('[season]', seasonName ?? 'Summer')
                  .replace('[score]', scoreValue?.toFixed(1) ?? '8.5')}
              </Text>
            </View>
          </View>

          {/* Copy link */}
          <View style={styles.linkRow}>
            <View style={styles.linkBox}>
              <Text style={styles.linkText} numberOfLines={1}>
                {buildDeepLink(contentType, contentId)}
              </Text>
            </View>
            <Pressable onPress={handleCopyLink} style={styles.copyBtn}>
              <LinearGradient
                colors={[Brand.violet, Brand.violetDark]}
                style={styles.copyBtnGrad}
              >
                <Text style={styles.copyBtnText}>Copy</Text>
              </LinearGradient>
            </Pressable>
          </View>

          {/* Success state */}
          {shareSuccess && (
            <Animated.View entering={FadeIn} style={styles.successBanner}>
              <LinearGradient
                colors={[Brand.emerald, Brand.violet]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.successGrad}
              >
                <Text style={styles.successText}>
                  Shared ✦ Your aura is spreading
                </Text>
              </LinearGradient>
            </Animated.View>
          )}

          <View style={{ height: 34 }} />
        </BlurView>
      </Animated.View>
    </Modal>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function PlatformButton({
  platform, onPress, isLoading, disabled,
}: {
  platform: PlatformOption;
  onPress: () => void;
  isLoading: boolean;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.88, Springs.haptic); }}
        onPressOut={() => { scale.value = withSpring(1, Springs.snappy); }}
        disabled={disabled}
        style={platformStyles.wrap}
      >
        <View style={platformStyles.iconWrap}>
          <LinearGradient
            colors={platform.gradient}
            style={platformStyles.icon}
          >
            {isLoading ? (
              <Text style={platformStyles.emoji}>…</Text>
            ) : (
              <Text style={platformStyles.emoji}>{platform.emoji}</Text>
            )}
          </LinearGradient>
        </View>
        <Text style={platformStyles.label}>{platform.label}</Text>
        <Text style={platformStyles.sublabel}>{platform.sublabel}</Text>
      </Pressable>
    </Animated.View>
  );
}

function FormatTab({
  id, label, sublabel, emoji, active, onPress,
}: {
  id: string; label: string; sublabel: string; emoji: string;
  active: boolean; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[fmtStyles.tab, active && fmtStyles.tabActive]}>
      {active && (
        <LinearGradient
          colors={[Brand.violet, Brand.violetDark]}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Text style={fmtStyles.emoji}>{emoji}</Text>
      <Text style={[fmtStyles.label, active && fmtStyles.labelActive]}>{label}</Text>
      <Text style={fmtStyles.sublabel}>{sublabel}</Text>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SH * 0.85,
  },
  sheetBlur: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Dark.borderDefault,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
  },
  spectrumLine: {
    flexDirection: 'row',
    height: 2,
    width: 48,
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  spectrumSeg: { flex: 1, height: '100%' },
  headerTitle: {
    fontFamily: FontFamily.serifBold,
    fontSize: 26,
    color: Dark.textPrimary,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 14,
    color: Dark.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  closeBtnText: {
    fontSize: 14,
    color: Dark.textMuted,
  },

  formatRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing['2xl'],
    gap: 8,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  formatSpacer: { flex: 1 },
  formatHint: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: Dark.textMuted,
    letterSpacing: 0.3,
  },

  platformList: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: 16,
  },

  captionSection: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  captionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  captionLabel: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 9,
    color: Dark.textMuted,
    letterSpacing: 2.5,
  },
  refreshBtn: { padding: 4 },
  refreshBtnText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Brand.violetLight,
    letterSpacing: 0.3,
  },
  captionBox: {
    backgroundColor: Dark.glass1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Dark.borderSubtle,
  },
  captionText: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 14,
    color: Dark.textSecondary,
    lineHeight: 21,
  },

  linkRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    gap: 8,
    marginBottom: Spacing.md,
  },
  linkBox: {
    flex: 1,
    backgroundColor: Dark.glass1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    height: 40,
    borderWidth: 1,
    borderColor: Dark.borderSubtle,
  },
  linkText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Dark.textTertiary,
    letterSpacing: 0.2,
  },
  copyBtn: { height: 40, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  copyBtnGrad: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBtnText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 12,
    color: '#fff',
    letterSpacing: 0.3,
  },

  successBanner: {
    marginHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  successGrad: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  successText: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.3,
  },
});

const platformStyles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 4,
    width: 64,
  },
  iconWrap: {
    ...Shadows.md,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 26 },
  label: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 10,
    color: Dark.textSecondary,
    letterSpacing: 0.2,
  },
  sublabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: Dark.textMuted,
    letterSpacing: 0.2,
  },
});

const fmtStyles = StyleSheet.create({
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    gap: 4,
    backgroundColor: Dark.bg3,
    borderWidth: 1,
    borderColor: Dark.borderSubtle,
    overflow: 'hidden',
  },
  tabActive: { borderColor: 'transparent' },
  emoji: { fontSize: 12 },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: Dark.textTertiary,
  },
  labelActive: { color: '#fff', fontFamily: FontFamily.sansSemiBold },
  sublabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: Dark.textMuted,
  },
});
