import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, G, Line, Polygon } from 'react-native-svg';
import { Colors } from '../../../lib/core/constants/Colors';
import { MapPolygon, MapVectorData, WaypointPoint } from '../../../lib/core/types';
import { pixelToWorld, worldToSvgCoords } from '../../../lib/core/utils/mapCoordinates';
import MapLoadingIndicator from '../atoms/MapLoadingIndicator';
import WaypointMarker from '../atoms/WaypointMarker';

const SCALE_FACTOR = 5.0;
const ARROW_COLOR = '#00E5FF';

export interface RobotPose {
  worldX: number;
  worldY: number;
}

export interface GoalPoint {
  worldX: number;
  worldY: number;
}

interface MapViewerProps {
  mapData: MapVectorData | null;
  loading?: boolean;
  error?: string | null;
  renderOverlay?: () => React.ReactNode;
  onPointTap?: (
    worldX: number,
    worldY: number,
    pixelX: number,
    pixelY: number
  ) => void;
  onDirectionDrag?: (
    worldX: number,
    worldY: number,
    pixelX: number,
    pixelY: number
  ) => void;
  onDirectionDragEnd?: () => void;
  isAdjustingWaypointDirection?: boolean;
  robotPose?: RobotPose | null;
  goalPoint?: GoalPoint | null;
  waypoints?: WaypointPoint[];
  showInfoBar?: boolean;
}

function pointsToSvgString(points: [number, number][], _height: number): string {
  return points
    .map(([x, y]) => `${x * SCALE_FACTOR},${y * SCALE_FACTOR}`)
    .join(' ');
}

function arrowheadPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  size: number = 22
): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const tip = { x: x2, y: y2 };
  const left = {
    x: x2 - size * Math.cos(angle - Math.PI / 6),
    y: y2 - size * Math.sin(angle - Math.PI / 6),
  };
  const right = {
    x: x2 - size * Math.cos(angle + Math.PI / 6),
    y: y2 - size * Math.sin(angle + Math.PI / 6),
  };
  return `${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`;
}

export default function MapViewer({
  mapData,
  loading = false,
  error = null,
  renderOverlay,
  onPointTap,
  onDirectionDrag,
  onDirectionDragEnd,
  isAdjustingWaypointDirection = false,
  robotPose = null,
  goalPoint = null,
  waypoints = [],
  showInfoBar = true,
}: MapViewerProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

  const handleReset = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    rotation.value = withSpring(0);
    savedRotation.value = 0;
  };

  const handleTap = (
    tapX: number,
    tapY: number,
    currentTranslateX: number,
    currentTranslateY: number,
    currentScale: number
  ) => {
    if (!onPointTap || !mapData) return;

    const svgX = (tapX - currentTranslateX) / currentScale;
    const svgY = (tapY - currentTranslateY) / currentScale;
    const pixelX = svgX / SCALE_FACTOR;
    const pixelY = svgY / SCALE_FACTOR;

    const { worldX, worldY } = pixelToWorld(
      pixelX,
      pixelY,
      mapData.metadata as any
    );

    onPointTap(worldX, worldY, Math.round(pixelX), Math.round(pixelY));
  };

  const handleDragPoint = (
    dragX: number,
    dragY: number,
    currentTranslateX: number,
    currentTranslateY: number,
    currentScale: number
  ) => {
    if (!onDirectionDrag || !mapData) return;

    const svgX = (dragX - currentTranslateX) / currentScale;
    const svgY = (dragY - currentTranslateY) / currentScale;
    const pixelX = svgX / SCALE_FACTOR;
    const pixelY = svgY / SCALE_FACTOR;

    const { worldX, worldY } = pixelToWorld(
      pixelX,
      pixelY,
      mapData.metadata as any
    );

    onDirectionDrag(worldX, worldY, Math.round(pixelX), Math.round(pixelY));
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (isAdjustingWaypointDirection && onDirectionDrag) {
        runOnJS(handleDragPoint)(
          e.x,
          e.y,
          translateX.value,
          translateY.value,
          scale.value
        );
        return;
      }

      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      if (isAdjustingWaypointDirection) {
        if (onDirectionDragEnd) {
          runOnJS(onDirectionDragEnd)();
        }
        return;
      }

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
      'worklet';
      runOnJS(handleReset)();
    });

  const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd((e) => {
      'worklet';
      runOnJS(handleTap)(
        e.x,
        e.y,
        translateX.value,
        translateY.value,
        scale.value
      );
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

  const renderArrow = () => {
    if (!robotPose || !goalPoint) return null;

    const from = worldToSvgCoords(
      robotPose.worldX,
      robotPose.worldY,
      metadata as any,
      SCALE_FACTOR
    );
    const to = worldToSvgCoords(
      goalPoint.worldX,
      goalPoint.worldY,
      metadata as any,
      SCALE_FACTOR
    );

    const GOAL_RADIUS = 12;

    const dx = to.svgX - from.svgX;
    const dy = to.svgY - from.svgY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const shortenBy = 20;
    const ratio = dist > shortenBy ? (dist - shortenBy) / dist : 0;
    const lineEndX = from.svgX + dx * ratio;
    const lineEndY = from.svgY + dy * ratio;

    return (
      <G>
        <Line
          x1={from.svgX}
          y1={from.svgY}
          x2={lineEndX}
          y2={lineEndY}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth={6}
          strokeDasharray="12,8"
        />
        <Line
          x1={from.svgX}
          y1={from.svgY}
          x2={lineEndX}
          y2={lineEndY}
          stroke={ARROW_COLOR}
          strokeWidth={3}
          strokeDasharray="12,8"
          strokeOpacity={0.95}
        />
        <Polygon
          points={arrowheadPoints(from.svgX, from.svgY, to.svgX, to.svgY, 22)}
          fill={ARROW_COLOR}
        />
        <Circle cx={from.svgX} cy={from.svgY} r={14} fill="#FFFFFF" opacity={0.95} />
        <Circle cx={from.svgX} cy={from.svgY} r={9} fill="#FFD600" />
        <Line
          x1={to.svgX - GOAL_RADIUS}
          y1={to.svgY - GOAL_RADIUS}
          x2={to.svgX + GOAL_RADIUS}
          y2={to.svgY + GOAL_RADIUS}
          stroke="#FF4444"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Line
          x1={to.svgX + GOAL_RADIUS}
          y1={to.svgY - GOAL_RADIUS}
          x2={to.svgX - GOAL_RADIUS}
          y2={to.svgY + GOAL_RADIUS}
          stroke="#FF4444"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </G>
    );
  };

  return (
    <View style={styles.container}>
      {showInfoBar && (
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>Res: {metadata.resolution} m/px</Text>
          <Text style={styles.infoText}>
            {metadata.width_px} × {metadata.height_px} px
          </Text>
          <Text style={styles.infoHint}>Doble tap = reset</Text>
        </View>
      )}

      <GestureDetector gesture={gesture}>
        <View style={styles.viewport}>
          <Animated.View style={animatedStyle}>
            <Svg width={svgWidth} height={svgHeight}>
              <G>
                {renderLayer(layers.free_space.polygons, layers.free_space.color)}
                {renderLayer(layers.unknown.polygons, layers.unknown.color)}
                {renderLayer(layers.obstacles.polygons, layers.obstacles.color)}
                {renderArrow()}
              </G>
            </Svg>

            {renderOverlay && renderOverlay()}

            {waypoints.map((wp, i) => {
              const svgX = wp.pixelX * SCALE_FACTOR;
              const svgY = wp.pixelY * SCALE_FACTOR;

              return (
                <WaypointMarker
                  key={i}
                  svgX={svgX}
                  svgY={svgY}
                  confirmed={wp.confirmed}
                  orientationAngle={wp.orientationAngle}
                  number={i + 1}
                />
              );
            })}
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  infoBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 8 },
  infoText: { color: Colors.primary },
  infoHint: { color: Colors.textSecondary },
  viewport: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: Colors.error },
  placeholderText: { color: Colors.textSecondary },
});