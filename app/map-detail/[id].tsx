import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { Colors } from '../../lib/core/constants/Colors';
import { MapMode, Route } from '../../lib/core/types';
import { useCameraConnectionContext } from '../../lib/modules/camera/context/CameraConnectionContext';
import { useBottomSheet } from '../../lib/modules/maps/hooks/useBottomSheet';
import { useMapDetail } from '../../lib/modules/maps/hooks/useMapDetail';
import { useMapRoutes } from '../../lib/modules/maps/hooks/useMapRoutes';
import { useNavigateMode } from '../../lib/modules/maps/hooks/useNavigateMode';
import { useWaypointEditor } from '../../lib/modules/maps/hooks/useWaypointEditor';
import MapActionButton from '../../src/components/atoms/MapActionButton';
import { RouteModal } from '../../src/components/molecules/RouteModal';
import { MapBottomSheet } from '../../src/components/organisms/MapBottomSheet';
import MapViewer, { RobotPose } from '../../src/components/organisms/MapViewer';

const robotPose: RobotPose = { worldX: 0, worldY: 0 };

export default function MapDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { mapData, mapName, loading: mapLoading, error: mapError } =
    useMapDetail(id as string);

  const navigate = useNavigateMode();
  const waypointEditor = useWaypointEditor();
  const bottomSheet = useBottomSheet();
  const mapRoutes = useMapRoutes(id as string);

  const { sendNavigateToPose } = useCameraConnectionContext();

  const [mapMode, setMapMode] = useState<MapMode>('idle');

  const [showRouteEditor, setShowRouteEditor] = useState(false);
  const [showExecuteConfirm, setShowExecuteConfirm] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  const [routeNameDraft, setRouteNameDraft] = useState('Nom. Ruta');
  const [selectedDays, setSelectedDays] = useState<string[]>(['tue', 'fri']);
  const [executeAt, setExecuteAt] = useState('00:00');
  const [recordRoute, setRecordRoute] = useState(true);

  const handleMapTap = (
    worldX: number,
    worldY: number,
    pixelX: number,
    pixelY: number
  ) => {
    if (mapMode === 'navigate') {
      if (!navigate.navPoint) {
        navigate.handleFirstTap(pixelX, pixelY, worldX, worldY);
      } else if (!navigate.navPoint.confirmed) {
        navigate.handleSecondTap(pixelX, pixelY);
      }
      return;
    }

    if (mapMode === 'route_edit') {
      if (!waypointEditor.hasActiveRotating) {
        waypointEditor.addWaypointFirstTap(pixelX, pixelY, worldX, worldY);
      } else {
        waypointEditor.confirmWaypointOrientation(pixelX, pixelY);
      }
    }
  };

  const handleOpenRoutes = () => {
    setMapMode('route_list');
    bottomSheet.collapseBottomSheet();
  };

  const handleAddRouteUi = () => {
    waypointEditor.clearWaypoints();
    setSelectedRoute(null);
    setRouteNameDraft('Nom. Ruta');
    setSelectedDays(['tue', 'fri']);
    setExecuteAt('00:00');
    setRecordRoute(true);
    setShowRouteEditor(true);
    setMapMode('route_edit');
  };

  const handleEditRouteUi = (routeId: string) => {
    const route = mapRoutes.routes.find((r) => r.id === routeId) || null;

    waypointEditor.clearWaypoints();
    setSelectedRoute(route);
    setRouteNameDraft(route?.name || 'Nom. Ruta');
    setShowRouteEditor(true);
    setMapMode('route_edit');
  };

  const handlePlayRouteUi = (routeId: string) => {
    const route = mapRoutes.routes.find((r) => r.id === routeId) || null;
    setSelectedRoute(route);
    setShowExecuteConfirm(true);
  };

  const handleCloseRouteEditor = () => {
    setShowRouteEditor(false);
    setMapMode('route_list');
  };

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((item) => item !== day)
        : [...prev, day]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapCanvas}>
        <MapViewer
          mapData={mapData}
          loading={mapLoading}
          error={mapError}
          robotPose={robotPose}
          onPointTap={handleMapTap}
          waypoints={
            mapMode === 'navigate' && navigate.navPoint
              ? [navigate.navPoint]
              : mapMode === 'route_edit'
              ? waypointEditor.waypoints
              : []
          }
        />
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image
          source={require('../../assets/images/regreso.png')}
          style={{ width: 40, height: 40 }}
        />
      </TouchableOpacity>

      {mapMode === 'idle' && (
        <View style={styles.floatingButtons}>
          <MapActionButton
            label="RUTAS"
            icon={require('../../assets/images/ruta.png')}
            onPress={handleOpenRoutes}
          />
          <MapActionButton
            label="NAVEGAR"
            icon={require('../../assets/images/mapMark.png')}
            onPress={() => setMapMode('navigate')}
          />
        </View>
      )}

      {mapMode === 'route_list' && (
        <MapBottomSheet
          mapName={mapName || 'Nombre del Mapa'}
          bottomSheetAnimation={bottomSheet.bottomSheetAnimation}
          isExpanded={bottomSheet.isExpanded}
          panHandlers={bottomSheet.panHandlers}
          routes={mapRoutes.routes}
          onAddRoute={handleAddRouteUi}
          onEditRouteWaypoints={handleEditRouteUi}
          onPlayRoute={handlePlayRouteUi}
          onDeleteRoute={mapRoutes.onDeleteRoute}
        />
      )}

      <RouteModal
        visible={showRouteEditor}
        routeName={routeNameDraft}
        onChangeRouteName={setRouteNameDraft}
        selectedDays={selectedDays}
        onToggleDay={toggleDay}
        executeAt={executeAt}
        onPressTime={() => {}}
        recordRoute={recordRoute}
        onToggleRecordRoute={() => setRecordRoute((prev) => !prev)}
        onClose={handleCloseRouteEditor}
      />

      {showExecuteConfirm && (
        <Modal
          visible={showExecuteConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowExecuteConfirm(false)}
        >
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmBox}>
              <Text style={styles.confirmTitle}>¿DESEA EJECUTAR{'\n'}LA RUTA?</Text>

              <TouchableOpacity
                style={styles.confirmPrimaryBtn}
                onPress={() => setShowExecuteConfirm(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmPrimaryText}>CONFIRMAR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmSecondaryBtn}
                onPress={() => setShowExecuteConfirm(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmSecondaryText}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {mapMode === 'navigate' && (
        <View style={styles.navigateBar}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              navigate.reset();
              setMapMode('idle');
            }}
          >
            <Text style={styles.cancelText}>CANCELAR</Text>
          </TouchableOpacity>

          {navigate.navPoint?.confirmed && (
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={() => {
                if (navigate.navPoint) {
                  sendNavigateToPose(
                    navigate.navPoint.worldX,
                    navigate.navPoint.worldY,
                    navigate.navPoint.quaternion
                  );
                }
                navigate.reset();
                setMapMode('idle');
              }}
            >
              <Text style={styles.navigateText}>NAVEGAR</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapCanvas: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 16,
    zIndex: 20,
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 38,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    zIndex: 15,
  },

  navigateBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.75)',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  cancelText: {
    color: '#0D111C',
    fontWeight: '700',
  },
  navigateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  navigateText: {
    color: '#FFF',
    fontWeight: '700',
  },

  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBox: {
    width: 185,
    backgroundColor: '#F3F3F3',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#202020',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
  },
  confirmPrimaryBtn: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    backgroundColor: '#124BAF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  confirmPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmSecondaryBtn: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A9A9A9',
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmSecondaryText: {
    color: '#9C9C9C',
    fontSize: 16,
    fontWeight: '500',
  },
});