import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../lib/core/constants/Colors';
import { MapMode } from '../../lib/core/types';
import { worldToPixel } from '../../lib/core/utils/mapCoordinates';
import {
  hapticError,
  hapticLight,
  hapticSelection,
  hapticSuccess,
  hapticWarning,
} from '../../lib/core/utils/haptics';
import { useCameraConnectionContext } from '../../lib/modules/camera/context/CameraConnectionContext';
import { useBottomSheet } from '../../lib/modules/maps/hooks/useBottomSheet';
import { useMapDetail } from '../../lib/modules/maps/hooks/useMapDetail';
import { useMapRoutes } from '../../lib/modules/maps/hooks/useMapRoutes';
import { useNavigateMode } from '../../lib/modules/maps/hooks/useNavigateMode';
import { useOperationMode } from '../../lib/modules/maps/hooks/useOperationMode';
import { useWaypointEditor } from '../../lib/modules/maps/hooks/useWaypointEditor';
import { RouteModal } from '../../src/components/molecules/RouteModal';
import { ActionStatusAlert } from '../../src/components/molecules/ActionStatusAlert';
import MapActionButton from '../../src/components/atoms/MapActionButton';
import { ModeChangeAlert } from '../../src/components/molecules/ModeChangeAlert';
import { MapBottomSheet } from '../../src/components/organisms/MapBottomSheet';
import MapViewer from '../../src/components/organisms/MapViewer';

type StatusAlertState = {
  visible: boolean;
  title: string;
  message: string;
  variant: 'success' | 'warning' | 'error' | 'info';
};

function sanitizeTimeInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

export default function MapDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { mapData, mapName, loading: mapLoading, error: mapError } =
    useMapDetail(id as string);

  const navigate = useNavigateMode();
  const waypointEditor = useWaypointEditor();

  const {
    connectionStatus,
    stopRobot,
    sendNavigateToPose,
    sendFollowWaypoints,
  } = useCameraConnectionContext();

  const [mapMode, setMapMode] = useState<MapMode>('idle');
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [pendingPlayRouteId, setPendingPlayRouteId] = useState<string | null>(null);

  const [showCreateRouteModal, setShowCreateRouteModal] = useState(false);
  const [routeNameDraft, setRouteNameDraft] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [executeAt, setExecuteAt] = useState('');
  const [recordRoute, setRecordRoute] = useState(false);

  const [statusAlert, setStatusAlert] = useState<StatusAlertState>({
    visible: false,
    title: '',
    message: '',
    variant: 'info',
  });

  const [isNavigatingNow, setIsNavigatingNow] = useState(false);
  const [navigatingDots, setNavigatingDots] = useState('');

  const bottomSheet = useBottomSheet();
  const mapRoutes = useMapRoutes(id as string);
  const opMode = useOperationMode();

  const commandsConnected = connectionStatus.commands === 'connected';

  useEffect(() => {
    if (!isNavigatingNow) {
      setNavigatingDots('');
      return;
    }

    const frames = ['', '.', '..', '...'];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % frames.length;
      setNavigatingDots(frames[index]);
    }, 450);

    return () => clearInterval(interval);
  }, [isNavigatingNow]);

  const showStatus = (
    title: string,
    message: string,
    variant: StatusAlertState['variant'] = 'info'
  ) => {
    if (variant === 'success') {
      void hapticSuccess();
    } else if (variant === 'warning') {
      void hapticWarning();
    } else if (variant === 'error') {
      void hapticError();
    } else {
      void hapticLight();
    }

    setStatusAlert({
      visible: true,
      title,
      message,
      variant,
    });
  };

  const closeStatus = () => {
    setStatusAlert((prev) => ({ ...prev, visible: false }));
  };

  const resetRouteForm = () => {
    setEditingRouteId(null);
    setRouteNameDraft('');
    setSelectedDays([]);
    setExecuteAt('');
    setRecordRoute(false);
    waypointEditor.clearWaypoints();
  };

  const openCreateRoute = () => {
    void hapticLight();
    resetRouteForm();
    setShowCreateRouteModal(true);
    setMapMode('route_edit');
  };

  const closeCreateRoute = () => {
    void hapticLight();
    setShowCreateRouteModal(false);
    resetRouteForm();
    setMapMode('route_list');
    bottomSheet.expandBottomSheet();
  };

  const openEditRoute = (routeId: string) => {
    void hapticLight();

    const routeData = mapRoutes.getRouteEditData(routeId);
    if (!routeData) {
      showStatus(
        'Ruta no encontrada',
        'No se pudieron cargar los datos de la ruta.',
        'error'
      );
      return;
    }

    const hydratedWaypoints = routeData.waypoints.map((wp) => {
      if (!mapData?.metadata) return wp;

      const { pixelX, pixelY } = worldToPixel(
        wp.worldX,
        wp.worldY,
        mapData.metadata as any
      );

      return {
        ...wp,
        pixelX,
        pixelY,
      };
    });

    setEditingRouteId(routeData.id);
    setRouteNameDraft(routeData.name);
    setSelectedDays(routeData.selectedDays);
    setExecuteAt(routeData.executeAt);
    setRecordRoute(routeData.recordRoute);
    waypointEditor.loadWaypoints(hydratedWaypoints);
    setShowCreateRouteModal(true);
    setMapMode('route_edit');
  };

  const toggleDay = (day: string) => {
    void hapticSelection();
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((item) => item !== day)
        : [...prev, day]
    );
  };

  const handleConfirmCreateRoute = async () => {
    if (!routeNameDraft.trim()) {
      void hapticWarning();
      Alert.alert('Ruta', 'Escribe un nombre para la ruta.');
      return;
    }

    if (waypointEditor.waypoints.length === 0) {
      void hapticWarning();
      Alert.alert('Ruta', 'Agrega al menos un waypoint en el mapa.');
      return;
    }

    try {
      if (editingRouteId) {
        const updated = await mapRoutes.updateRoute({
          routeId: editingRouteId,
          name: routeNameDraft,
          selectedDays,
          executeAt,
          recordRoute,
          waypoints: waypointEditor.waypoints,
        });

        if (!updated) {
          showStatus(
            'No se pudo guardar',
            'La ruta no se pudo actualizar correctamente.',
            'error'
          );
          return;
        }

        setShowCreateRouteModal(false);
        resetRouteForm();
        setMapMode('route_list');
        bottomSheet.expandBottomSheet();

        showStatus(
          'Ruta actualizada',
          'La ruta se actualizó correctamente.',
          'success'
        );
        return;
      }

      const created = await mapRoutes.createRoute({
        name: routeNameDraft,
        selectedDays,
        executeAt,
        recordRoute,
        waypoints: waypointEditor.waypoints,
      });

      if (!created) {
        showStatus(
          'No se pudo guardar',
          'La ruta no se pudo guardar correctamente.',
          'error'
        );
        return;
      }

      setShowCreateRouteModal(false);
      resetRouteForm();
      setMapMode('route_list');
      bottomSheet.expandBottomSheet();

      showStatus(
        'Ruta guardada',
        `La ruta "${created.name}" se guardó correctamente.`,
        'success'
      );
    } catch (error) {
      console.error(error);
      showStatus(
        editingRouteId ? 'No se pudo actualizar' : 'No se pudo guardar',
        editingRouteId
          ? 'Ocurrió un error al actualizar la ruta.'
          : 'Ocurrió un error al guardar la ruta.',
        'error'
      );
    }
  };

  const handleMapTap = (
    worldX: number,
    worldY: number,
    pixelX: number,
    pixelY: number
  ) => {
    if (isNavigatingNow) return;

    if (mapMode === 'navigate') {
      if (!navigate.navPoint) {
        void hapticSelection();
        navigate.handleFirstTap(pixelX, pixelY, worldX, worldY);
      } else if (!navigate.navPoint.confirmed) {
        void hapticSelection();
        navigate.confirmOrientation();
      }
      return;
    }

    if (mapMode === 'route_edit') {
      if (!waypointEditor.hasActiveRotating) {
        void hapticSelection();
        waypointEditor.addWaypointFirstTap(pixelX, pixelY, worldX, worldY);
      } else {
        void hapticSelection();
        waypointEditor.confirmWaypointOrientation();
      }
    }
  };

  const handleDirectionDrag = (
    _worldX: number,
    _worldY: number,
    pixelX: number,
    pixelY: number
  ) => {
    if (isNavigatingNow) return;

    if (mapMode === 'navigate') {
      if (!navigate.navPoint || navigate.navPoint.confirmed) return;
      navigate.updateOrientation(pixelX, pixelY);
      return;
    }

    if (mapMode !== 'route_edit') return;
    if (!waypointEditor.hasActiveRotating) return;

    waypointEditor.updateActiveWaypointOrientation(pixelX, pixelY);
  };

  const handlePlayRoute = (routeId: string) => {
    void hapticLight();
    setPendingPlayRouteId(routeId);
  };

  const confirmPlayRoute = () => {
    if (!pendingPlayRouteId) return;

    const route = mapRoutes.routes.find((r) => r.id === pendingPlayRouteId);
    if (!route?.waypoints?.length) {
      setPendingPlayRouteId(null);
      showStatus(
        'Ruta vacía',
        'La ruta no tiene waypoints para ejecutarse.',
        'warning'
      );
      return;
    }

    if (!commandsConnected) {
      setPendingPlayRouteId(null);
      showStatus(
        'Sin conexión',
        'No hay conexión de comandos con el robot.',
        'warning'
      );
      return;
    }

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

    if (waypointsForRos.length === 0) {
      setPendingPlayRouteId(null);
      showStatus(
        'Ruta inválida',
        'No se pudieron preparar los waypoints de la ruta.',
        'error'
      );
      return;
    }

    sendFollowWaypoints(waypointsForRos);
    setPendingPlayRouteId(null);

    showStatus(
      'Ruta enviada',
      `La ruta "${route.name}" se envió para ejecutarse.`,
      'success'
    );
  };

  const handleNavigateNow = () => {
    if (!navigate.navPoint) return;

    if (!commandsConnected) {
      showStatus(
        'Sin conexión',
        'No hay conexión de comandos con el robot.',
        'warning'
      );
      return;
    }

    sendNavigateToPose(
      navigate.navPoint.worldX,
      navigate.navPoint.worldY,
      navigate.navPoint.quaternion
    );

    navigate.reset();
    setIsNavigatingNow(true);

    showStatus(
      'Navegación enviada',
      'El punto de navegación fue enviado al robot.',
      'success'
    );
  };

  const handleCancelNavigation = () => {
    void hapticLight();
    stopRobot();
    setIsNavigatingNow(false);
    navigate.reset();
    setMapMode('idle');

    showStatus(
      'Navegación cancelada',
      'Se envió la orden para detener el movimiento del robot.',
      'info'
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapCanvas}>
        <MapViewer
          mapData={mapData}
          loading={mapLoading}
          error={mapError}
          onPointTap={handleMapTap}
          onDirectionDrag={handleDirectionDrag}
          isAdjustingWaypointDirection={
            !isNavigatingNow &&
            ((mapMode === 'navigate' &&
              !!navigate.navPoint &&
              !navigate.navPoint.confirmed) ||
              (mapMode === 'route_edit' && waypointEditor.hasActiveRotating))
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
              void hapticLight();
              setMapMode('route_list');
              bottomSheet.expandBottomSheet();
            }}
          />
          <MapActionButton
            label="NAVEGAR"
            icon={require('../../assets/images/mapMark.png')}
            onPress={() => {
              void hapticLight();
              setIsNavigatingNow(false);
              setMapMode('navigate');
            }}
          />
        </View>
      )}

      {mapMode === 'navigate' && (
        <View style={styles.navigateBar}>
          {isNavigatingNow ? (
            <>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelNavigation}
              >
                <Text style={styles.cancelText}>CANCELAR</Text>
              </TouchableOpacity>

              <Text style={styles.navigatingTitle}>
                {`Navegando${navigatingDots}`}
              </Text>

              <Text style={styles.navigateHint}>
                El robot está ejecutando la navegación.
              </Text>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  void hapticLight();
                  navigate.reset();
                  setMapMode('idle');
                }}
              >
                <Text style={styles.cancelText}>CANCELAR</Text>
              </TouchableOpacity>

              {navigate.navPoint?.confirmed && (
                <TouchableOpacity
                  style={styles.navigateButton}
                  onPress={handleNavigateNow}
                >
                  <Text style={styles.navigateText}>NAVEGAR</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.navigateHint}>
                {!navigate.navPoint
                  ? 'Selecciona un punto de navegación'
                  : !navigate.navPoint.confirmed
                  ? 'Arrastra para orientar y toca para confirmar'
                  : 'Listo para navegar'}
              </Text>
            </>
          )}
        </View>
      )}

      {!showCreateRouteModal &&
        (mapMode === 'route_list' || mapMode === 'route_edit') && (
          <MapBottomSheet
            mapName={mapName || `Mapa ${id}`}
            bottomSheetAnimation={bottomSheet.bottomSheetAnimation}
            isExpanded={bottomSheet.isExpanded}
            panHandlers={bottomSheet.panHandlers}
            routes={mapRoutes.routes}
            onAddRoute={openCreateRoute}
            onEditRouteWaypoints={openEditRoute}
            onPlayRoute={handlePlayRoute}
            onDeleteRoute={mapRoutes.onDeleteRoute}
            isEditingWaypoints={mapMode === 'route_edit' && editingRouteId !== null}
            onAcceptWaypoints={async () => {
              if (!editingRouteId) {
                waypointEditor.clearWaypoints();
                setMapMode('route_list');
                return;
              }

              if (waypointEditor.waypoints.length === 0) {
                void hapticWarning();
                Alert.alert('Ruta', 'Agrega al menos un waypoint antes de guardar.');
                return;
              }

              const ok = await mapRoutes.saveWaypoints(
                editingRouteId,
                waypointEditor.waypoints
              );

              if (ok) {
                showStatus(
                  'Ruta guardada',
                  'Los waypoints de la ruta se guardaron correctamente.',
                  'success'
                );
              } else {
                showStatus(
                  'No se pudo guardar',
                  'Ocurrió un error al guardar los waypoints.',
                  'error'
                );
              }

              waypointEditor.clearWaypoints();
              setEditingRouteId(null);
              setMapMode('route_list');
            }}
          />
        )}

      <RouteModal
        visible={showCreateRouteModal}
        routeName={routeNameDraft}
        onChangeRouteName={setRouteNameDraft}
        selectedDays={selectedDays}
        onToggleDay={toggleDay}
        executeAt={executeAt}
        onChangeExecuteAt={(value) => setExecuteAt(sanitizeTimeInput(value))}
        recordRoute={recordRoute}
        onToggleRecordRoute={() => {
          void hapticSelection();
          setRecordRoute((prev) => !prev);
        }}
        onClose={closeCreateRoute}
        onConfirm={handleConfirmCreateRoute}
      />

      <Modal
        visible={pendingPlayRouteId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingPlayRouteId(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>¿DESEA EJECUTAR{'\n'}LA RUTA?</Text>

            <TouchableOpacity
              style={styles.confirmPrimaryBtn}
              onPress={confirmPlayRoute}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmPrimaryText}>CONFIRMAR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmSecondaryBtn}
              onPress={() => {
                void hapticLight();
                setPendingPlayRouteId(null);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmSecondaryText}>CANCELAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ActionStatusAlert
        visible={statusAlert.visible}
        title={statusAlert.title}
        message={statusAlert.message}
        variant={statusAlert.variant}
        onConfirm={closeStatus}
      />

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
  navigatingTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  navigateHint: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },

  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
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