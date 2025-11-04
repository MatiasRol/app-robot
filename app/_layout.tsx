import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '../src/constants/Colors';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
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
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="map-detail/[id]" 
          options={{ 
            title: 'Detalle del Mapa',
            presentation: 'card'
          }} 
        />
        <Stack.Screen 
          name="robot-config" 
          options={{ 
            title: 'Configuración del Robot',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="connecting" 
          options={{ 
            title: 'Conectando',
            presentation: 'modal',
            headerShown: false
          }} 
        />
      </Stack>
    </GestureHandlerRootView>
  );
}