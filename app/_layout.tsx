import React, { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '../lib/core/constants/Colors';
import { AppProvider } from '../lib/modules/app/context/AppContext';
import { CameraConnectionProvider } from '../lib/modules/camera/context/CameraConnectionContext';

export default function RootLayout() {
  useEffect(() => {
    RNStatusBar.setHidden(true, 'fade');

    if (Platform.OS === 'android') {
      RNStatusBar.setTranslucent(true);
      RNStatusBar.setBackgroundColor('transparent');
    }
  }, []);

  return (
    <AppProvider>
      <CameraConnectionProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar hidden style="light" translucent backgroundColor="transparent" />

          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors.background,
              },
              headerTintColor: Colors.text,
              headerTitleStyle: {
                fontWeight: 'bold',
              },
              contentStyle: {
                backgroundColor: Colors.background,
              },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="map-detail/[id]"
              options={{
                headerShown: false,
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="robot-config"
              options={{
                title: 'Configuración del Robot',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="connecting"
              options={{
                presentation: 'transparentModal',
                headerShown: false,
                animation: 'fade',
              }}
            />
          </Stack>
        </GestureHandlerRootView>
      </CameraConnectionProvider>
    </AppProvider>
  );
}