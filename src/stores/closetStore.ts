// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Closet Store (Zustand)
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Garment, GarmentCategory, ClosetStats } from '../types';

interface ClosetState {
  garments: Garment[];
  isLoading: boolean;
  activeCategory: GarmentCategory | 'all';
  searchQuery: string;
  selectedGarment: Garment | null;
  scanQueue: string[];  // URIs queued for processing

  // Actions
  addGarment: (garment: Garment) => void;
  updateGarment: (id: string, partial: Partial<Garment>) => void;
  removeGarment: (id: string) => void;
  setActiveCategory: (cat: GarmentCategory | 'all') => void;
  setSearchQuery: (q: string) => void;
  setSelectedGarment: (g: Garment | null) => void;
  recordWear: (id: string) => void;
  addToScanQueue: (uri: string) => void;
  clearScanQueue: () => void;
  getGarmentsByCategory: (cat: GarmentCategory | 'all') => Garment[];
  getClosetStats: () => ClosetStats;
  loadFromStorage: () => Promise<void>;
  persist: () => Promise<void>;
}

const computeCostPerWear = (garment: Garment): number | undefined => {
  if (!garment.purchasePrice || garment.wearCount === 0) return undefined;
  return Math.round((garment.purchasePrice / garment.wearCount) * 100) / 100;
};

export const useClosetStore = create<ClosetState>((set, get) => ({
  garments: [],
  isLoading: false,
  activeCategory: 'all',
  searchQuery: '',
  selectedGarment: null,
  scanQueue: [],

  addGarment: (garment) => {
    set((s) => ({ garments: [garment, ...s.garments] }));
    get().persist();
  },

  updateGarment: (id, partial) => {
    set((s) => ({
      garments: s.garments.map((g) =>
        g.id === id
          ? { ...g, ...partial, updatedAt: new Date().toISOString() }
          : g
      ),
    }));
    get().persist();
  },

  removeGarment: (id) => {
    set((s) => ({ garments: s.garments.filter((g) => g.id !== id) }));
    get().persist();
  },

  setActiveCategory: (cat) => set({ activeCategory: cat }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSelectedGarment: (g) => set({ selectedGarment: g }),

  recordWear: (id) => {
    set((s) => ({
      garments: s.garments.map((g) =>
        g.id === id
          ? {
              ...g,
              wearCount: g.wearCount + 1,
              lastWornDate: new Date().toISOString(),
              costPerWear: computeCostPerWear({ ...g, wearCount: g.wearCount + 1 }),
              updatedAt: new Date().toISOString(),
            }
          : g
      ),
    }));
    get().persist();
  },

  addToScanQueue: (uri) =>
    set((s) => ({ scanQueue: [...s.scanQueue, uri] })),

  clearScanQueue: () => set({ scanQueue: [] }),

  getGarmentsByCategory: (cat) => {
    const { garments, searchQuery } = get();
    let filtered = cat === 'all' ? garments : garments.filter((g) => g.category === cat);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q)) ||
          g.colors.some((c) => c.name.toLowerCase().includes(q))
      );
    }
    return filtered;
  },

  getClosetStats: (): ClosetStats => {
    const { garments } = get();
    if (garments.length === 0) {
      return {
        totalItems: 0,
        itemsByCategory: {} as any,
        mostWornCategory: 'tops',
        leastWornCategory: 'accessories',
        unwornIn30Days: [],
        colorDistribution: [],
        outfitsPossible: 0,
      };
    }

    // Count by category
    const byCategory = garments.reduce(
      (acc, g) => ({ ...acc, [g.category]: (acc[g.category] ?? 0) + 1 }),
      {} as Record<string, number>
    );

    // Unworn in 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const unwornIn30Days = garments.filter(
      (g) => !g.lastWornDate || new Date(g.lastWornDate) < thirtyDaysAgo
    );

    // Color distribution
    const colorMap: Record<string, number> = {};
    garments.forEach((g) => {
      g.colors.forEach((c) => {
        colorMap[c.hex] = (colorMap[c.hex] ?? 0) + 1;
      });
    });
    const colorDistribution = Object.entries(colorMap)
      .map(([color, count]) => ({
        color,
        count,
        percentage: Math.round((count / garments.length) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Category with most/least items
    const catEntries = Object.entries(byCategory) as [string, number][];
    const mostWornCategory = catEntries.sort((a, b) => b[1] - a[1])[0]?.[0] as GarmentCategory ?? 'tops';
    const leastWornCategory = catEntries.sort((a, b) => a[1] - b[1])[0]?.[0] as GarmentCategory ?? 'accessories';

    // Rough outfit count (tops × bottoms + dresses)
    const tops = byCategory['tops'] ?? 0;
    const bottoms = byCategory['bottoms'] ?? 0;
    const dresses = byCategory['dresses'] ?? 0;
    const outfitsPossible = tops * bottoms + dresses;

    // Total value
    const totalValue = garments.reduce((sum, g) => sum + (g.purchasePrice ?? 0), 0);

    return {
      totalItems: garments.length,
      itemsByCategory: byCategory as any,
      mostWornCategory,
      leastWornCategory,
      totalValue: totalValue > 0 ? totalValue : undefined,
      unwornIn30Days,
      colorDistribution,
      outfitsPossible,
    };
  },

  loadFromStorage: async () => {
    try {
      set({ isLoading: true });
      const raw = await AsyncStorage.getItem('@aura_closet');
      if (raw) {
        const garments = JSON.parse(raw) as Garment[];
        set({ garments });
      }
    } catch (_) {
      // First launch — empty closet
    } finally {
      set({ isLoading: false });
    }
  },

  persist: async () => {
    const { garments } = get();
    await AsyncStorage.setItem('@aura_closet', JSON.stringify(garments));
  },
}));
