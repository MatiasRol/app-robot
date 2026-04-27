import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { MapMode } from '../../../core/types';
import { useCameraConnectionContext } from '../../camera/context/CameraConnectionContext';
import { useBottomSheet } from './useBottomSheet';
import { useMapDetail } from './useMapDetail';
import { useMapDetailOverlayActions } from './useMapDetailOverlayActions';
import { useMapDetailStatusAlert } from './useMapDetailStatusAlert';
import { useMapInteraction } from './useMapInteraction';
import { useMapNavigationExecution } from './useMapNavigationExecution';
import { useMapRouteExecution } from './useMapRouteExecution';
import { useMapRouteForm } from './useMapRouteForm';
import { useMapRoutes } from './useMapRoutes';
import { useMapRouteSubmit } from './useMapRouteSubmit';
import { useMapViewState } from './useMapViewState';
import { useMapWaypointSave } from './useMapWaypointSave';
import { useNavigateMode } from './useNavigateMode';
import { useOperationMode } from './useOperationMode';
import { useWaypointEditor } from './useWaypointEditor';

function sanitizeTimeInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

export function useMapDetailController(onBack: () => void) {
  const { id } = useLocalSearchParams();

  const { mapData, mapName, loading: mapLoading, error: mapError } =
    useMapDetail(id as string);

  const navigate = useNavigateMode();
  const waypointEditor = useWaypointEditor();

  const {
    connectionStatus,
    stopRobot,
    sendRecordingCommand,
    sendNavigateToPose,
    sendFollowWaypoints,
  } = useCameraConnectionContext();

  const [mapMode, setMapMode] = React.useState<MapMode>('idle');

  const bottomSheet = useBottomSheet();
  const mapRoutes = useMapRoutes(id as string);
  const opMode = useOperationMode();

  const commandsConnected = connectionStatus.commands === 'connected';

  const { statusAlert, showStatus, closeStatus } = useMapDetailStatusAlert();

  const {
    editingRouteId,
    showCreateRouteModal,
    routeNameDraft,
    selectedDays,
    executeAt,
    recordRoute,
    setRouteNameDraft,
    setExecuteAt,
    closeCreateRoute,
    openCreateRoute,
    openEditRoute,
    toggleDay,
    handleToggleRecordRoute,
  } = useMapRouteForm({
    commandsConnected,
    sendRecordingCommand,
    setMapMode,
    expandBottomSheet: bottomSheet.expandBottomSheet,
    showStatus,
    getRouteEditData: mapRoutes.getRouteEditData,
    mapMetadata: mapData?.metadata as any,
    waypointEditor,
  });

  const {
    pendingPlayRouteId,
    handlePlayRoute,
    cancelPlayRoute,
    confirmPlayRoute,
  } = useMapRouteExecution({
    routes: mapRoutes.routes,
    commandsConnected,
    sendFollowWaypoints,
    showStatus,
  });

  const {
    isNavigatingNow,
    navigatingDots,
    handleNavigateNow,
    handleCancelNavigation,
    resetNavigationExecution,
  } = useMapNavigationExecution({
    commandsConnected,
    navPoint: navigate.navPoint,
    resetNavigate: navigate.reset,
    setMapMode,
    stopRobot,
    sendNavigateToPose,
    showStatus,
  });

  const { handleConfirmCreateRoute } = useMapRouteSubmit({
    editingRouteId,
    routeNameDraft,
    selectedDays,
    executeAt,
    recordRoute,
    waypoints: waypointEditor.waypoints,
    createRoute: mapRoutes.createRoute,
    updateRoute: mapRoutes.updateRoute,
    closeCreateRoute,
    showStatus,
  });

  const { handleAcceptWaypoints } = useMapWaypointSave({
    editingRouteId,
    waypoints: waypointEditor.waypoints,
    clearWaypoints: waypointEditor.clearWaypoints,
    setMapMode,
    saveWaypoints: mapRoutes.saveWaypoints,
    showStatus,
  });

  const {
    navigateHint,
    isAdjustingWaypointDirection,
    visibleWaypoints,
  } = useMapViewState({
    mapMode,
    isNavigatingNow,
    navigate,
    waypointEditor,
  });

  const { handleMapTap, handleDirectionDrag } = useMapInteraction({
    mapMode,
    isNavigatingNow,
    navigate,
    waypointEditor,
  });

  const {
    handleRoutesPress,
    handleNavigatePress,
    handleCancelIdleNavigate,
    handleCancelRunningNavigate,
  } = useMapDetailOverlayActions({
    setMapMode,
    expandBottomSheet: bottomSheet.expandBottomSheet,
    resetNavigationExecution,
    resetNavigate: navigate.reset,
    handleCancelNavigation,
  });

  const handleExecuteAtChange = (value: string) => {
    setExecuteAt(sanitizeTimeInput(value));
  };

  return {
    mapViewerProps: {
      mapData,
      loading: mapLoading,
      error: mapError,
      onPointTap: handleMapTap,
      onDirectionDrag: handleDirectionDrag,
      isAdjustingWaypointDirection,
      waypoints: visibleWaypoints,
    },

    overlayProps: {
      onBack,
      mapMode,
      setMapMode,
      mapName,
      mapIdLabel: `Mapa ${id}`,
      bottomSheetAnimation: bottomSheet.bottomSheetAnimation,
      isExpanded: bottomSheet.isExpanded,
      panHandlers: bottomSheet.panHandlers,
      routes: mapRoutes.routes,
      onAddRoute: openCreateRoute,
      onEditRouteWaypoints: openEditRoute,
      onPlayRoute: handlePlayRoute,
      onDeleteRoute: mapRoutes.onDeleteRoute,
      isEditingWaypoints: mapMode === 'route_edit' && editingRouteId !== null,
      onAcceptWaypoints: handleAcceptWaypoints,
      showCreateRouteModal,
      routeName: routeNameDraft,
      onChangeRouteName: setRouteNameDraft,
      selectedDays,
      onToggleDay: toggleDay,
      executeAt,
      onChangeExecuteAt: handleExecuteAtChange,
      recordRoute,
      onToggleRecordRoute: handleToggleRecordRoute,
      onCloseRouteModal: closeCreateRoute,
      onConfirmRouteModal: handleConfirmCreateRoute,
      showRouteExecutionConfirm: pendingPlayRouteId !== null,
      onConfirmRouteExecution: confirmPlayRoute,
      onCancelRouteExecution: cancelPlayRoute,
      isNavigatingNow,
      navigatingDots,
      hasConfirmedPoint: !!navigate.navPoint?.confirmed,
      navigateHint,
      onRoutesPress: handleRoutesPress,
      onNavigatePress: handleNavigatePress,
      onCancelIdleNavigate: handleCancelIdleNavigate,
      onCancelRunningNavigate: handleCancelRunningNavigate,
      onConfirmNavigate: handleNavigateNow,
      statusAlert,
      onCloseStatus: closeStatus,
      modeAlertProps: opMode.alertProps,
    },
  };
}