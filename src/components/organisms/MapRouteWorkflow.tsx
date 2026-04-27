import React from 'react';
import { MapMode, Route } from '../../../lib/core/types';
import { RouteModal } from '../molecules/RouteModal';
import { RouteExecutionConfirmModal } from '../molecules/RouteExecutionConfirmModal';
import { MapBottomSheet } from './MapBottomSheet';

interface MapRouteWorkflowProps {
  mapMode: MapMode;
  showCreateRouteModal: boolean;
  mapName: string;
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
}

export function MapRouteWorkflow({
  mapMode,
  showCreateRouteModal,
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
}: MapRouteWorkflowProps) {
  return (
    <>
      {!showCreateRouteModal &&
        (mapMode === 'route_list' || mapMode === 'route_edit') && (
          <MapBottomSheet
            mapName={mapName || mapIdLabel}
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
          />
        )}

      <RouteModal
        visible={showCreateRouteModal}
        routeName={routeName}
        onChangeRouteName={onChangeRouteName}
        selectedDays={selectedDays}
        onToggleDay={onToggleDay}
        executeAt={executeAt}
        onChangeExecuteAt={onChangeExecuteAt}
        recordRoute={recordRoute}
        onToggleRecordRoute={onToggleRecordRoute}
        onClose={onCloseRouteModal}
        onConfirm={onConfirmRouteModal}
      />

      <RouteExecutionConfirmModal
        visible={showRouteExecutionConfirm}
        onConfirm={onConfirmRouteExecution}
        onCancel={onCancelRouteExecution}
      />
    </>
  );
}