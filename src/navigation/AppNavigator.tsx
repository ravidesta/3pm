// ─────────────────────────────────────────────────────────────────────────────
// AURA CLOSET — Root Navigation
// Onboarding flow → Main tabs with animated transitions
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screens
import { StyleVibeScreen } from '../screens/onboarding/StyleVibeScreen';
import { ColorCheckScreen } from '../screens/onboarding/ColorCheckScreen';
import { ValuesScreen } from '../screens/onboarding/ValuesScreen';
import { TodayScreen } from '../screens/tabs/TodayScreen';
import { ClosetScreen } from '../screens/tabs/ClosetScreen';
import { ScanScreen } from '../screens/tabs/ScanScreen';
import { StyleScreen } from '../screens/tabs/StyleScreen';
import { ShopScreen } from '../screens/tabs/ShopScreen';
import { AuraTabBar } from './TabBar';

// Types
import type { RootStackParamList, OnboardingStackParamList, TabParamList } from '../types';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ── Onboarding navigator ──────────────────────────────────────────────────

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0F0A1E' },
      }}
    >
      <OnboardingStack.Screen name="StyleVibe"   component={StyleVibeScreen} />
      <OnboardingStack.Screen name="ColorCheck"  component={ColorCheckScreen} />
      <OnboardingStack.Screen name="Values"      component={ValuesScreen} />
    </OnboardingStack.Navigator>
  );
}

// ── Main tab navigator ────────────────────────────────────────────────────

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <AuraTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tab.Screen name="Today"  component={TodayScreen} />
      <Tab.Screen name="Closet" component={ClosetScreen} />
      <Tab.Screen name="Scan"   component={ScanScreen} />
      <Tab.Screen name="Style"  component={StyleScreen} />
      <Tab.Screen name="Shop"   component={ShopScreen} />
    </Tab.Navigator>
  );
}

// ── Root navigator ────────────────────────────────────────────────────────

interface AppNavigatorProps {
  isOnboardingComplete: boolean;
}

export function AppNavigator({ isOnboardingComplete }: AppNavigatorProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0F0A1E' },
          }}
          initialRouteName={isOnboardingComplete ? 'Main' : 'Onboarding'}
        >
          <RootStack.Screen
            name="Onboarding"
            component={OnboardingNavigator}
            options={{ animation: 'fade' }}
          />
          <RootStack.Screen
            name="Main"
            component={MainTabs}
            options={{ animation: 'fade' }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
