# Aura Closet

**AI-powered personal styling app for iOS**

> *"Stop staring at your closet."*  
> AI Stylist in Your Pocket.

---

## Overview

Aura Closet is a React Native iOS application that digitizes your wardrobe and uses GPT-4 Vision to generate personalized, weather-aware outfit combinations daily.

### Features

- **Onboarding Flow** — 3-screen aesthetic quiz, skin tone color season analysis, values ranking
- **Closet Scanner** — Camera-based garment digitizer with AI recognition (< 3 seconds)
- **AI Outfit Generator** — Color harmony + weather + occasion + preference weighting
- **Outfit Card** — Shareable branded cards (1080×1350, Instagram optimal)
- **Wardrobe Stats** — Cost-per-wear, color distribution, unworn item nudges

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 56 |
| AI Vision | GPT-4o (OpenAI API) |
| State | Zustand (persisted with AsyncStorage) |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| Animations | react-native-reanimated v3 (spring-based, 60fps) |
| Storage | Expo FileSystem + AsyncStorage |
| Camera | expo-camera + expo-image-picker |

---

## Design Language

**Resonance OS × Aura Closet**

- Full color spectrum gradient: pastel yellows → vibrant → midnight blue `#0F172A`
- Primary: Violet `#7C3AED`
- Accents: Pink `#EC4899`, Emerald `#10B981`, Amber `#F59E0B`
- Typography: Cormorant Garamond (content) + Manrope (structure)
- Morphic glass panels with 3D shadow system
- Kinetic "dip-in" button press with haptics
- Spring-based animations (exhale-paced, never snapping)

---

## Project Structure

```
src/
├── theme/          # Colors, typography, spacing, animations
├── types/          # TypeScript types
├── stores/         # Zustand state (user, closet, outfits)
├── services/       # GPT Vision, weather, outfit generator
├── components/     # GlassCard, OutfitCard, GarmentCard, SpectrumBar, etc.
├── screens/
│   ├── onboarding/ # StyleVibe, ColorCheck, Values
│   └── tabs/       # Today, Closet, Scan, Style, Shop
├── navigation/     # AppNavigator, AuraTabBar
└── __tests__/      # Jest test suite
```

---

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- iOS device or simulator (iPhone 12+)
- Expo Go app (for quick preview)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file at the project root:

```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-...      # Required for AI garment analysis
EXPO_PUBLIC_WEATHER_API_KEY=...        # Optional: OpenWeatherMap API key
```

The app runs in **demo mode** without API keys (mock data is used).

### Running

```bash
# iOS simulator
npx expo start --ios

# Physical device (Expo Go)
npx expo start
# Scan the QR code with Expo Go
```

### Font Installation

Download and place font files in `src/assets/fonts/`:

- **Cormorant Garamond** (Regular, Medium, SemiBold, Bold, Italic, BoldItalic) — [Google Fonts](https://fonts.google.com/specimen/Cormorant+Garamond)
- **Manrope** (Light, Regular, Medium, SemiBold, Bold, ExtraBold) — [Google Fonts](https://fonts.google.com/specimen/Manrope)

---

## Tests

```bash
npm run test:ci     # Run once (CI mode)
npm test            # Watch mode
```

**15 tests passing** covering:
- Outfit generation algorithm
- Color harmony scoring  
- Weather weighting logic
- Style narrative generation
- Outfit uniqueness enforcement
- Color utility functions

---

## Success Metrics (Phase 1)

| Metric | Target |
|---|---|
| Closet scans (Week 6) | 1,000 |
| Daily active users | 500 |
| App Store rating | 4.5+ |
| D7 retention | 15% |
| Outfit share rate | 8% |
| Crash rate | < 0.5% |

---

## Performance Targets

| Operation | Target |
|---|---|
| Cold launch → interactive | < 2 seconds |
| Camera → categorized item | < 3 seconds |
| Outfit generation | < 1.5 seconds |
| Max image size (WebP) | 500 KB |

---

*Aura Closet — Luminous Prosperity Inc. — timestamped, undeniable, unloseable.*
