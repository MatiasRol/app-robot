import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../lib/core/constants/Colors';
import { MapMode } from '../../lib/core/types';
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

const robotPose: RobotPose = { worldX: 0, worldY: 0 };

export default function MapDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { mapData, mapName, loading: mapLoading, error: mapError } =
    useMapDetail(id as string);

  const navigate = useNavigateMode();
  const waypointEditor = useWaypointEditor();

  const { sendNavigateToPose, sendFollowWaypoints } =
    useCameraConnectionContext();

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
      if (!navigate.navPoint || navigate.navPoint.confirmed) {
        navigate.handleFirstTap(pixelX, pixelY, worldX, worldY);
      }
      return;
    }

    if (mapMode === 'route_edit') {
      if (!waypointEditor.hasActiveRotating) {
        waypointEditor.addWaypointFirstTap(pixelX, pixelY, worldX, worldY);
      }
    }
  };

  const handleDirectionDrag = (
    _worldX: number,
    _worldY: number,
    pixelX: number,
    pixelY: number
  ) => {
    if (
      mapMode === 'navigate' &&
      navigate.isDraggingOrientation &&
      navigate.navPoint
    ) {
      navigate.updateOrientation(pixelX, pixelY);
      return;
    }

    if (mapMode === 'route_edit' && waypointEditor.hasActiveRotating) {
      waypointEditor.updateActiveWaypointOrientation(pixelX, pixelY);
    }
  };

  const handleDirectionDragEnd = () => {
    if (mapMode === 'navigate' && navigate.isDraggingOrientation) {
      navigate.finishOrientation();
      return;
    }

    if (mapMode === 'route_edit' && waypointEditor.hasActiveRotating) {
      waypointEditor.finishActiveWaypointOrientation();
    }
  };

  const handlePlayRoute = (routeId: string) => {
    const route = mapRoutes.routes.find((r) => r.id === routeId);
    if (!route?.waypoints?.length) return;

    const waypointsForRos = (route.waypoints as any[])
      .map((wp) => {
        if (wp?.position && wp?.orientation) {
          return {
            worldX: Number(wp.position.x ?? 0),
            worldY: Number(wp.position.y ?? 0),
            quaternion: {
              x: Number(wp.orientation.x ?? 0),
              y: Number(wp.orientation.y ?? 0),
              z: Number(wp.orientation.z ?? 0),
              w: Number(wp.orientation.w ?? 1),
            },
          };
        }

        if (
          typeof wp?.worldX === 'number' &&
          typeof wp?.worldY === 'number' &&
          wp?.quaternion
        ) {
          return {
            worldX: wp.worldX,
            worldY: wp.worldY,
            quaternion: {
              x: Number(wp.quaternion.x ?? 0),
              y: Number(wp.quaternion.y ?? 0),
              z: Number(wp.quaternion.z ?? 0),
              w: Number(wp.quaternion.w ?? 1),
            },
          };
        }

        return null;
      })
      .filter(Boolean);

    if (waypointsForRos.length === 0) return;

    sendFollowWaypoints(waypointsForRos);
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
          onDirectionDrag={handleDirectionDrag}
          onDirectionDragEnd={handleDirectionDragEnd}
          isAdjustingWaypointDirection={
            (mapMode === 'navigate' && navigate.isDraggingOrientation) ||
            (mapMode === 'route_edit' && waypointEditor.hasActiveRotating)
          }
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
              ? 'Arrastra para fijar la orientación'
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
          onPlayRoute={handlePlayRoute}
          onDeleteRoute={mapRoutes.onDeleteRoute}
          isEditingWaypoints={mapMode === 'route_edit' && editingRouteId !== null}
          onAcceptWaypoints={() => {
            if (editingRouteId && waypointEditor.waypoints.length > 0) {
              mapRoutes.saveWaypoints(
                editingRouteId,
                waypointEditor.waypoints
              );
            } else if (editingRouteId) {
              Alert.alert(
                'Ruta',
                'Agrega al menos un waypoint antes de guardar.'
              );
            }

            waypointEditor.clearWaypoints();
            setEditingRouteId(null);
            setMapMode('route_list');
          }}
        />
      )}

      <RouteModal {...mapRoutes.addModalProps} />
      <RouteModal {...mapRoutes.editModalProps} />

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