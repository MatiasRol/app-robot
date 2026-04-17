import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../lib/core/constants/Colors';
import { MapMode } from '../../lib/core/types';
import { useApp } from '../../lib/modules/app/context/AppContext';
import { useCameraConnectionContext } from '../../lib/modules/camera/context/CameraConnectionContext';
import { useBottomSheet } from '../../lib/modules/maps/hooks/useBottomSheet';
import { useMapDetail } from '../../lib/modules/maps/hooks/useMapDetail';
import { useMapRoutes } from '../../lib/modules/maps/hooks/useMapRoutes';
import { useNavigateMode } from '../../lib/modules/maps/hooks/useNavigateMode';
import { useOperationMode } from '../../lib/modules/maps/hooks/useOperationMode';
import { useWaypointEditor } from '../../lib/modules/maps/hooks/useWaypointEditor';
import { RouteModal } from '../../src/components/molecules/RouteModal';
import MapActionButton from '../../src/components/atoms/MapActionButton';
import { ModeChangeAlert } from '../../src/components/molecules/ModeChangeAlert';
import { MapBottomSheet } from '../../src/components/organisms/MapBottomSheet';
import MapViewer, { RobotPose } from '../../src/components/organisms/MapViewer';

export default function MapDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { mapData, mapName, loading: mapLoading, error: mapError } =
    useMapDetail(id as string);

  const { robotPose: livePose } = useApp();

  const robotPose: RobotPose | null = useMemo(() => {
    if (!livePose?.position) return null;

    return {
      worldX: livePose.position.x,
      worldY: livePose.position.y,
    };
  }, [livePose]);

  const navigate = useNavigateMode();
  const waypointEditor = useWaypointEditor();

  const { sendNavigateToPose, sendFollowWaypoints } = useCameraConnectionContext();

  const [mapMode, setMapMode] = useState<MapMode>('idle');
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  const bottomSheet = useBottomSheet();
  const mapRoutes = useMapRoutes(id as string);
  const opMode = useOperationMode();

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
    } else if (mapMode === 'route_edit') {
      if (!waypointEditor.hasActiveRotating) {
        waypointEditor.addWaypointFirstTap(pixelX, pixelY, worldX, worldY);
      } else {
        waypointEditor.confirmWaypointOrientation(pixelX, pixelY);
      }
    }
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
            onPress={() => {
              setMapMode('route_list');
              bottomSheet.expandBottomSheet();
            }}
          />
          <MapActionButton
            label="NAVEGAR"
            icon={require('../../assets/images/mapMark.png')}
            onPress={() => setMapMode('navigate')}
          />
        </View>
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

          <Text style={styles.navigateHint}>
            {!navigate.navPoint
              ? 'Selecciona un punto de navegación'
              : !navigate.navPoint.confirmed
              ? 'Toca de nuevo para fijar la orientación'
              : 'Listo para navegar'}
          </Text>
        </View>
      )}

      {(mapMode === 'route_list' || mapMode === 'route_edit') && (
        <MapBottomSheet
          mapName={mapName || `Mapa ${id}`}
          bottomSheetAnimation={bottomSheet.bottomSheetAnimation}
          isExpanded={bottomSheet.isExpanded}
          panHandlers={bottomSheet.panHandlers}
          routes={mapRoutes.routes}
          onAddRoute={mapRoutes.openAddModal}
          onEditRouteWaypoints={(routeId) => {
            waypointEditor.clearWaypoints();
            setEditingRouteId(routeId);
            setMapMode('route_edit');
          }}
          onPlayRoute={(routeId) => {
            const route = mapRoutes.routes.find((r) => r.id === routeId);
            if (!route?.waypoints?.length) return;

            const waypointsForRos = (route.waypoints as any[]).map((wp) => ({
              worldX: wp.position.x,
              worldY: wp.position.y,
              quaternion: wp.orientation,
            }));

            sendFollowWaypoints(waypointsForRos);
          }}
          onDeleteRoute={mapRoutes.onDeleteRoute}
          isEditingWaypoints={mapMode === 'route_edit'}
          onAcceptWaypoints={() => {
            if (editingRouteId && waypointEditor.waypoints.length > 0) {
              mapRoutes.saveWaypoints(
                editingRouteId,
                waypointEditor.waypoints
              );
            }
            waypointEditor.clearWaypoints();
            setEditingRouteId(null);
            setMapMode('route_list');
          }}
        />
      )}

      <ModeChangeAlert {...opMode.alertProps} />
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
    zIndex: 10,
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    zIndex: 10,
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
    alignItems: 'center',
    gap: 12,
  },
  cancelButton: {
    backgroundColor: Colors.surface,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  cancelText: {
    color: Colors.text,
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
  navigateHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
});