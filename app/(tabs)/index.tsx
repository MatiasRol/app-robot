import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FotosIcon from '../../assets/images/fotos.svg';
import VideosIcon from '../../assets/images/videos.svg';
import { Colors } from '../../lib/core/constants/Colors';
import { hapticLight } from '../../lib/core/utils/haptics';
import { useHomeActionMode } from '../../lib/modules/app/hooks/useHomeActionMode';
import { useHomeRecordingControl } from '../../lib/modules/app/hooks/useHomeRecordingControl';
import { useApp } from '../../lib/modules/app/context/AppContext';
import { useCameraConnectionContext } from '../../lib/modules/camera/context/CameraConnectionContext';
import SunkenPressable from '../../src/components/atoms/SunkenPressable';
import HomeRecordingConfirmModal from '../../src/components/molecules/HomeRecordingConfirmModal';
import HomeSideButtons from '../../src/components/organisms/HomeSideButtons';

export default function HomeScreen() {
  const router = useRouter();
  const { robots, selectedMapId, selectedMap } = useApp();
  const { isMediaMode, toggleActionMode } = useHomeActionMode();

  const {
    connectionStatus,
    sendRecordingCommand,
    isRobotRecording,
    robotRecordingState,
  } = useCameraConnectionContext();

  const commandsConnected = connectionStatus.commands === 'connected';

  const {
    showRecordingConfirm,
    isRecordingActive,
    handleRecordingPress,
    cancelRecordingAction,
    confirmRecordingAction,
  } = useHomeRecordingControl({
    commandsConnected,
    isRobotRecording,
    robotRecordingState,
    sendRecordingCommand,
  });

  const robotName = robots[0]?.name ?? 'Robot 1';
  const selectedMapName = selectedMap?.name ?? 'Sin mapa activo';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.topSection}>
          <View style={styles.topHeader}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.robotName}>{robotName}</Text>
          </View>

          <Image
            source={require('../../assets/images/robot01.png')}
            style={styles.robotImage}
            resizeMode="contain"
          />

          <HomeSideButtons
            isMediaMode={isMediaMode}
            isRecordingActive={isRecordingActive}
            onToggleMode={toggleActionMode}
            onRecordingPress={handleRecordingPress}
          />
        </View>

        <View style={styles.bottomPanel}>
          <View style={styles.actionsRow}>
            {isMediaMode ? (
              <>
                <SunkenPressable
                  style={[styles.actionButtonBase, styles.lightButton]}
                  onPress={() => {
                    void hapticLight();
                    router.push('/photos');
                  }}
                  activeScale={0.97}
                  activeTranslateY={3}
                  activeOpacity={0.92}
                >
                  <View style={styles.iconSlot}>
                    <FotosIcon width={42} height={42} />
                  </View>

                  <View style={styles.textAreaSingle}>
                    <Text style={styles.lightMainText}>Fotos</Text>
                  </View>
                </SunkenPressable>

                <SunkenPressable
                  style={[styles.actionButtonBase, styles.darkButton]}
                  onPress={() => {
                    void hapticLight();
                    router.push('/videos');
                  }}
                  activeScale={0.97}
                  activeTranslateY={3}
                  activeOpacity={0.92}
                >
                  <View style={styles.iconSlot}>
                    <VideosIcon width={42} height={42} />
                  </View>

                  <View style={styles.textAreaSingle}>
                    <Text style={styles.darkMainText}>Videos</Text>
                  </View>
                </SunkenPressable>
              </>
            ) : (
              <>
                <SunkenPressable
                  style={[styles.actionButtonBase, styles.lightButton]}
                  onPress={() => {
                    void hapticLight();
                    router.push('/camera');
                  }}
                  activeScale={0.97}
                  activeTranslateY={3}
                  activeOpacity={0.92}
                >
                  <View style={styles.iconSlot}>
                    <Image
                      source={require('../../assets/images/camara.png')}
                      style={styles.actionIcon}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.textAreaSingle}>
                    <Text style={styles.lightMainText}>Ver cámara</Text>
                  </View>
                </SunkenPressable>

                <SunkenPressable
                  style={[styles.actionButtonBase, styles.darkButton]}
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
                  <View style={styles.iconSlot}>
                    <Image
                      source={require('../../assets/images/mapaBoton.png')}
                      style={styles.actionIcon}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.textAreaMap}>
                    <Text style={styles.mapButtonLabel}>Mapa relacionado</Text>
                    <Text
                      style={styles.mapButtonTitle}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.78}
                    >
                      {selectedMapName}
                    </Text>
                  </View>
                </SunkenPressable>
              </>
            )}
          </View>
        </View>

        <HomeRecordingConfirmModal
          visible={showRecordingConfirm}
          isRecordingActive={isRecordingActive}
          onConfirm={confirmRecordingAction}
          onCancel={cancelRecordingAction}
        />
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
    paddingBottom: 0,
  },
  topHeader: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 2,
  },
  logo: {
    width: 44,
    height: 44,
    marginTop: 4,
    marginBottom: 8,
  },
  robotName: {
    fontSize: 21,
    fontWeight: '500',
    color: '#1B1B1B',
  },
  robotImage: {
    width: '118%',
    height: 360,
    marginTop: 'auto',
    marginBottom: -8,
  },
  bottomPanel: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 18,
    paddingBottom: 18,
    minHeight: 192,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButtonBase: {
    flex: 1,
    height: 130,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 10,
  },
  lightButton: {
    backgroundColor: '#FFFFFF',
  },
  darkButton: {
    backgroundColor: Colors.button,
  },
  iconSlot: {
    width: 50,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionIcon: {
    width: 38,
    height: 38,
  },
  textAreaSingle: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textAreaMap: {
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  lightMainText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B1B1B',
    textAlign: 'center',
  },
  darkMainText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mapButtonLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 2,
  },
  mapButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
  },
});