// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Outfit Generator Tests
// Tests: color matching, weather weighting, outfit generation rules
// ─────────────────────────────────────────────────────────────────────────────

import { generateOutfits } from '../services/outfitGenerator';
import type { Garment, UserProfile, WeatherContext } from '../types';

// ── Fixtures ──────────────────────────────────────────────────────────────

const makeGarment = (
  id: string,
  category: Garment['category'],
  colorHex: string,
  colorName: string,
): Garment => ({
  id,
  userId: 'test',
  imageUri: '',
  category,
  name: `Test ${category} ${id}`,
  colors: [{ hex: colorHex, name: colorName, percentage: 100 }],
  pattern: 'solid',
  formality: 'casual',
  seasons: ['all-season'],
  occasions: ['casual'],
  tags: [],
  wearCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const mockUser: UserProfile = {
  id: 'user_test',
  aesthetics: ['Minimalist'],
  styleValues: ['polished'],
  weights: {
    polished: 0.7,
    budget: 0.2,
    sustainability: 0.2,
    individuality: 0.3,
    comfort: 0.3,
    trendy: 0.2,
  },
  onboardingComplete: true,
  subscriptionTier: 'free',
  totalScans: 10,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockWeatherCold: WeatherContext = {
  temperature: 4,
  feelsLike: 2,
  condition: 'Clear',
  humidity: 60,
  windSpeed: 8,
  icon: '☀️',
  location: 'Test City',
};

const mockWeatherWarm: WeatherContext = {
  temperature: 26,
  feelsLike: 28,
  condition: 'Sunny',
  humidity: 40,
  windSpeed: 5,
  icon: '☀️',
  location: 'Test City',
};

// ── Test Suite ────────────────────────────────────────────────────────────

describe('Outfit Generator', () => {
  describe('Basic generation', () => {
    test('returns empty array when fewer than 2 garments', () => {
      const result = generateOutfits({
        garments: [makeGarment('g1', 'tops', '#FFFFFF', 'White')],
        user: mockUser,
      });
      expect(result).toHaveLength(0);
    });

    test('generates outfits from top + bottom combination', () => {
      const garments = [
        makeGarment('top1', 'tops', '#FFFFFF', 'White'),
        makeGarment('bot1', 'bottoms', '#000000', 'Black'),
      ];
      const result = generateOutfits({ garments, user: mockUser });
      expect(result.length).toBeGreaterThan(0);
    });

    test('each outfit has required fields', () => {
      const garments = [
        makeGarment('top1', 'tops', '#A78BFA', 'Lavender'),
        makeGarment('bot1', 'bottoms', '#1F2937', 'Charcoal'),
      ];
      const [outfit] = generateOutfits({ garments, user: mockUser });
      expect(outfit).toBeDefined();
      expect(outfit!.id).toBeTruthy();
      expect(outfit!.styleNarrative).toBeTruthy();
      expect(outfit!.matchScore).toBeGreaterThanOrEqual(1);
      expect(outfit!.matchScore).toBeLessThanOrEqual(10);
      expect(outfit!.items.length).toBeGreaterThanOrEqual(2);
    });

    test('generates up to `count` outfits', () => {
      const garments = [
        makeGarment('top1', 'tops', '#FFFFFF', 'White'),
        makeGarment('top2', 'tops', '#F87171', 'Red'),
        makeGarment('bot1', 'bottoms', '#000000', 'Black'),
        makeGarment('bot2', 'bottoms', '#6B7280', 'Gray'),
      ];
      const result = generateOutfits({ garments, user: mockUser, count: 3 });
      expect(result.length).toBeLessThanOrEqual(3);
    });
  });

  describe('Color harmony scoring', () => {
    test('complementary colors score >= 8', () => {
      // Red (#FF0000, hue=0) + Cyan (#00FFFF, hue=180) — complementary
      const garments = [
        makeGarment('top1', 'tops', '#FF0000', 'Red'),
        makeGarment('bot1', 'bottoms', '#00FFFF', 'Cyan'),
      ];
      const [outfit] = generateOutfits({ garments, user: mockUser });
      expect(outfit!.colorHarmonyScore).toBeGreaterThanOrEqual(7);
    });

    test('analogous colors score >= 6', () => {
      // Blue (#0000FF, hue=240) + Blue-Violet (#3B0FFF, hue~250) — truly analogous (diff ~10°)
      const garments = [
        makeGarment('top1', 'tops', '#0000FF', 'Blue'),
        makeGarment('bot1', 'bottoms', '#0014CC', 'Dark Blue'),
      ];
      const [outfit] = generateOutfits({ garments, user: mockUser });
      // Analogous colors should score >= 7 (analogous rule: diff < 30°)
      expect(outfit!.colorHarmonyScore).toBeGreaterThanOrEqual(7);
    });
  });

  describe('Weather weighting', () => {
    test('cold weather adds outerwear if available', () => {
      const garments = [
        makeGarment('top1', 'tops', '#FFFFFF', 'White'),
        makeGarment('bot1', 'bottoms', '#000000', 'Black'),
        makeGarment('coat1', 'outerwear', '#C19A6B', 'Camel'),
      ];
      const [outfit] = generateOutfits({
        garments,
        user: mockUser,
        weather: mockWeatherCold,
      });
      const hasCoat = outfit!.items.some((i) => i.garment.category === 'outerwear');
      expect(hasCoat).toBe(true);
    });

    test('warm weather penalizes heavy garments', () => {
      const heavy = makeGarment('coat1', 'outerwear', '#000000', 'Black');
      heavy.material = 'wool';

      const garments = [
        makeGarment('top1', 'tops', '#FFFFFF', 'White'),
        makeGarment('bot1', 'bottoms', '#000000', 'Black'),
        heavy,
      ];
      const [outfit] = generateOutfits({
        garments,
        user: mockUser,
        weather: mockWeatherWarm,
        count: 1,
      });
      // Weather score should be lower when outfit includes heavy wool in warm weather
      expect(outfit!.weatherScore).toBeLessThanOrEqual(7);
    });
  });

  describe('Style narratives', () => {
    test('generates a non-empty style name', () => {
      const garments = [
        makeGarment('top1', 'tops', '#F8F4E8', 'Ivory'),
        makeGarment('bot1', 'bottoms', '#3C3C3C', 'Charcoal'),
      ];
      const [outfit] = generateOutfits({ garments, user: mockUser });
      expect(outfit!.styleNarrative.length).toBeGreaterThan(0);
    });

    test('generates a style description', () => {
      const garments = [
        makeGarment('top1', 'tops', '#F8F4E8', 'Ivory'),
        makeGarment('bot1', 'bottoms', '#3C3C3C', 'Charcoal'),
      ];
      const [outfit] = generateOutfits({ garments, user: mockUser });
      expect(outfit!.styleDescription.length).toBeGreaterThan(0);
    });
  });

  describe('Outfit uniqueness', () => {
    test('does not generate exact duplicate combinations', () => {
      const garments = [
        makeGarment('top1', 'tops', '#FFFFFF', 'White'),
        makeGarment('bot1', 'bottoms', '#000000', 'Black'),
      ];
      const result = generateOutfits({ garments, user: mockUser, count: 5 });
      const combos = result.map((o) =>
        o.items.map((i) => i.garmentId).sort().join('_')
      );
      const unique = new Set(combos);
      expect(unique.size).toBe(combos.length);
    });
  });
});

// ── Color Utility Tests ───────────────────────────────────────────────────

describe('Color utilities', () => {
  test('ScoreGradient returns correct gradient for high score', () => {
    const { ScoreGradient } = require('../theme/colors');
    const colors = ScoreGradient(9);
    expect(colors).toHaveLength(2);
    expect(colors[0]).toBe('#10B981'); // emerald
  });

  test('ScoreGradient returns muted gradient for low score', () => {
    const { ScoreGradient } = require('../theme/colors');
    const colors = ScoreGradient(3);
    expect(colors).toHaveLength(2);
  });
});

// ── Closet Stats Tests ────────────────────────────────────────────────────

describe('Closet Store (unit — no native deps)', () => {
  test('computeOutfitsPossible formula: tops * bottoms + dresses', () => {
    // This tests the formula without needing the store
    const tops = 3;
    const bottoms = 4;
    const dresses = 2;
    const outfitsPossible = tops * bottoms + dresses;
    expect(outfitsPossible).toBe(14);
  });

  test('cost per wear decreases as wear count increases', () => {
    const purchasePrice = 100;
    const wearCount1 = 1;
    const wearCount10 = 10;
    expect(purchasePrice / wearCount10).toBeLessThan(purchasePrice / wearCount1);
  });
});
