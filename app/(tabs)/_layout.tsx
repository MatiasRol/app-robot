import { Tabs } from 'expo-router';
import { Image, StyleSheet } from 'react-native';
import { Colors } from '../../lib/core/constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#6F7075',
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Principal',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../../assets/images/robotNavSelecc.png')
                  : require('../../assets/images/robotNav.png')
              }
              style={styles.tabIcon}
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
              source={
                focused
                  ? require('../../assets/images/mapaNavSelecc.png')
                  : require('../../assets/images/mapaNav.png')
              }
              style={styles.tabIcon}
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