import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { G, Polygon } from 'react-native-svg';
import { Colors } from '../../../lib/core/constants/Colors';
import { MapPolygon, MapVectorData } from '../../../lib/core/types';
import { pixelToWorld } from '../../../lib/core/utils/mapCoordinates';
import MapLoadingIndicator from '../atoms/MapLoadingIndicator';

const SCALE_FACTOR = 5.0;

interface MapViewerProps {
  mapData: MapVectorData | null;
  loading?: boolean;
  error?: string | null;
  renderOverlay?: () => React.ReactNode;
  onPointTap?: (worldX: number, worldY: number, pixelX: number, pixelY: number) => void;
}

function pointsToSvgString(points: [number, number][], height: number): string {
  return points
    .map(([x, y]) => `${x * SCALE_FACTOR},${(height - y) * SCALE_FACTOR}`)
    .join(' ');
}

export default function MapViewer({
  mapData,
  loading = false,
  error = null,
  renderOverlay,
  onPointTap,
}: MapViewerProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const next = savedScale.value * e.scale;
      scale.value = Math.min(Math.max(next, 0.1), 10.0);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const rotationGesture = Gesture.Rotation()
    .onUpdate((e) => {
      rotation.value = savedRotation.value + e.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(1);
      savedScale.value = 1;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      rotation.value = withSpring(0);
      savedRotation.value = 0;
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd((e) => {
      if (!onPointTap || !mapData) return;

      const svgX = (e.x - translateX.value) / scale.value;
      const svgY = (e.y - translateY.value) / scale.value;

      const pixelX = svgX / SCALE_FACTOR;
      const pixelY = svgY / SCALE_FACTOR;

      const { worldX, worldY } = pixelToWorld(
        pixelX,
        pixelY,
        mapData.metadata as any
      );

      onPointTap(worldX, worldY, Math.round(pixelX), Math.round(pixelY));
    });

  const gesture = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    rotationGesture,
    Gesture.Exclusive(doubleTap, singleTap)
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));

  if (loading) return <MapLoadingIndicator />;

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!mapData) {
    return (
      <View style={styles.center}>
        <Text style={styles.placeholderText}>Sin mapa disponible</Text>
      </View>
    );
  }

  const { metadata, layers } = mapData;
  const svgWidth = metadata.width_px * SCALE_FACTOR;
  const svgHeight = metadata.height_px * SCALE_FACTOR;

  const renderLayer = (polygons: MapPolygon[], color: string) =>
    polygons.map((poly, i) => (
      <Polygon
        key={i}
        points={pointsToSvgString(poly.exterior, metadata.height_px)}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    ));

  return (
    // ✅ Sin GestureHandlerRootView — ya existe en _layout.tsx
    <View style={styles.container}>
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>Res: {metadata.resolution} m/px</Text>
        <Text style={styles.infoText}>
          {metadata.width_px} × {metadata.height_px} px
        </Text>
        <Text style={styles.infoHint}>Doble tap = reset</Text>
      </View>

      <GestureDetector gesture={gesture}>
        <View style={styles.viewport}>
          <Animated.View style={animatedStyle}>
            <Svg
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            >
              <G>
                {renderLayer(layers.free_space.polygons, layers.free_space.color)}
                {renderLayer(layers.unknown.polygons, layers.unknown.color)}
                {renderLayer(layers.obstacles.polygons, layers.obstacles.color)}
              </G>
            </Svg>
            {renderOverlay && renderOverlay()}
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  infoText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  infoHint: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
  viewport: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
    padding: 24,
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});