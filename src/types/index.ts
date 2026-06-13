// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Core TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

import type { AestheticStyle, ColorSeason } from '../theme/colors';

// ── GARMENT ───────────────────────────────────────────────────────────────

export type GarmentCategory =
  | 'tops' | 'bottoms' | 'dresses' | 'outerwear'
  | 'shoes' | 'accessories' | 'bags' | 'other';

export type GarmentPattern =
  | 'solid' | 'stripes' | 'floral' | 'plaid' | 'animal-print'
  | 'geometric' | 'abstract' | 'graphic' | 'other';

export type GarmentFormality =
  | 'casual' | 'smart-casual' | 'business-casual' | 'formal' | 'active';

export type GarmentSeason = 'spring' | 'summer' | 'autumn' | 'winter' | 'all-season';

export type GarmentOccasion =
  | 'casual' | 'formal' | 'date-night' | 'work' | 'weekend' | 'active' | 'special';

export interface GarmentColor {
  hex: string;
  name: string;
  percentage: number; // 0–100, how dominant this color is
}

export interface Garment {
  id: string;
  userId: string;

  // Media
  imageUri: string;
  thumbnailUri?: string;
  storageUrl?: string;

  // AI-analyzed attributes
  category: GarmentCategory;
  name: string;             // AI-generated descriptive name
  brand?: string;
  colors: GarmentColor[];
  pattern: GarmentPattern;
  material?: string;        // AI estimate
  formality: GarmentFormality;
  seasons: GarmentSeason[];
  occasions: GarmentOccasion[];
  tags: string[];

  // User data
  purchasePrice?: number;
  purchaseDate?: string;    // ISO date string
  notes?: string;

  // Usage tracking
  wearCount: number;
  lastWornDate?: string;    // ISO date string
  createdAt: string;        // ISO date string
  updatedAt: string;

  // Computed
  costPerWear?: number;
  daysSinceWorn?: number;
}

// ── OUTFIT ────────────────────────────────────────────────────────────────

export interface OutfitItem {
  garmentId: string;
  garment: Garment;
  role: 'hero' | 'base' | 'layer' | 'footwear' | 'accessory';
}

export interface UpgradeSuggestion {
  description: string;      // e.g. "A camel trench coat"
  category: GarmentCategory;
  estimatedPrice?: string;  // e.g. "$80–120"
  rationale: string;        // Why it elevates the outfit
  affiliateUrl?: string;
}

export interface Outfit {
  id: string;
  userId: string;

  items: OutfitItem[];
  styleNarrative: string;   // AI-generated name, e.g. "Conscious Professional"
  styleDescription: string; // One sentence flavor text

  // Scoring (1–10)
  matchScore: number;
  colorHarmonyScore: number;
  occasionScore: number;
  weatherScore: number;
  sustainabilityScore?: number;

  // Context
  occasion?: GarmentOccasion;
  weather?: WeatherContext;
  calendarEvent?: string;

  // Suggestions
  upgradeSuggestion?: UpgradeSuggestion;

  // Sharing
  cardImageUri?: string;    // Generated outfit card
  shareCount: number;
  deepLink: string;

  // Lifecycle
  generatedAt: string;
  wornAt?: string;
  wornCount: number;
}

// ── WEATHER ───────────────────────────────────────────────────────────────

export interface WeatherContext {
  temperature: number;       // Celsius
  feelsLike: number;
  condition: string;         // e.g. "Clear", "Rain"
  humidity: number;
  windSpeed: number;
  icon: string;
  location: string;
  forecast?: WeatherForecast[];
}

export interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

// ── USER ──────────────────────────────────────────────────────────────────

export type StyleValue =
  | 'polished' | 'save-money' | 'sustainable'
  | 'stand-out' | 'comfort' | 'trends';

export type ColorUndertone = 'warm' | 'cool' | 'neutral';

export interface UserProfile {
  id: string;
  email?: string;

  // Onboarding data
  aesthetics: AestheticStyle[];       // Top 3 chosen
  colorSeason?: ColorSeason;
  colorUndertone?: ColorUndertone;
  styleValues: StyleValue[];          // Ranked top 3

  // Preferences (derived from style values)
  weights: {
    polished: number;      // 0–1
    budget: number;
    sustainability: number;
    individuality: number;
    comfort: number;
    trendy: number;
  };

  // App state
  onboardingComplete: boolean;
  subscriptionTier: 'free' | 'aura' | 'aura-pro';
  totalScans: number;

  createdAt: string;
  updatedAt: string;
}

// ── CLOSET STATS ──────────────────────────────────────────────────────────

export interface ClosetStats {
  totalItems: number;
  itemsByCategory: Record<GarmentCategory, number>;
  mostWornCategory: GarmentCategory;
  leastWornCategory: GarmentCategory;
  totalValue?: number;
  averageCostPerWear?: number;
  unwornIn30Days: Garment[];
  colorDistribution: Array<{ color: string; count: number; percentage: number }>;
  sustainabilityScore?: number;
  outfitsPossible: number;
}

// ── APP NAVIGATION PARAMS ─────────────────────────────────────────────────

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type OnboardingStackParamList = {
  StyleVibe: undefined;
  ColorCheck: undefined;
  Values: undefined;
};

export type TabParamList = {
  Today: undefined;
  Closet: undefined;
  Scan: undefined;
  Style: undefined;
  Shop: undefined;
};

export type MainStackParamList = {
  Tabs: undefined;
  GarmentDetail: { garmentId: string };
  OutfitDetail: { outfitId: string };
  OutfitCard: { outfit: Outfit };
  ScanResult: { imageUri: string };
  StatsDetail: undefined;
};

// ── AI VISION RESPONSE ────────────────────────────────────────────────────

export interface VisionAnalysisResult {
  category: GarmentCategory;
  name: string;
  colors: GarmentColor[];
  pattern: GarmentPattern;
  material?: string;
  formality: GarmentFormality;
  seasons: GarmentSeason[];
  occasions: GarmentOccasion[];
  tags: string[];
  confidence: number;
}

// ── ONBOARDING STATE ──────────────────────────────────────────────────────

export interface OnboardingState {
  step: 0 | 1 | 2 | 3;
  selectedAesthetics: AestheticStyle[];
  selfieUri?: string;
  colorSeason?: ColorSeason;
  colorUndertone?: ColorUndertone;
  selectedValues: StyleValue[];
  valuesRanking: StyleValue[];
}
