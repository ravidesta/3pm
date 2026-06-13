// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Outfit Generation Algorithm
// Color harmony + weather + occasion + preference weighting
// ─────────────────────────────────────────────────────────────────────────────

import type { Garment, Outfit, OutfitItem, WeatherContext, UserProfile, UpgradeSuggestion } from '../types';
import type { GarmentOccasion } from '../types';

// ── Color Harmony ─────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

function colorHarmonyScore(colors1: string[], colors2: string[]): number {
  if (!colors1.length || !colors2.length) return 5;

  const hues1 = colors1.map((c) => hexToHsl(c)[0]);
  const hues2 = colors2.map((c) => hexToHsl(c)[0]);
  const hue1 = hues1[0] ?? 0;
  const hue2 = hues2[0] ?? 0;
  const diff = Math.abs(hue1 - hue2);
  const angleDiff = diff > 180 ? 360 - diff : diff;

  // Complementary: ~180°
  if (angleDiff > 160 && angleDiff < 200) return 9;
  // Analogous: < 30°
  if (angleDiff < 30) return 8.5;
  // Triadic: ~120°
  if (angleDiff > 110 && angleDiff < 130) return 8;
  // Split complementary: ~150° or ~210°
  if (angleDiff > 140 && angleDiff < 160) return 7.5;
  // Neutral neutral or achromatic
  if (angleDiff < 15) return 7;
  // Clashing
  if (angleDiff > 30 && angleDiff < 60) return 4;
  return 6;
}

function isNeutral(hex: string): boolean {
  const [, s, l] = hexToHsl(hex);
  return s < 15 || l > 85 || l < 12;
}

// ── Weather Compatibility ─────────────────────────────────────────────────

function weatherScore(garments: Garment[], weather: WeatherContext): number {
  const { temperature, condition } = weather;
  let score = 7;

  const hasCoat = garments.some((g) => g.category === 'outerwear');
  const isHeavy = garments.some((g) => g.material?.includes('wool') || g.material?.includes('fleece'));
  const isLight = garments.some((g) => g.material?.includes('silk') || g.material?.includes('linen'));

  if (temperature < 5 && !hasCoat) score -= 3;
  if (temperature < 10 && !hasCoat) score -= 1;
  if (temperature > 25 && isHeavy) score -= 2;
  if (temperature < 15 && isLight) score -= 1;
  if (condition.toLowerCase().includes('rain') && !hasCoat) score -= 1.5;

  return Math.max(1, Math.min(10, score));
}

// ── Outfit Name Generation ────────────────────────────────────────────────

const styleNames: Record<string, string[]> = {
  polished: ['Refined Edge', 'Conscious Professional', 'Curated Presence', 'Elevated Simplicity'],
  casual:   ['Weekend Wanderer', 'Effortless Sunday', 'Golden Hour Edit', 'Soft Landing'],
  evening:  ['Midnight Bloom', 'Dusk Aura', 'Velvet Evening', 'Luminous Night'],
  active:   ['Kinetic Energy', 'Moving Meditation', 'Flow State Fit', 'Vibrant Motion'],
  romantic: ['Rose-Lit Afternoon', 'Soft Encounter', 'Garden Reverie', 'Tender Edit'],
  edgy:     ['Dark Architecture', 'Signal & Noise', 'Electric Silhouette', 'Volt Edit'],
};

function generateStyleNarrative(garments: Garment[], occasion?: GarmentOccasion): string {
  const key = occasion === 'work' ? 'polished'
    : occasion === 'date-night' ? 'evening'
    : occasion === 'active' ? 'active'
    : occasion === 'formal' ? 'polished'
    : 'casual';

  const names = styleNames[key] ?? styleNames.casual!;
  return names[Math.floor(Math.random() * names.length)] ?? 'Aura Edit';
}

const styleDescriptions = [
  'A composition that moves with your day.',
  'Intentional layers, effortless confidence.',
  'Colors that speak before you do.',
  'Structure and softness in balance.',
  'Wear it like a second skin.',
  'Presence without trying.',
];

// ── Upgrade Suggestions ───────────────────────────────────────────────────

function generateUpgradeSuggestion(garments: Garment[]): UpgradeSuggestion | undefined {
  const hasOuterwear = garments.some((g) => g.category === 'outerwear');
  const hasAccessory = garments.some((g) => g.category === 'accessories');
  const hasBag = garments.some((g) => g.category === 'bags');

  if (!hasOuterwear) {
    return {
      description: 'A camel or ivory trench coat',
      category: 'outerwear',
      estimatedPrice: '$80–$150',
      rationale: 'A structured coat would anchor this look with polish.',
    };
  }
  if (!hasBag) {
    return {
      description: 'A structured leather tote',
      category: 'bags',
      estimatedPrice: '$60–$120',
      rationale: 'A quality bag elevates any outfit by 20%.',
    };
  }
  if (!hasAccessory) {
    return {
      description: 'Delicate gold chain necklace',
      category: 'accessories',
      estimatedPrice: '$25–$60',
      rationale: 'One piece of jewelry completes the composition.',
    };
  }
  return undefined;
}

// ── Main Generator ────────────────────────────────────────────────────────

export interface GeneratorOptions {
  garments: Garment[];
  user: UserProfile;
  weather?: WeatherContext;
  occasion?: GarmentOccasion;
  excludeOutfitIds?: string[];
  wornRecently?: Set<string>; // garment IDs worn in last 7 days
  count?: number;
}

export function generateOutfits(opts: GeneratorOptions): Outfit[] {
  const { garments, user, weather, occasion, wornRecently = new Set(), count = 3 } = opts;

  if (garments.length < 2) return [];

  const tops     = garments.filter((g) => g.category === 'tops');
  const bottoms  = garments.filter((g) => g.category === 'bottoms');
  const dresses  = garments.filter((g) => g.category === 'dresses');
  const outerwear= garments.filter((g) => g.category === 'outerwear');
  const shoes    = garments.filter((g) => g.category === 'shoes');
  const bags     = garments.filter((g) => g.category === 'bags');
  const accs     = garments.filter((g) => g.category === 'accessories');

  const outfits: Outfit[] = [];
  const usedCombos = new Set<string>();

  const scoreGarment = (g: Garment): number => {
    let s = 5;
    // Boost unworn items
    if (!g.lastWornDate) s += 2;
    else {
      const daysSince = (Date.now() - new Date(g.lastWornDate).getTime()) / 86400000;
      if (daysSince > 14) s += 1.5;
      else if (daysSince < 3) s -= 1;
    }
    // Penalize recently worn
    if (wornRecently.has(g.id)) s -= 2;
    return s;
  };

  const sortByScore = (arr: Garment[]) =>
    [...arr].sort((a, b) => scoreGarment(b) - scoreGarment(a));

  const sortedTops     = sortByScore(tops);
  const sortedBottoms  = sortByScore(bottoms);
  const sortedDresses  = sortByScore(dresses);
  const sortedOuterwear= sortByScore(outerwear);
  const sortedShoes    = sortByScore(shoes);

  const tryBuildOutfit = (
    top: Garment | null,
    bottom: Garment | null,
    dress: Garment | null,
  ): Outfit | null => {
    const base = dress ?? top;
    if (!base) return null;
    const lower = dress ? null : bottom;
    if (!dress && !lower) return null;

    const comboKey = [base.id, lower?.id ?? 'x'].sort().join('_');
    if (usedCombos.has(comboKey)) return null;
    usedCombos.add(comboKey);

    const items: OutfitItem[] = [
      { garmentId: base.id, garment: base, role: dress ? 'hero' : 'base' },
    ];
    if (lower) items.push({ garmentId: lower.id, garment: lower, role: 'base' });

    // Pick shoes
    const shoe = sortedShoes[0];
    if (shoe) items.push({ garmentId: shoe.id, garment: shoe, role: 'footwear' });

    // Pick outerwear if cold
    if (weather && weather.temperature < 15) {
      const coat = sortedOuterwear[0];
      if (coat) items.push({ garmentId: coat.id, garment: coat, role: 'layer' });
    }

    // Pick accessory
    const acc = accs[Math.floor(Math.random() * (accs.length || 1))];
    if (acc) items.push({ garmentId: acc.id, garment: acc, role: 'accessory' });

    // Pick bag
    const bag = bags[Math.floor(Math.random() * (bags.length || 1))];
    if (bag) items.push({ garmentId: bag.id, garment: bag, role: 'accessory' });

    // Score
    const allColors = items.flatMap((i) => i.garment.colors.map((c) => c.hex));
    const mainColors = [base.colors[0]?.hex ?? '#000', lower?.colors[0]?.hex ?? '#fff'];
    const colorScore = colorHarmonyScore([mainColors[0]!], [mainColors[1]!]);
    const wScore = weather ? weatherScore(items.map((i) => i.garment), weather) : 7;
    const matchScore = Math.round(((colorScore + wScore) / 2) * 10) / 10;

    const outfitOccasion = occasion ?? (base.occasions[0] as GarmentOccasion);

    return {
      id: `outfit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: user.id,
      items,
      styleNarrative: generateStyleNarrative(items.map((i) => i.garment), outfitOccasion),
      styleDescription: styleDescriptions[Math.floor(Math.random() * styleDescriptions.length)]!,
      matchScore,
      colorHarmonyScore: colorScore,
      occasionScore: 7,
      weatherScore: wScore,
      occasion: outfitOccasion,
      weather: weather ?? undefined,
      upgradeSuggestion: generateUpgradeSuggestion(items.map((i) => i.garment)),
      shareCount: 0,
      deepLink: `auracloset://outfit/`,
      generatedAt: new Date().toISOString(),
      wornCount: 0,
    };
  };

  // Generate top+bottom combinations
  for (let t = 0; t < sortedTops.length && outfits.length < count; t++) {
    for (let b = 0; b < sortedBottoms.length && outfits.length < count; b++) {
      const outfit = tryBuildOutfit(sortedTops[t]!, sortedBottoms[b]!, null);
      if (outfit) outfits.push(outfit);
    }
  }

  // Fill remaining with dresses
  for (let d = 0; d < sortedDresses.length && outfits.length < count; d++) {
    const outfit = tryBuildOutfit(null, null, sortedDresses[d]!);
    if (outfit) outfits.push(outfit);
  }

  // Sort by match score
  return outfits.sort((a, b) => b.matchScore - a.matchScore);
}
