// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — User Store (Zustand)
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile, OnboardingState, StyleValue } from '../types';
import type { AestheticStyle, ColorSeason } from '../theme/colors';

interface UserState {
  profile: UserProfile | null;
  onboarding: OnboardingState;
  isLoading: boolean;
  isDarkMode: boolean;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
  setOnboardingStep: (step: OnboardingState['step']) => void;
  setSelectedAesthetics: (aesthetics: AestheticStyle[]) => void;
  setSelfieUri: (uri: string) => void;
  setColorSeason: (season: ColorSeason, undertone: 'warm' | 'cool' | 'neutral') => void;
  setStyleValues: (values: StyleValue[]) => void;
  completeOnboarding: () => void;
  toggleDarkMode: () => void;
  loadFromStorage: () => Promise<void>;
  persist: () => Promise<void>;
}

const defaultOnboarding: OnboardingState = {
  step: 0,
  selectedAesthetics: [],
  selectedValues: [],
  valuesRanking: [],
};

const computeWeights = (values: StyleValue[]) => ({
  polished:       values.includes('polished')    ? 0.7 : 0.3,
  budget:         values.includes('save-money')  ? 0.7 : 0.2,
  sustainability: values.includes('sustainable') ? 0.7 : 0.2,
  individuality:  values.includes('stand-out')   ? 0.7 : 0.3,
  comfort:        values.includes('comfort')     ? 0.7 : 0.3,
  trendy:         values.includes('trends')      ? 0.7 : 0.2,
});

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  onboarding: defaultOnboarding,
  isLoading: false,
  isDarkMode: true, // App defaults to dark

  setProfile: (profile) => set({ profile }),

  updateProfile: (partial) =>
    set((s) => ({
      profile: s.profile ? { ...s.profile, ...partial, updatedAt: new Date().toISOString() } : null,
    })),

  setOnboardingStep: (step) =>
    set((s) => ({ onboarding: { ...s.onboarding, step } })),

  setSelectedAesthetics: (aesthetics) =>
    set((s) => ({ onboarding: { ...s.onboarding, selectedAesthetics: aesthetics } })),

  setSelfieUri: (uri) =>
    set((s) => ({ onboarding: { ...s.onboarding, selfieUri: uri } })),

  setColorSeason: (season, undertone) =>
    set((s) => ({
      onboarding: { ...s.onboarding, colorSeason: season, colorUndertone: undertone },
    })),

  setStyleValues: (values) =>
    set((s) => ({
      onboarding: { ...s.onboarding, selectedValues: values, valuesRanking: values },
    })),

  completeOnboarding: () => {
    const { onboarding } = get();
    const newProfile: UserProfile = {
      id: `user_${Date.now()}`,
      aesthetics: onboarding.selectedAesthetics,
      colorSeason: onboarding.colorSeason,
      colorUndertone: onboarding.colorUndertone,
      styleValues: onboarding.selectedValues,
      weights: computeWeights(onboarding.selectedValues),
      onboardingComplete: true,
      subscriptionTier: 'free',
      totalScans: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ profile: newProfile });
    get().persist();
  },

  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),

  loadFromStorage: async () => {
    try {
      set({ isLoading: true });
      const raw = await AsyncStorage.getItem('@aura_user');
      if (raw) {
        const profile = JSON.parse(raw) as UserProfile;
        set({ profile });
      }
    } catch (_) {
      // Fail silently — first launch
    } finally {
      set({ isLoading: false });
    }
  },

  persist: async () => {
    const { profile } = get();
    if (profile) {
      await AsyncStorage.setItem('@aura_user', JSON.stringify(profile));
    }
  },
}));
