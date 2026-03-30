import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../lib/core/constants/Colors';
import { useBottomSheet } from '../../lib/modules/maps/hooks/useBottomSheet';
import { useMapDetail } from '../../lib/modules/maps/hooks/useMapDetail';
import { useMapRoutes } from '../../lib/modules/maps/hooks/useMapRoutes';
import { useOperationMode } from '../../lib/modules/maps/hooks/useOperationMode';
import MapViewer, { GoalPoint, RobotPose } from '../../src/components/organisms/MapViewer';
import { CoordPanel, TappedPoint } from '../../src/components/molecules/CoordPanel';
import { GoalBanner } from '../../src/components/molecules/GoalBanner';
import { ModeChangeAlert } from '../../src/components/molecules/ModeChangeAlert';
import { RouteModal } from '../../src/components/molecules/RouteModal';
import { MapBottomSheet } from '../../src/components/organisms/MapBottomSheet';

const robotPose: RobotPose = { worldX: -1.5, worldY: -0.8 };

export default function MapDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { mapData, mapName, loading: mapLoading, error: mapError } = useMapDetail(id as string);

  const [tappedPoint, setTappedPoint] = useState<TappedPoint | null>(null);
  const [goalPoint, setGoalPoint] = useState<GoalPoint | null>(null);

  const bottomSheet = useBottomSheet();
  const mapRoutes = useMapRoutes(id as string);
  const opMode = useOperationMode();

  const handlePointTap = (worldX: number, worldY: number, pixelX: number, pixelY: number) => {
    setTappedPoint({ worldX, worldY, pixelX, pixelY });
  };

  const handleConfirmGoal = () => {
    if (tappedPoint) {
      setGoalPoint({ worldX: tappedPoint.worldX, worldY: tappedPoint.worldY });
      setTappedPoint(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <View style={styles.mapCanvas}>
        <MapViewer
          mapData={mapData}
          loading={mapLoading}
          error={mapError}
          onPointTap={handlePointTap}
          robotPose={robotPose}
          goalPoint={goalPoint}
        />
      </View>

      {/* Top bar */}
      <View style={styles.mapNameContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.mapNameBox}>
          <Text style={styles.mapNameText}>{mapName || `Mapa ${id}`}</Text>
        </View>
      </View>

      {/* Overlays */}
      <CoordPanel
        point={tappedPoint}
        onClose={() => setTappedPoint(null)}
        onConfirmGoal={handleConfirmGoal}
      />

      {!tappedPoint && (
        <GoalBanner goalPoint={goalPoint} onClear={() => setGoalPoint(null)} />
      )}

      {/* Bottom sheet */}
      <MapBottomSheet
        bottomSheetAnimation={bottomSheet.bottomSheetAnimation}
        isExpanded={bottomSheet.isExpanded}
        panHandlers={bottomSheet.panHandlers}
        routes={mapRoutes.routes}
        mode={opMode.mode}
        onModeChange={opMode.handleModeChange}
        onAddRoute={mapRoutes.openAddModal}
        onEditRoute={mapRoutes.onEditRoute}
        onDeleteRoute={mapRoutes.onDeleteRoute}
      />

      {/* Modals */}
      <RouteModal {...mapRoutes.addModalProps} />
      <RouteModal {...mapRoutes.editModalProps} />

      {/* Mode change alert */}
      <ModeChangeAlert {...opMode.alertProps} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  mapCanvas: { flex: 1 },
  mapNameContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  mapNameBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 3,
  },
  mapNameText: { fontSize: 16, fontWeight: '600', color: Colors.text },
});