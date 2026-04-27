import { useRef, useState } from 'react';
import { MapMode, WaypointPoint } from '../../../core/types';
import { worldToPixel } from '../../../core/utils/mapCoordinates';
import {
  hapticLight,
  hapticSelection,
} from '../../../core/utils/haptics';

type RouteEditData = {
  id: string;
  name: string;
  selectedDays: string[];
  executeAt: string;
  recordRoute: boolean;
  waypoints: WaypointPoint[];
};

interface UseMapRouteFormParams {
  commandsConnected: boolean;
  sendRecordingCommand: (value: 'on' | 'off') => void;
  setMapMode: (mode: MapMode) => void;
  expandBottomSheet: () => void;
  showStatus: (
    title: string,
    message: string,
    variant?: 'success' | 'warning' | 'error' | 'info'
  ) => void;
  getRouteEditData: (routeId: string) => RouteEditData | null;
  mapMetadata?: {
    width_px: number;
    height_px: number;
    resolution: number;
    origin: [number, number, number];
  } | null;
  waypointEditor: {
    clearWaypoints: () => void;
    loadWaypoints: (waypoints: WaypointPoint[]) => void;
  };
}

export function useMapRouteForm({
  commandsConnected,
  sendRecordingCommand,
  setMapMode,
  expandBottomSheet,
  showStatus,
  getRouteEditData,
  mapMetadata,
  waypointEditor,
}: UseMapRouteFormParams) {
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [showCreateRouteModal, setShowCreateRouteModal] = useState(false);
  const [routeNameDraft, setRouteNameDraft] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [executeAt, setExecuteAt] = useState('');
  const [recordRoute, setRecordRoute] = useState(false);

  const recordingCommandActiveRef = useRef(false);

  const stopRecordingIfNeeded = () => {
    if (recordingCommandActiveRef.current && commandsConnected) {
      sendRecordingCommand('off');
    }
    recordingCommandActiveRef.current = false;
  };

  const resetRouteForm = () => {
    stopRecordingIfNeeded();
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
    expandBottomSheet();
  };

  const openEditRoute = (routeId: string) => {
    void hapticLight();

    stopRecordingIfNeeded();

    const routeData = getRouteEditData(routeId);
    if (!routeData) {
      showStatus(
        'Ruta no encontrada',
        'No se pudieron cargar los datos de la ruta.',
        'error'
      );
      return;
    }

    const hydratedWaypoints = routeData.waypoints.map((wp) => {
      if (!mapMetadata) return wp;

      const { pixelX, pixelY } = worldToPixel(
        wp.worldX,
        wp.worldY,
        mapMetadata
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

  const handleToggleRecordRoute = () => {
    void hapticSelection();

    const nextValue = !recordRoute;
    setRecordRoute(nextValue);

    if (!commandsConnected) {
      if (nextValue) {
        showStatus(
          'Sin conexión',
          'No hay conexión de comandos para iniciar la grabación.',
          'warning'
        );
      }
      recordingCommandActiveRef.current = false;
      return;
    }

    sendRecordingCommand(nextValue ? 'on' : 'off');
    recordingCommandActiveRef.current = nextValue;
  };

  return {
    editingRouteId,
    showCreateRouteModal,
    routeNameDraft,
    selectedDays,
    executeAt,
    recordRoute,
    setRouteNameDraft,
    setExecuteAt,
    resetRouteForm,
    openCreateRoute,
    closeCreateRoute,
    openEditRoute,
    toggleDay,
    handleToggleRecordRoute,
    stopRecordingIfNeeded,
  };
}