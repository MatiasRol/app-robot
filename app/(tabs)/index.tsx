import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../lib/core/constants/Colors';
import { useApp } from '../../lib/modules/app/context/AppContext';

interface HomeScreenProps {
  robotName?: string;
}

export default function HomeScreen({
  robotName = 'Robot 1',
}: HomeScreenProps) {
  const router = useRouter();

  const {
    selectedMapId,
    selectedMap,
    currentRobotMapName,
  } = useApp();

  const displayedMapName =
    selectedMap?.name || currentRobotMapName || 'Sin mapa actual';

  const handleOpenCurrentMap = () => {
    if (selectedMapId) {
      router.push(`/map-detail/${selectedMapId}`);
      return;
    }

    if (selectedMap?.id) {
      router.push(`/map-detail/${selectedMap.id}`);
      return;
    }

    router.push('/maps');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.robotSection}>
          <View style={styles.robotImageContainer}>
            <View style={styles.robotImagePlaceholder}>
              <Ionicons
                name="hardware-chip-outline"
                size={80}
                color={Colors.textSecondary}
              />
            </View>
          </View>

          <Text style={styles.robotName}>{robotName}</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/camera')}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={28} color={Colors.textSecondary} />
            <Text style={styles.actionLabel}>Ver cámara</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOpenCurrentMap}
            activeOpacity={0.8}
          >
            <Ionicons name="map" size={28} color={Colors.textSecondary} />
            <Text style={styles.actionLabelSmall}>Mapa actual</Text>
            <Text style={styles.actionLabelBold}>{displayedMapName}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <BottomNav activeTab="robot" />
    </SafeAreaView>
  );
}

function BottomNav({ activeTab }: { activeTab: 'robot' | 'person' }) {
  const router = useRouter();

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/')}
      >
        <Ionicons
          name="hardware-chip-outline"
          size={26}
          color={activeTab === 'robot' ? Colors.primary : Colors.inactive}
        />
        {activeTab === 'robot' && <View style={styles.navActiveDot} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push('/maps')}
      >
        <Ionicons
          name="map-outline"
          size={26}
          color={activeTab === 'person' ? Colors.primary : Colors.inactive}
        />
        {activeTab === 'person' && <View style={styles.navActiveDot} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 40,
  },

  robotSection: {
    alignItems: 'center',
    gap: 16,
  },
  robotImageContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotImagePlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.button,
  },
  robotName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: 0.5,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.button,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  actionLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionLabelSmall: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionLabelBold: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider + '40',
    paddingBottom: 20,
    paddingTop: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navActiveDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});