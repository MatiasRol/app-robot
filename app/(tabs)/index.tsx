import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../lib/core/constants/Colors';
import { hapticLight } from '../../lib/core/utils/haptics';
import { useHomeActionMode } from '../../lib/modules/app/hooks/useHomeActionMode';
import { useApp } from '../../lib/modules/app/context/AppContext';
import SunkenPressable from '../../src/components/atoms/SunkenPressable';
import HomeSideButtons from '../../src/components/organisms/HomeSideButtons';

export default function HomeScreen() {
  const router = useRouter();
  const { robots, selectedMapId, selectedMap } = useApp();
  const { isMediaMode, toggleActionMode } = useHomeActionMode();

  const robotName = robots[0]?.name ?? 'Robot 1';
  const selectedMapName = selectedMap?.name ?? 'Sin mapa activo';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.robotName}>{robotName}</Text>

          <Image
            source={require('../../assets/images/robot01.png')}
            style={styles.robotImage}
            resizeMode="contain"
          />

          <HomeSideButtons
            isMediaMode={isMediaMode}
            isRecordingActive={false}
            onToggleMode={toggleActionMode}
            onRecordingPress={() => {
              void hapticLight();
              Alert.alert(
                'Grabación',
                'La lógica del botón lateral de grabación la hacemos en la siguiente tarea.'
              );
            }}
          />
        </View>

        <View style={styles.bottomPanel}>
          <View style={styles.actionsRow}>
            {isMediaMode ? (
              <>
                <SunkenPressable
                  style={styles.cameraButton}
                  onPress={() => {
                    void hapticLight();
                    Alert.alert(
                      'Fotos',
                      'La pantalla de fotos la creamos en la siguiente tarea.'
                    );
                  }}
                  activeScale={0.97}
                  activeTranslateY={3}
                  activeOpacity={0.92}
                >
                  <View style={styles.mediaIconWrap}>
                    <Ionicons name="images-outline" size={38} color="#1B1B1B" />
                  </View>
                  <Text style={styles.cameraButtonText}>Fotos</Text>
                </SunkenPressable>

                <SunkenPressable
                  style={styles.mapButton}
                  onPress={() => {
                    void hapticLight();
                    Alert.alert(
                      'Videos',
                      'La pantalla de videos la creamos en la siguiente tarea.'
                    );
                  }}
                  activeScale={0.97}
                  activeTranslateY={3}
                  activeOpacity={0.92}
                >
                  <View style={styles.mediaIconWrap}>
                    <Ionicons name="play-circle-outline" size={38} color="#FFFFFF" />
                  </View>
                  <Text style={styles.mediaButtonText}>Videos</Text>
                </SunkenPressable>
              </>
            ) : (
              <>
                <SunkenPressable
                  style={styles.cameraButton}
                  onPress={() => {
                    void hapticLight();
                    router.push('/camera');
                  }}
                  activeScale={0.97}
                  activeTranslateY={3}
                  activeOpacity={0.92}
                >
                  <Image
                    source={require('../../assets/images/camara.png')}
                    style={styles.actionIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.cameraButtonText}>Ver cámara</Text>
                </SunkenPressable>

                <SunkenPressable
                  style={styles.mapButton}
                  onPress={() => {
                    void hapticLight();

                    if (selectedMapId) {
                      router.push(`/map-detail/${selectedMapId}` as any);
                    } else {
                      router.push('/maps');
                    }
                  }}
                  activeScale={0.97}
                  activeTranslateY={3}
                  activeOpacity={0.92}
                >
                  <Image
                    source={require('../../assets/images/mapaBoton.png')}
                    style={styles.actionIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.mapButtonLabel}>Mapa relacionado</Text>
                  <Text style={styles.mapButtonTitle}>{selectedMapName}</Text>
                </SunkenPressable>
              </>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 20,
  },
  logo: {
    width: 34,
    height: 34,
    marginTop: 4,
    marginBottom: 6,
  },
  robotName: {
    fontSize: 18,
    fontWeight: '400',
    color: '#1B1B1B',
    marginBottom: 8,
  },
  robotImage: {
    width: '115%',
    height: 330,
    marginTop: 8,
  },
  bottomPanel: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 18,
    paddingBottom: 18,
    minHeight: 180,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    minHeight: 94,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  mapButton: {
    flex: 1,
    backgroundColor: Colors.button,
    borderRadius: 8,
    minHeight: 94,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  actionIcon: {
    width: 42,
    height: 42,
    marginBottom: 8,
  },
  mediaIconWrap: {
    marginBottom: 8,
  },
  cameraButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B1B1B',
    textAlign: 'center',
  },
  mediaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mapButtonLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  mapButtonTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
});