import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../lib/core/constants/Colors';
import { MapMode, WaypointPoint } from '../../lib/core/types';
import { useBottomSheet } from '../../lib/modules/maps/hooks/useBottomSheet';
import { useMapDetail } from '../../lib/modules/maps/hooks/useMapDetail';
import { useMapRoutes } from '../../lib/modules/maps/hooks/useMapRoutes';
import { useOperationMode } from '../../lib/modules/maps/hooks/useOperationMode';
import MapActionButton from '../../src/components/atoms/MapActionButton';
import { ModeChangeAlert } from '../../src/components/molecules/ModeChangeAlert';
import MapViewer, { RobotPose } from '../../src/components/organisms/MapViewer';

const robotPose: RobotPose = { worldX: 0, worldY: 0 };

export default function MapDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { mapData, mapName, loading: mapLoading, error: mapError } = useMapDetail(id as string);

  // ── Modo del mapa ────────────────────────────────────────
  const [mapMode, setMapMode] = useState<MapMode>('idle');

  // ── Navegar: un solo punto ───────────────────────────────
  const [navPoint, setNavPoint] = useState<WaypointPoint | null>(null);

  // ── Rutas: múltiples waypoints ───────────────────────────
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [routeWaypoints, setRouteWaypoints] = useState<WaypointPoint[]>([]);

  const bottomSheet = useBottomSheet();
  const mapRoutes = useMapRoutes(id as string);
  const opMode = useOperationMode();

  const handleCancel = () => {
    setMapMode('idle');
    setNavPoint(null);
    setEditingRouteId(null);
    setRouteWaypoints([]);
  };

  return (
    <View style={styles.container}>

      {/* Mapa full screen */}
      <View style={styles.mapCanvas}>
        <MapViewer
          mapData={mapData}
          loading={mapLoading}
          error={mapError}
          robotPose={robotPose}
        />
      </View>

      {/* Botón volver */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Image
          source={require('../../assets/images/regreso.png')}
          style={{ width: 40, height: 40 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {mapMode === 'idle' && (
      <View style={styles.floatingButtons}>
        <MapActionButton
          label="RUTAS"
          icon={require('../../assets/images/ruta.png')}
          onPress={() => setMapMode('route_list')}
        />
        <MapActionButton
          label="NAVEGAR"
          icon={require('../../assets/images/mapMark.png')}
          onPress={() => setMapMode('navigate')}
        />
      </View>
      )}
      {/* TAREA 4 — Modo navegar UI (placeholder) */}
      {/* TAREA 6 — Bottom sheet rutas (placeholder) */}

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
});