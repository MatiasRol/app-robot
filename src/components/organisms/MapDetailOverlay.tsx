import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MapMode, Route } from '../../../lib/core/types';
import { Colors } from '../../../lib/core/constants/Colors';
import { MapDetailBackButton } from '../atoms/MapDetailBackButton';
import { ActionStatusAlert } from '../molecules/ActionStatusAlert';
import { MapNavigateBar } from '../molecules/MapNavigateBar';
import { ModeChangeAlert } from '../molecules/ModeChangeAlert';
import { MapFloatingActions } from './MapFloatingActions';
import { MapRouteWorkflow } from './MapRouteWorkflow';

interface MapDetailOverlayProps {
  onBack: () => void;

  mapMode: MapMode;
  setMapMode: (mode: MapMode) => void;

  mapName?: string | null;
  mapIdLabel: string;

  bottomSheetAnimation: any;
  isExpanded: boolean;
  panHandlers: any;

  routes: Route[];
  onAddRoute: () => void;
  onEditRouteWaypoints: (routeId: string) => void;
  onPlayRoute: (routeId: string) => void;
  onDeleteRoute: (routeId: string, routeName: string) => void;
  isEditingWaypoints: boolean;
  onAcceptWaypoints: () => void | Promise<void>;

  showCreateRouteModal: boolean;
  routeName: string;
  onChangeRouteName: (value: string) => void;
  selectedDays: string[];
  onToggleDay: (day: string) => void;
  executeAt: string;
  onChangeExecuteAt: (value: string) => void;
  recordRoute: boolean;
  onToggleRecordRoute: () => void;
  onCloseRouteModal: () => void;
  onConfirmRouteModal: () => void | Promise<void>;

  showRouteExecutionConfirm: boolean;
  onConfirmRouteExecution: () => void;
  onCancelRouteExecution: () => void;

  isNavigatingNow: boolean;
  navigatingDots: string;
  hasConfirmedPoint: boolean;
  navigateHint: string;
  onRoutesPress: () => void;
  onNavigatePress: () => void;
  onCancelIdleNavigate: () => void;
  onCancelRunningNavigate: () => void;
  onConfirmNavigate: () => void;

  statusAlert: {
    visible: boolean;
    title: string;
    message: string;
    variant: 'success' | 'warning' | 'error' | 'info';
  };
  onCloseStatus: () => void;

  modeAlertProps: any;

  showStopRecordingButton: boolean;
  onStopRecording: () => void;
}

export function MapDetailOverlay({
  onBack,
  mapMode,
  mapName,
  mapIdLabel,
  bottomSheetAnimation,
  isExpanded,
  panHandlers,
  routes,
  onAddRoute,
  onEditRouteWaypoints,
  onPlayRoute,
  onDeleteRoute,
  isEditingWaypoints,
  onAcceptWaypoints,
  showCreateRouteModal,
  routeName,
  onChangeRouteName,
  selectedDays,
  onToggleDay,
  executeAt,
  onChangeExecuteAt,
  recordRoute,
  onToggleRecordRoute,
  onCloseRouteModal,
  onConfirmRouteModal,
  showRouteExecutionConfirm,
  onConfirmRouteExecution,
  onCancelRouteExecution,
  isNavigatingNow,
  navigatingDots,
  hasConfirmedPoint,
  navigateHint,
  onRoutesPress,
  onNavigatePress,
  onCancelIdleNavigate,
  onCancelRunningNavigate,
  onConfirmNavigate,
  statusAlert,
  onCloseStatus,
  modeAlertProps,
  showStopRecordingButton,
  onStopRecording,
}: MapDetailOverlayProps) {
  return (
    <>
      <MapDetailBackButton onPress={onBack} />

      {showStopRecordingButton && (
        <TouchableOpacity
          style={styles.stopRecordingButton}
          onPress={onStopRecording}
          activeOpacity={0.9}
        >
          <Text style={styles.stopRecordingText}>DETENER GRABACIÓN</Text>
        </TouchableOpacity>
      )}

      <MapFloatingActions
        visible={mapMode === 'idle'}
        onRoutesPress={onRoutesPress}
        onNavigatePress={onNavigatePress}
      />

      <MapNavigateBar
        visible={mapMode === 'navigate'}
        isNavigatingNow={isNavigatingNow}
        navigatingDots={navigatingDots}
        hasConfirmedPoint={hasConfirmedPoint}
        navigateHint={navigateHint}
        onCancelIdle={onCancelIdleNavigate}
        onCancelRunning={onCancelRunningNavigate}
        onNavigate={onConfirmNavigate}
      />

      <MapRouteWorkflow
        mapMode={mapMode}
        showCreateRouteModal={showCreateRouteModal}
        mapName={mapName || ''}
        mapIdLabel={mapIdLabel}
        bottomSheetAnimation={bottomSheetAnimation}
        isExpanded={isExpanded}
        panHandlers={panHandlers}
        routes={routes}
        onAddRoute={onAddRoute}
        onEditRouteWaypoints={onEditRouteWaypoints}
        onPlayRoute={onPlayRoute}
        onDeleteRoute={onDeleteRoute}
        isEditingWaypoints={isEditingWaypoints}
        onAcceptWaypoints={onAcceptWaypoints}
        routeName={routeName}
        onChangeRouteName={onChangeRouteName}
        selectedDays={selectedDays}
        onToggleDay={onToggleDay}
        executeAt={executeAt}
        onChangeExecuteAt={onChangeExecuteAt}
        recordRoute={recordRoute}
        onToggleRecordRoute={onToggleRecordRoute}
        onCloseRouteModal={onCloseRouteModal}
        onConfirmRouteModal={onConfirmRouteModal}
        showRouteExecutionConfirm={showRouteExecutionConfirm}
        onConfirmRouteExecution={onConfirmRouteExecution}
        onCancelRouteExecution={onCancelRouteExecution}
      />

      <ActionStatusAlert
        visible={statusAlert.visible}
        title={statusAlert.title}
        message={statusAlert.message}
        variant={statusAlert.variant}
        onConfirm={onCloseStatus}
      />

      <ModeChangeAlert {...modeAlertProps} />
    </>
  );
}

const styles = StyleSheet.create({
  stopRecordingButton: {
    position: 'absolute',
    top: 54,
    right: 16,
    zIndex: 10,
    backgroundColor: '#D93535',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 6,
  },
  stopRecordingText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});