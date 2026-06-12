// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — GPT-4 Vision Service
// Garment recognition & skin tone analysis
// ─────────────────────────────────────────────────────────────────────────────

import type { VisionAnalysisResult, GarmentColor } from '../types';
import type { ColorSeason } from '../theme/colors';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Resolve API key from environment (set via EAS Secrets)
const getApiKey = (): string =>
  (process.env.EXPO_PUBLIC_OPENAI_API_KEY as string) ?? '';

// ── Convert image URI to base64 ────────────────────────────────────────────

const uriToBase64 = async (uri: string): Promise<string> => {
  if (uri.startsWith('data:')) return uri.split(',')[1] ?? '';
  const resp = await fetch(uri);
  const blob = await resp.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// ── Garment Analysis ──────────────────────────────────────────────────────

const GARMENT_SYSTEM_PROMPT = `You are an expert fashion analyst and personal stylist with deep knowledge of color theory, garment construction, and styling. Analyze garment images with precision.`;

const GARMENT_USER_PROMPT = `Analyze this garment image and return a JSON object with the following exact structure. Be concise and accurate.

{
  "category": "tops|bottoms|dresses|outerwear|shoes|accessories|bags|other",
  "name": "descriptive name (e.g. 'Ivory Silk Blouse', 'Charcoal Tailored Blazer')",
  "colors": [{"hex": "#RRGGBB", "name": "color name", "percentage": 0-100}],
  "pattern": "solid|stripes|floral|plaid|animal-print|geometric|abstract|graphic|other",
  "material": "estimated material (e.g. 'cotton', 'silk', 'denim', 'wool')",
  "formality": "casual|smart-casual|business-casual|formal|active",
  "seasons": ["spring|summer|autumn|winter|all-season"],
  "occasions": ["casual|formal|date-night|work|weekend|active|special"],
  "tags": ["array of 3-6 descriptive tags"],
  "confidence": 0.0-1.0
}

Return ONLY valid JSON. No markdown, no explanation.`;

export async function analyzeGarment(imageUri: string): Promise<VisionAnalysisResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    // Return mock data for development / testing
    return getMockGarmentAnalysis();
  }

  try {
    const base64 = await uriToBase64(imageUri);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: GARMENT_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: GARMENT_USER_PROMPT },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}`, detail: 'high' } },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    // Strip markdown code fences if present
    const cleaned = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as VisionAnalysisResult;
  } catch (err) {
    console.warn('Vision analysis failed, using mock:', err);
    return getMockGarmentAnalysis();
  }
}

// ── Skin Tone / Color Season Analysis ────────────────────────────────────

const SKIN_TONE_PROMPT = `Analyze the person's skin tone in this selfie and determine their color season.

Return ONLY a JSON object:
{
  "undertone": "warm|cool|neutral",
  "season": "Spring|Summer|Autumn|Winter",
  "subSeason": "Light Spring|True Spring|Bright Spring|Light Summer|True Summer|Soft Summer|Soft Autumn|True Autumn|Dark Autumn|Dark Winter|True Winter|Bright Winter",
  "confidence": 0.0-1.0,
  "rationale": "one sentence explanation"
}

No markdown. JSON only.`;

export interface SkinToneResult {
  undertone: 'warm' | 'cool' | 'neutral';
  season: ColorSeason;
  subSeason: string;
  confidence: number;
  rationale: string;
}

export async function analyzeSkinTone(imageUri: string): Promise<SkinToneResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      undertone: 'warm',
      season: 'Spring',
      subSeason: 'True Spring',
      confidence: 0.85,
      rationale: 'Warm golden undertones with bright, clear coloring suggest a True Spring palette.',
    };
  }

  try {
    const base64 = await uriToBase64(imageUri);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: SKIN_TONE_PROMPT },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}`, detail: 'high' } },
            ],
          },
        ],
        max_tokens: 200,
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const cleaned = content.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as SkinToneResult;
  } catch (err) {
    console.warn('Skin tone analysis failed:', err);
    return {
      undertone: 'neutral',
      season: 'Summer',
      subSeason: 'Soft Summer',
      confidence: 0.6,
      rationale: 'Analysis unavailable — using default.',
    };
  }
}

// ── Mock Data (Development / Demo) ────────────────────────────────────────

const MOCK_GARMENTS: VisionAnalysisResult[] = [
  {
    category: 'tops',
    name: 'Ivory Silk Blouse',
    colors: [{ hex: '#F8F4E8', name: 'Ivory', percentage: 85 }, { hex: '#E8DCC8', name: 'Cream', percentage: 15 }],
    pattern: 'solid',
    material: 'silk',
    formality: 'smart-casual',
    seasons: ['spring', 'summer', 'all-season'],
    occasions: ['work', 'date-night', 'casual'],
    tags: ['elegant', 'versatile', 'feminine', 'light'],
    confidence: 0.94,
  },
  {
    category: 'bottoms',
    name: 'Charcoal Wide-Leg Trousers',
    colors: [{ hex: '#3C3C3C', name: 'Charcoal', percentage: 100 }],
    pattern: 'solid',
    material: 'wool-blend',
    formality: 'business-casual',
    seasons: ['autumn', 'winter', 'spring'],
    occasions: ['work', 'formal', 'casual'],
    tags: ['tailored', 'professional', 'minimalist', 'structured'],
    confidence: 0.97,
  },
  {
    category: 'outerwear',
    name: 'Camel Wool Trench Coat',
    colors: [{ hex: '#C19A6B', name: 'Camel', percentage: 100 }],
    pattern: 'solid',
    material: 'wool',
    formality: 'smart-casual',
    seasons: ['autumn', 'winter', 'spring'],
    occasions: ['work', 'casual', 'formal'],
    tags: ['classic', 'timeless', 'investment-piece', 'layering'],
    confidence: 0.96,
  },
];

let mockIndex = 0;
function getMockGarmentAnalysis(): VisionAnalysisResult {
  const result = MOCK_GARMENTS[mockIndex % MOCK_GARMENTS.length];
  mockIndex++;
  return result!;
}
