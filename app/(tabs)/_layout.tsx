import { Tabs } from 'expo-router';
import { Image, StyleSheet } from 'react-native';
import { Colors } from '../../lib/core/constants/Colors';
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#6F7075',
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: 'transparent',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Principal',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/robotNav.png')}
              style={[
                styles.tabIcon,
                { tintColor: focused ? Colors.primary : '#6F7075' }
              ]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="maps"
        options={{
          title: 'Mapas',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/mapaNav.png')}
              style={[
                styles.tabIcon,
                { tintColor: focused ? Colors.primary : '#6F7075' }
              ]}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Cámara',
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 28,
    height: 28,
  },
});