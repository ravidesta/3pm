// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — ColorSeasonShareCard
// The viral "personality reveal" shareable — inspired by MBTI/Enneagram quiz culture
// Format: full-bleed Stories (9:16) with season reveal + palette + CTA
// "I'm a [Season] — take the Aura color quiz" → viral loop driver
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { captureRef } from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import { Dark, Brand, ColorSeasons, AuraSpectrum, type ColorSeason } from '../theme/colors';
import { FontFamily } from '../theme/typography';
import { BorderRadius } from '../theme/spacing';

const { width: SW } = Dimensions.get('window');
const CARD_W = SW - 40;
const CARD_H = CARD_W * (16 / 9); // Stories format

// Season-specific gradients (matches the aesthetic of each season)
const SEASON_GRADIENTS: Record<ColorSeason, [string, string, string]> = {
  Spring: ['#1A0A10', '#2D1520', '#0F172A'],   // Warm deep with rose hints
  Summer: ['#0A0F2A', '#0F1A3A', '#060B14'],   // Cool deep ocean blues
  Autumn: ['#1A0E08', '#2A1A0A', '#0F172A'],   // Warm amber-brown depths
  Winter: ['#050510', '#0A0A20', '#060B14'],   // Ice-cold deepest dark
};

const SEASON_ACCENT: Record<ColorSeason, [string, string]> = {
  Spring:  ['#FFD700', '#FFA500'],
  Summer:  ['#B0C4DE', '#9370DB'],
  Autumn:  ['#D2691E', '#DAA520'],
  Winter:  ['#E0E0FF', '#4169E1'],
};

interface ColorSeasonShareCardProps {
  season: ColorSeason;
  subSeason: string;
  visible?: boolean;
}

export const ColorSeasonShareCard = React.forwardRef<typeof ViewShot, ColorSeasonShareCardProps>(
  ({ season, subSeason, visible = true }, ref) => {
    const data = ColorSeasons[season];
    const gradients = SEASON_GRADIENTS[season];
    const accents = SEASON_ACCENT[season];

    return (
      <ViewShot
        ref={ref as any}
        options={{ format: 'jpg', quality: 0.95 }}
        style={[
          { width: CARD_W, height: CARD_H },
          !visible && { position: 'absolute', left: -9999, top: -9999 },
        ]}
      >
        {/* Deep atmospheric background */}
        <LinearGradient
          colors={gradients}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Spectrum arc at top */}
        <View style={styles.spectrumArc}>
          {AuraSpectrum.map((color, i) => (
            <View
              key={i}
              style={[styles.arcSegment, { backgroundColor: color }]}
            />
          ))}
        </View>

        {/* Top: Aura branding */}
        <View style={styles.topBrand}>
          <LinearGradient
            colors={[Brand.violet, Brand.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.logoChip}
          >
            <Text style={styles.logoChipText}>✦ AURA CLOSET</Text>
          </LinearGradient>
        </View>

        {/* Center: Season reveal */}
        <View style={styles.center}>
          {/* Season emoji — large and anchoring */}
          <Text style={styles.seasonEmoji}>{data.emoji}</Text>

          {/* The reveal text — Resonance OS serif */}
          <Text style={styles.revealPre}>I'm a</Text>
          <LinearGradient
            colors={accents}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.seasonNameGrad}
          >
            <Text style={styles.seasonName}>{season}</Text>
          </LinearGradient>
          <Text style={styles.subSeasonName}>{subSeason}</Text>
          <Text style={styles.seasonTagline}>{data.description}</Text>

          {/* Palette row — the 12 colors */}
          <View style={styles.paletteRow}>
            {data.palette.map((color, i) => (
              <View
                key={i}
                style={[
                  styles.paletteSwatch,
                  { backgroundColor: color, height: 32 + (i % 3 === 0 ? 12 : 0) },
                ]}
              />
            ))}
          </View>

          {/* Undertone label */}
          <View style={styles.undertoneRow}>
            <View style={[styles.undertonePill, { borderColor: `${accents[0]}60` }]}>
              <Text style={[styles.undertoneText, { color: accents[0] }]}>
                {data.subLabel.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom: viral CTA */}
        <View style={styles.bottomCTA}>
          {/* Spectrum line */}
          <View style={styles.spectrumLine}>
            {AuraSpectrum.slice(0, 14).map((color, i) => (
              <View key={i} style={[styles.lineSegment, { backgroundColor: color }]} />
            ))}
          </View>

          <Text style={styles.ctaQuestion}>What's your color season?</Text>
          <Text style={styles.ctaLink}>Find out free → auracloset.app</Text>
          <Text style={styles.ctaSmall}>#AuraColorSeason #ColorAnalysis #AuraCloset</Text>
        </View>
      </ViewShot>
    );
  }
);

// ── useColorSeasonCapture hook ────────────────────────────────────────────

export function useColorSeasonCapture() {
  const cardRef = useRef<typeof ViewShot>(null);

  const capture = async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    try {
      return await captureRef(cardRef, { format: 'jpg', quality: 0.95, result: 'tmpfile' });
    } catch {
      return null;
    }
  };

  return { cardRef, capture };
}

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  spectrumArc: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    flexDirection: 'row',
  },
  arcSegment: {
    flex: 1,
    height: '100%',
  },
  topBrand: {
    position: 'absolute',
    top: 28,
    left: 24,
  },
  logoChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  logoChipText: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10,
    color: '#fff',
    letterSpacing: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
    paddingBottom: 120,
    gap: 10,
  },
  seasonEmoji: {
    fontSize: 64,
    marginBottom: 8,
  },
  revealPre: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 22,
    color: 'rgba(248,246,255,0.6)',
    lineHeight: 26,
  },
  seasonNameGrad: {
    borderRadius: 8,
    paddingHorizontal: 2,
    paddingVertical: 0,
  },
  seasonName: {
    fontFamily: FontFamily.serifBold,
    fontSize: 64,
    lineHeight: 70,
    letterSpacing: -1,
    color: '#fff',
  },
  subSeasonName: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 20,
    color: 'rgba(196,181,253,0.8)',
    letterSpacing: 0.3,
    marginTop: -8,
  },
  seasonTagline: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 15,
    color: 'rgba(248,246,255,0.55)',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
    maxWidth: '80%',
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-end',
    marginTop: 16,
    height: 50,
  },
  paletteSwatch: {
    width: 22,
    borderRadius: 8,
    minHeight: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  undertoneRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  undertonePill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  undertoneText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 10,
    letterSpacing: 2.5,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingBottom: 36,
    paddingTop: 20,
    backgroundColor: 'rgba(6,11,20,0.7)',
    alignItems: 'center',
    gap: 6,
  },
  spectrumLine: {
    flexDirection: 'row',
    height: 2,
    width: '100%',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 8,
  },
  lineSegment: {
    flex: 1,
    height: '100%',
  },
  ctaQuestion: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 18,
    color: 'rgba(248,246,255,0.9)',
    textAlign: 'center',
  },
  ctaLink: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Brand.violetLight,
    letterSpacing: 0.5,
  },
  ctaSmall: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 0.3,
    marginTop: 2,
  },
});
