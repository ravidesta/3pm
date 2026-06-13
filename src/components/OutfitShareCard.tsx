// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — OutfitShareCard
// Renders a pixel-perfect shareable card in two formats:
//   • Stories (9:16 = 1080×1920) — full immersive
//   • Feed / Pin (4:5 = 1080×1350) — standard
//
// The card is captured to a PNG via react-native-view-shot and passed to ShareService.
// Design: luxury editorial, spectrum gradient, frosted badge, "styled by Aura" watermark.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Image, Dimensions, ActivityIndicator,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
import { captureRef } from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { Outfit } from '../types';
import { Dark, Brand, AuraSpectrum, ScoreGradient } from '../theme/colors';
import { FontFamily } from '../theme/typography';
import { BorderRadius, Spacing } from '../theme/spacing';

const { width: SW } = Dimensions.get('window');

// Card dimensions (rendered at 2× screen density for crispness)
const FEED_W    = SW - 40;
const FEED_H    = FEED_W * (5 / 4);    // 4:5 ratio — Instagram feed optimal
const STORIES_W = SW - 40;
const STORIES_H = STORIES_W * (16 / 9); // 9:16 Stories

export type CardFormat = 'feed' | 'stories';

interface OutfitShareCardProps {
  outfit: Outfit;
  format: CardFormat;
  colorSeason?: string;
  onCapture?: (uri: string) => void;
  visible?: boolean; // Set true to render, false to hide from screen
}

export const OutfitShareCard = React.forwardRef<
  any,
  OutfitShareCardProps
>(({ outfit, format, colorSeason, onCapture, visible = true }, ref) => {
  const w = format === 'stories' ? STORIES_W : FEED_W;
  const h = format === 'stories' ? STORIES_H : FEED_H;

  const items = outfit.items.slice(0, format === 'stories' ? 3 : 4);
  const scoreColors = ScoreGradient(outfit.matchScore) as [string, string];

  return (
    <ViewShot
      ref={ref as any}
      options={{ format: 'jpg', quality: 0.95 }}
      style={[
        { width: w, height: h },
        !visible && styles.offscreen,
      ]}
    >
      {/* ── Base: dark gradient background ── */}
      <LinearGradient
        colors={['#060B14', '#0F0A1E', '#1A0A3C', '#0F172A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill]}
      />

      {/* ── Ambient color orbs from outfit colors ── */}
      {items.slice(0, 2).map((item, i) => (
        <View
          key={i}
          style={[
            styles.orb,
            {
              backgroundColor: item.garment.colors[0]?.hex ?? Brand.violet,
              width: w * 0.7,
              height: w * 0.7,
              borderRadius: w * 0.35,
              top: i === 0 ? -w * 0.2 : undefined,
              bottom: i === 1 ? -w * 0.15 : undefined,
              left: i === 0 ? -w * 0.2 : undefined,
              right: i === 1 ? -w * 0.1 : undefined,
              opacity: 0.18,
            },
          ]}
        />
      ))}

      {/* ── Garment photo layout ── */}
      {format === 'stories' ? (
        <StoriesLayout items={items} w={w} h={h} />
      ) : (
        <FeedLayout items={items} w={w} h={h} />
      )}

      {/* ── Bottom info panel (glass) ── */}
      <View style={[styles.infoPanel, { paddingBottom: format === 'stories' ? 48 : 24 }]}>
        {/* Spectrum bar */}
        <View style={styles.spectrumStrip}>
          {AuraSpectrum.slice(0, 16).map((color, i) => (
            <View key={i} style={[styles.spectrumSegment, { backgroundColor: color }]} />
          ))}
        </View>

        {/* Style name */}
        <Text style={[styles.styleName, { fontSize: format === 'stories' ? 38 : 28 }]}>
          {outfit.styleNarrative}
        </Text>
        <Text style={styles.styleDesc}>{outfit.styleDescription}</Text>

        {/* Score + color palette row */}
        <View style={styles.metaRow}>
          {/* Aura score pill */}
          <LinearGradient
            colors={scoreColors}
            style={styles.scorePill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.scoreNum}>{outfit.matchScore.toFixed(1)}</Text>
            <Text style={styles.scoreLabel}> AURA</Text>
          </LinearGradient>

          {/* Color dots */}
          <View style={styles.colorDots}>
            {outfit.items
              .flatMap((i) => i.garment.colors.slice(0, 1))
              .slice(0, 5)
              .map((c, idx) => (
                <View
                  key={idx}
                  style={[styles.colorDot, { backgroundColor: c.hex }]}
                />
              ))}
          </View>

          {/* Color season if known */}
          {colorSeason && (
            <View style={styles.seasonBadge}>
              <Text style={styles.seasonBadgeText}>{colorSeason}</Text>
            </View>
          )}
        </View>

        {/* CTA hint */}
        <Text style={styles.ctaText}>
          Build yours → auracloset.app
        </Text>
      </View>

      {/* ── Top: Aura logo watermark ── */}
      <View style={styles.topBar}>
        <LinearGradient
          colors={[Brand.violet, Brand.pink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.logoMark}
        >
          <Text style={styles.logoText}>✦</Text>
        </LinearGradient>
        <Text style={styles.logoLabel}>AURA CLOSET</Text>
      </View>

      {/* ── QR/link hint (Stories format) ── */}
      {format === 'stories' && (
        <View style={styles.swipeUp}>
          <Text style={styles.swipeUpText}>↑ Try it free</Text>
        </View>
      )}
    </ViewShot>
  );
});

// ── Garment layouts ───────────────────────────────────────────────────────

function StoriesLayout({ items, w, h }: { items: Outfit['items']; w: number; h: number }) {
  const photoH = h * 0.62;
  if (items.length === 0) return null;

  return (
    <View style={{ width: w, height: photoH, overflow: 'hidden' }}>
      {items.length === 1 && (
        <GarmentPhoto uri={items[0]!.garment.imageUri} style={{ flex: 1 }} />
      )}
      {items.length === 2 && (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <GarmentPhoto uri={items[0]!.garment.imageUri} style={{ flex: 1 }} />
          <View style={{ width: 2, backgroundColor: '#0A0E1A' }} />
          <GarmentPhoto uri={items[1]!.garment.imageUri} style={{ flex: 1 }} />
        </View>
      )}
      {items.length >= 3 && (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <GarmentPhoto uri={items[0]!.garment.imageUri} style={{ flex: 1.2 }} />
          <View style={{ width: 2, backgroundColor: '#0A0E1A' }} />
          <View style={{ flex: 1 }}>
            <GarmentPhoto uri={items[1]!.garment.imageUri} style={{ flex: 1 }} />
            <View style={{ height: 2, backgroundColor: '#0A0E1A' }} />
            <GarmentPhoto uri={items[2]!.garment.imageUri} style={{ flex: 1 }} />
          </View>
        </View>
      )}
      {/* Gradient fade into info panel */}
      <LinearGradient
        colors={['transparent', 'rgba(6,11,20,0.95)']}
        style={[StyleSheet.absoluteFill, { top: photoH * 0.5 }]}
        pointerEvents="none"
      />
    </View>
  );
}

function FeedLayout({ items, w, h }: { items: Outfit['items']; w: number; h: number }) {
  const photoH = h * 0.55;

  return (
    <View style={{ width: w, height: photoH, overflow: 'hidden' }}>
      {items.length <= 2 && (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          {items.map((item, i) => (
            <React.Fragment key={item.garmentId}>
              {i > 0 && <View style={{ width: 2, backgroundColor: '#0A0E1A' }} />}
              <GarmentPhoto uri={item.garment.imageUri} style={{ flex: 1 }} />
            </React.Fragment>
          ))}
        </View>
      )}
      {items.length >= 3 && (
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
          {items.slice(0, 4).map((item, i) => (
            <React.Fragment key={item.garmentId}>
              <GarmentPhoto
                uri={item.garment.imageUri}
                style={{ width: w / 2 - 1, height: photoH / 2 - 1 }}
              />
              {(i === 1 || i === 3) && <View style={{ width: w, height: 2, backgroundColor: '#0A0E1A' }} />}
              {(i % 2 === 0) && <View style={{ width: 2, height: photoH / 2, backgroundColor: '#0A0E1A' }} />}
            </React.Fragment>
          ))}
        </View>
      )}
      <LinearGradient
        colors={['transparent', 'rgba(6,11,20,0.9)']}
        style={[StyleSheet.absoluteFill, { top: photoH * 0.4 }]}
        pointerEvents="none"
      />
    </View>
  );
}

const GarmentPhoto = ({ uri, style }: { uri: string; style?: any }) => (
  <View style={[{ backgroundColor: Dark.bg3 }, style]}>
    {uri ? (
      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
    ) : (
      <LinearGradient colors={[Dark.bg3, Dark.bg4]} style={StyleSheet.absoluteFill} />
    )}
  </View>
);

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    left: -9999,
    top: -9999,
  },
  orb: {
    position: 'absolute',
    // Note: blur is not available in ViewShot context without native Skia
    // Using opacity instead for the ambient glow effect
  },
  infoPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    backgroundColor: 'rgba(6,11,20,0.85)',
    gap: 8,
  },
  spectrumStrip: {
    flexDirection: 'row',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  spectrumSegment: {
    flex: 1,
    height: '100%',
  },
  styleName: {
    fontFamily: FontFamily.serifBold,
    fontSize: 28,
    color: '#F8F6FF',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  styleDesc: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 13,
    color: 'rgba(196,181,253,0.8)',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  scoreNum: {
    fontFamily: FontFamily.serifBold,
    fontSize: 16,
    color: '#fff',
    lineHeight: 18,
  },
  scoreLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: 9,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.5,
  },
  colorDots: {
    flexDirection: 'row',
    gap: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  seasonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    backgroundColor: 'rgba(124,58,237,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.5)',
  },
  seasonBadgeText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 9,
    color: '#C4B5FD',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  ctaText: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  topBar: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 14,
    color: '#fff',
  },
  logoLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  swipeUp: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  swipeUpText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

// ── useOutfitCardCapture hook ─────────────────────────────────────────────
// Captures the card to a temp file URI for sharing

export function useOutfitCardCapture() {
  const cardRef = useRef<typeof ViewShot>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const capture = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    setIsCapturing(true);
    try {
      const uri = await captureRef(cardRef, {
        format: 'jpg',
        quality: 0.95,
        result: 'tmpfile',
      });
      return uri;
    } catch (err) {
      console.warn('Card capture failed:', err);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return { cardRef, capture, isCapturing };
}
