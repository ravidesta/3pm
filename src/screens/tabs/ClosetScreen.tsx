// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Closet Screen
// Full wardrobe grid with category filter tabs, search, item management
// ─────────────────────────────────────────────────────────────────────────────

import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Pressable,
  Dimensions, StatusBar,
} from 'react-native';
import Animated, {
  FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useClosetStore } from '../../stores/closetStore';
import type { Garment, GarmentCategory } from '../../types';
import { Brand, Dark } from '../../theme/colors';
import { FontFamily } from '../../theme/typography';
import { BorderRadius, Shadows, Spacing } from '../../theme/spacing';
import { Springs } from '../../theme/animations';
import { GarmentCard } from '../../components/GarmentCard';
import { SpectrumBar, SpectrumOrb } from '../../components/SpectrumBar';
import { GarmentGridSkeleton } from '../../components/SkeletonLoader';
import { GlassCard } from '../../components/GlassCard';
import { AnimatedButton } from '../../components/AnimatedButton';

const { width: SW } = Dimensions.get('window');
const NUM_COLS = 2;
const ITEM_W = (SW - 40 - 12) / 2;

const CATEGORIES: { key: GarmentCategory | 'all'; label: string; emoji: string }[] = [
  { key: 'all',        label: 'All',        emoji: '✦' },
  { key: 'tops',       label: 'Tops',       emoji: '👕' },
  { key: 'bottoms',    label: 'Bottoms',    emoji: '👖' },
  { key: 'dresses',    label: 'Dresses',    emoji: '👗' },
  { key: 'outerwear',  label: 'Outerwear',  emoji: '🧥' },
  { key: 'shoes',      label: 'Shoes',      emoji: '👠' },
  { key: 'bags',       label: 'Bags',       emoji: '👜' },
  { key: 'accessories',label: 'Accessories',emoji: '💍' },
];

export function ClosetScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const {
    activeCategory, setActiveCategory,
    searchQuery, setSearchQuery,
    isLoading, getGarmentsByCategory,
    garments,
  } = useClosetStore();

  const filtered = useMemo(
    () => getGarmentsByCategory(activeCategory),
    [activeCategory, searchQuery, garments]
  );

  const handleGarmentPress = useCallback((g: Garment) => {
    navigation.navigate('GarmentDetail', { garmentId: g.id });
  }, [navigation]);

  const renderGarment = useCallback(({ item, index }: { item: Garment; index: number }) => (
    <Animated.View entering={FadeIn.delay(index * 30)}>
      <GarmentCard
        garment={item}
        onPress={handleGarmentPress}
        size="md"
        style={{ marginBottom: 12 }}
      />
    </Animated.View>
  ), [handleGarmentPress]);

  const totalCount = garments.length;
  const stats = useClosetStore.getState().getClosetStats();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#060B14', '#0A1220', '#0F172A']}
        style={StyleSheet.absoluteFill}
      />
      <SpectrumOrb
        size={300}
        style={{ position: 'absolute', top: 100, right: -80, opacity: 0.07 }}
        colors={['#EC4899', '#7C3AED', '#3B82F6']}
      />

      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(600)}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <SpectrumBar height={2} style={{ width: 32, marginBottom: 8 }} />
            <Text style={styles.title}>My Closet</Text>
            <Text style={styles.subtitle}>
              {totalCount === 0 ? 'Empty — scan your first piece' : `${totalCount} pieces curated`}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Scan')}
            style={styles.addBtn}
          >
            <LinearGradient
              colors={[Brand.violet, Brand.violetDark]}
              style={styles.addBtnInner}
            >
              <Text style={styles.addBtnText}>+ Scan</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search your wardrobe…"
              placeholderTextColor={Dark.textMuted}
              style={styles.searchInput}
            />
          </View>
        </View>
      </Animated.View>

      {/* Category filter */}
      <Animated.FlatList
        entering={FadeIn.delay(200)}
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.categoryList}
        renderItem={({ item }) => (
          <CategoryTab
            {...item}
            active={activeCategory === item.key}
            count={item.key === 'all' ? totalCount : (stats.itemsByCategory as any)[item.key] ?? 0}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveCategory(item.key);
            }}
          />
        )}
        style={styles.categoryScroll}
      />

      {/* Spectrum line */}
      <SpectrumBar height={1} style={{ marginHorizontal: Spacing.xl, marginBottom: Spacing.sm, opacity: 0.4 }} />

      {/* Grid */}
      {isLoading ? (
        <GarmentGridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyCategory
          category={activeCategory}
          onScan={() => navigation.navigate('Scan')}
        />
      ) : (
        <FlatList
          data={filtered}
          numColumns={NUM_COLS}
          keyExtractor={(g) => g.id}
          renderItem={renderGarment}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

interface CategoryTabProps {
  key: string;
  label: string;
  emoji: string;
  active: boolean;
  count: number;
  onPress: () => void;
}

function CategoryTab({ label, emoji, active, count, onPress }: CategoryTabProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.93, Springs.haptic); }}
        onPressOut={() => { scale.value = withSpring(1, Springs.snappy); }}
        style={[
          catStyles.tab,
          active && catStyles.tabActive,
          active ? Shadows.violetGlow : {},
        ]}
      >
        {active && (
          <LinearGradient
            colors={[Brand.violet, Brand.violetDark]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        <Text style={catStyles.emoji}>{emoji}</Text>
        <Text style={[catStyles.label, active && catStyles.labelActive]}>{label}</Text>
        {count > 0 && (
          <View style={[catStyles.badge, active && catStyles.badgeActive]}>
            <Text style={catStyles.badgeText}>{count}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const EmptyCategory = ({ category, onScan }: { category: string; onScan: () => void }) => (
  <View style={styles.emptyWrap}>
    <GlassCard variant="dark" padding={Spacing['3xl']} style={styles.emptyCard}>
      <Text style={styles.emptyEmoji}>
        {category === 'all' ? '👗' : CATEGORIES.find((c) => c.key === category)?.emoji ?? '✦'}
      </Text>
      <Text style={styles.emptyTitle}>
        {category === 'all' ? 'Your closet is empty' : `No ${category} yet`}
      </Text>
      <Text style={styles.emptyDesc}>
        Scan items to build your digital wardrobe.
      </Text>
      <AnimatedButton
        label="Scan Now →"
        onPress={onScan}
        size="md"
        style={{ marginTop: Spacing.md }}
      />
    </GlassCard>
  </View>
);

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060B14' },
  header: {
    paddingHorizontal: Spacing['2xl'],
    paddingBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: FontFamily.serifBold,
    fontSize: 36,
    color: Dark.textPrimary,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 13,
    color: Dark.textSecondary,
    marginTop: 2,
  },
  addBtn: { overflow: 'hidden', borderRadius: BorderRadius.full },
  addBtnInner: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  addBtnText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 13,
    color: '#fff',
    letterSpacing: 0.3,
  },
  searchRow: { marginBottom: Spacing.sm },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Dark.bg3,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Dark.borderSubtle,
    height: 44,
  },
  searchIcon: { fontSize: 14, marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.serifRegular,
    fontSize: 15,
    color: Dark.textPrimary,
    height: 44,
  },
  categoryScroll: { maxHeight: 60 },
  categoryList: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, gap: 8 },
  grid: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: 100 },
  gridRow: { justifyContent: 'space-between' },
  emptyWrap: { flex: 1, padding: Spacing.xl, justifyContent: 'center' },
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
});

const catStyles = StyleSheet.create({
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    gap: 6,
    backgroundColor: Dark.bg3,
    borderWidth: 1,
    borderColor: Dark.borderSubtle,
    overflow: 'hidden',
    minHeight: 36,
  },
  tabActive: {
    borderColor: 'transparent',
  },
  emoji: { fontSize: 13 },
  label: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 12,
    color: Dark.textTertiary,
    letterSpacing: 0.3,
  },
  labelActive: { color: '#fff' },
  badge: {
    backgroundColor: Dark.glass2,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  badgeText: {
    fontFamily: FontFamily.sansBold,
    fontSize: 9,
    color: Dark.textSecondary,
  },
});
