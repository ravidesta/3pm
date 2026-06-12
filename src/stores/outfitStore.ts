// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Outfit Store (Zustand)
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Outfit, WeatherContext } from '../types';

interface OutfitState {
  outfits: Outfit[];
  todaysOutfits: Outfit[];
  selectedOutfit: Outfit | null;
  weather: WeatherContext | null;
  isGenerating: boolean;
  lastGeneratedDate: string | null;

  // Actions
  setTodaysOutfits: (outfits: Outfit[]) => void;
  setSelectedOutfit: (o: Outfit | null) => void;
  setWeather: (w: WeatherContext) => void;
  setGenerating: (v: boolean) => void;
  saveOutfit: (outfit: Outfit) => void;
  recordOutfitWorn: (id: string) => void;
  incrementShareCount: (id: string) => void;
  setOutfitCardImage: (id: string, uri: string) => void;
  getRecentlyWorn: (days?: number) => Outfit[];
  loadFromStorage: () => Promise<void>;
  persist: () => Promise<void>;
}

export const useOutfitStore = create<OutfitState>((set, get) => ({
  outfits: [],
  todaysOutfits: [],
  selectedOutfit: null,
  weather: null,
  isGenerating: false,
  lastGeneratedDate: null,

  setTodaysOutfits: (outfits) => {
    set({
      todaysOutfits: outfits,
      lastGeneratedDate: new Date().toDateString(),
    });
  },

  setSelectedOutfit: (o) => set({ selectedOutfit: o }),
  setWeather: (w) => set({ weather: w }),
  setGenerating: (v) => set({ isGenerating: v }),

  saveOutfit: (outfit) => {
    set((s) => {
      const exists = s.outfits.find((o) => o.id === outfit.id);
      if (exists) {
        return { outfits: s.outfits.map((o) => (o.id === outfit.id ? outfit : o)) };
      }
      return { outfits: [outfit, ...s.outfits].slice(0, 200) }; // cap at 200
    });
    get().persist();
  },

  recordOutfitWorn: (id) => {
    set((s) => ({
      outfits: s.outfits.map((o) =>
        o.id === id
          ? { ...o, wornAt: new Date().toISOString(), wornCount: o.wornCount + 1 }
          : o
      ),
    }));
    get().persist();
  },

  incrementShareCount: (id) => {
    set((s) => ({
      outfits: s.outfits.map((o) =>
        o.id === id ? { ...o, shareCount: o.shareCount + 1 } : o
      ),
    }));
    get().persist();
  },

  setOutfitCardImage: (id, uri) => {
    set((s) => ({
      outfits: s.outfits.map((o) =>
        o.id === id ? { ...o, cardImageUri: uri } : o
      ),
    }));
    get().persist();
  },

  getRecentlyWorn: (days = 14) => {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return get().outfits.filter(
      (o) => o.wornAt && new Date(o.wornAt) > cutoff
    );
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem('@aura_outfits');
      if (raw) {
        const outfits = JSON.parse(raw) as Outfit[];
        set({ outfits });
      }
    } catch (_) {
      // Empty history
    }
  },

  persist: async () => {
    const { outfits } = get();
    await AsyncStorage.setItem('@aura_outfits', JSON.stringify(outfits));
  },
}));
