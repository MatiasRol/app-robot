import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '../src/constants/Colors';

export default function RootLayout() {
  return (
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="map-detail/[id]" 
          options={{ 
            title: 'Mapa',
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
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'fade',
          }} 
        />
      </Stack>
    </GestureHandlerRootView>
  );
}