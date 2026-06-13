// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — ClosetStatsShareCard
// "My wardrobe by the numbers" — the data flex shareable
// Format: 4:5 feed ratio, editorial magazine-layout
// Viral hook: seeing your own stats makes you want to share them
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { captureRef } from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import { Dark, Brand, AuraSpectrum } from '../theme/colors';
import { FontFamily } from '../theme/typography';
import { BorderRadius } from '../theme/spacing';
import type { ClosetStats } from '../types';

const { width: SW } = Dimensions.get('window');
const CARD_W = SW - 40;
const CARD_H = CARD_W * (5 / 4);

interface ClosetStatsShareCardProps {
  stats: ClosetStats;
  outfitCount: number;
  topSeason?: string;
  visible?: boolean;
}

export const ClosetStatsShareCard = React.forwardRef<typeof ViewShot, ClosetStatsShareCardProps>(
  ({ stats, outfitCount, topSeason, visible = true }, ref) => {
    return (
      <ViewShot
        ref={ref as any}
        options={{ format: 'jpg', quality: 0.95 }}
        style={[
          { width: CARD_W, height: CARD_H },
          !visible && { position: 'absolute', left: -9999, top: -9999 },
        ]}
      >
        {/* Background */}
        <LinearGradient
          colors={['#060B14', '#0A1220', '#0F0A1E']}
          style={StyleSheet.absoluteFill}
        />

        {/* Spectrum bar at top */}
        <View style={styles.spectrumTop}>
          {AuraSpectrum.slice(0, 18).map((c, i) => (
            <View key={i} style={[styles.spectrumSeg, { backgroundColor: c }]} />
          ))}
        </View>

        {/* Top header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[Brand.violet, Brand.pink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerChip}
          >
            <Text style={styles.headerChipText}>✦ MY AURA CLOSET</Text>
          </LinearGradient>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
          </Text>
        </View>

        {/* Hero number */}
        <View style={styles.heroSection}>
          <Text style={styles.heroNumber}>{stats.totalItems}</Text>
          <Text style={styles.heroLabel}>PIECES IN MY WARDROBE</Text>
        </View>

        {/* Stat grid */}
        <View style={styles.statGrid}>
          <StatBlock
            value={String(stats.outfitsPossible)}
            label="Outfits possible"
            accent={Brand.violet}
          />
          <StatBlock
            value={String(outfitCount)}
            label="AI looks generated"
            accent={Brand.pink}
          />
          {stats.totalValue != null && stats.totalValue > 0 && (
            <StatBlock
              value={`$${stats.totalValue.toFixed(0)}`}
              label="Closet value"
              accent={Brand.amber}
            />
          )}
          <StatBlock
            value={stats.mostWornCategory}
            label="Most worn"
            accent={Brand.emerald}
            small
          />
        </View>

        {/* Color palette from closet */}
        {stats.colorDistribution.length > 0 && (
          <View style={styles.paletteSection}>
            <Text style={styles.paletteSectionLabel}>MY PALETTE</Text>
            <View style={styles.paletteBar}>
              {stats.colorDistribution.slice(0, 10).map((c, i) => (
                <View
                  key={i}
                  style={[
                    styles.paletteBarSeg,
                    {
                      backgroundColor: c.color,
                      flex: c.percentage,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Sustainability / closet efficiency metric */}
        <View style={styles.efficiencyRow}>
          <View style={styles.efficiencyItem}>
            <Text style={styles.efficiencyEmoji}>💤</Text>
            <View>
              <Text style={styles.efficiencyValue}>{stats.unwornIn30Days.length}</Text>
              <Text style={styles.efficiencyLabel}>unworn 30+ days</Text>
            </View>
          </View>
          {topSeason && (
            <View style={styles.efficiencyItem}>
              <Text style={styles.efficiencyEmoji}>🎨</Text>
              <View>
                <Text style={styles.efficiencyValue}>{topSeason}</Text>
                <Text style={styles.efficiencyLabel}>color season</Text>
              </View>
            </View>
          )}
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          <View style={styles.spectrumBottomLine}>
            {AuraSpectrum.slice(0, 12).map((c, i) => (
              <View key={i} style={[styles.spectrumSeg, { backgroundColor: c }]} />
            ))}
          </View>
          <Text style={styles.ctaText}>Know your wardrobe. Love your style.</Text>
          <Text style={styles.ctaLink}>auracloset.app · #AuraCloset</Text>
        </View>
      </ViewShot>
    );
  }
);

// ── Sub-component ─────────────────────────────────────────────────────────

const StatBlock = ({
  value, label, accent, small = false,
}: { value: string; label: string; accent: string; small?: boolean }) => (
  <View style={[statBlockStyles.wrap, { borderColor: `${accent}25` }]}>
    <LinearGradient
      colors={[`${accent}12`, 'transparent']}
      style={StyleSheet.absoluteFill}
    />
    <Text
      style={[
        statBlockStyles.value,
        { color: accent, fontSize: small ? 18 : 30 },
      ]}
      numberOfLines={1}
    >
      {value}
    </Text>
    <Text style={statBlockStyles.label}>{label.toUpperCase()}</Text>
  </View>
);

// ── Capture hook ──────────────────────────────────────────────────────────

export function useClosetStatsCapture() {
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
  spectrumTop: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 4,
    flexDirection: 'row',
  },
  spectrumSeg: { flex: 1, height: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 4,
  },
  headerChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
  },
  headerChipText: {
    fontFamily: FontFamily.sansBold,
    fontSize: 9,
    color: '#fff',
    letterSpacing: 2,
  },
  headerDate: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  heroNumber: {
    fontFamily: FontFamily.serifBold,
    fontSize: 96,
    color: '#F8F6FF',
    lineHeight: 100,
    letterSpacing: -4,
  },
  heroLabel: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 10,
    color: 'rgba(196,181,253,0.6)',
    letterSpacing: 3,
    marginTop: -8,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  paletteSection: {
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  paletteSectionLabel: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2.5,
  },
  paletteBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    gap: 1,
  },
  paletteBarSeg: {
    height: '100%',
    minWidth: 4,
  },
  efficiencyRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 24,
    marginBottom: 20,
  },
  efficiencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  efficiencyEmoji: { fontSize: 20 },
  efficiencyValue: {
    fontFamily: FontFamily.serifSemiBold,
    fontSize: 16,
    color: '#F8F6FF',
    lineHeight: 20,
    textTransform: 'capitalize',
  },
  efficiencyLabel: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 0.5,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'rgba(6,11,20,0.6)',
    alignItems: 'center',
    gap: 4,
  },
  spectrumBottomLine: {
    flexDirection: 'row',
    height: 2,
    width: '100%',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 6,
  },
  ctaText: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 13,
    color: 'rgba(248,246,255,0.6)',
    textAlign: 'center',
  },
  ctaLink: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 10,
    color: Brand.violetLight,
    letterSpacing: 0.5,
  },
});

const statBlockStyles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: (CARD_W - 48) / 2 - 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    gap: 4,
  },
  value: {
    fontFamily: FontFamily.serifBold,
    lineHeight: 34,
    textTransform: 'capitalize',
  },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 8,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.5,
  },
});
