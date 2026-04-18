import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '../lib/core/constants/Colors';
import { AppProvider } from '../lib/modules/app/context/AppContext';
import { CameraConnectionProvider } from '../lib/modules/camera/context/CameraConnectionContext';

export default function RootLayout() {
  return (
    <CameraConnectionProvider>
      <AppProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="light" backgroundColor={Colors.background} />
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
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="connecting"
              options={{
                headerShown: false,
                animation: 'fade',
                gestureEnabled: false,
              }}
            />
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
          </Stack>
        </GestureHandlerRootView>
      </AppProvider>
    </CameraConnectionProvider>
  );
}