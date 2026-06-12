// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — App Entry Point
// Font loading, store initialization, splash screen
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import { View, StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useUserStore } from './stores/userStore';
import { useClosetStore } from './stores/closetStore';
import { useOutfitStore } from './stores/outfitStore';
import { AppNavigator } from './navigation/AppNavigator';

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const { loadFromStorage: loadUser, profile } = useUserStore();
  const { loadFromStorage: loadCloset } = useClosetStore();
  const { loadFromStorage: loadOutfits } = useOutfitStore();

  useEffect(() => {
    prepare();
  }, []);

  const prepare = async () => {
    try {
      // Load custom fonts
      await Font.loadAsync({
        // Cormorant Garamond (serif — the content of life)
        'CormorantGaramond-Regular':   require('./assets/fonts/CormorantGaramond-Regular.ttf'),
        'CormorantGaramond-Medium':    require('./assets/fonts/CormorantGaramond-Medium.ttf'),
        'CormorantGaramond-SemiBold':  require('./assets/fonts/CormorantGaramond-SemiBold.ttf'),
        'CormorantGaramond-Bold':      require('./assets/fonts/CormorantGaramond-Bold.ttf'),
        'CormorantGaramond-Italic':    require('./assets/fonts/CormorantGaramond-Italic.ttf'),
        'CormorantGaramond-BoldItalic':require('./assets/fonts/CormorantGaramond-BoldItalic.ttf'),
        // Manrope (sans — the trellis)
        'Manrope-Light':               require('./assets/fonts/Manrope-Light.ttf'),
        'Manrope-Regular':             require('./assets/fonts/Manrope-Regular.ttf'),
        'Manrope-Medium':              require('./assets/fonts/Manrope-Medium.ttf'),
        'Manrope-SemiBold':            require('./assets/fonts/Manrope-SemiBold.ttf'),
        'Manrope-Bold':                require('./assets/fonts/Manrope-Bold.ttf'),
        'Manrope-ExtraBold':           require('./assets/fonts/Manrope-ExtraBold.ttf'),
      });
    } catch (e) {
      // Fonts will fall back to system fonts — app still works
      console.warn('Font loading error:', e);
    }

    // Load persisted data
    await Promise.all([loadUser(), loadCloset(), loadOutfits()]);

    setAppReady(true);
    await SplashScreen.hideAsync();
  };

  if (!appReady) return null;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#060B14" />
      <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1 }}>
        <AppNavigator isOnboardingComplete={profile?.onboardingComplete ?? false} />
      </Animated.View>
    </SafeAreaProvider>
  );
}
