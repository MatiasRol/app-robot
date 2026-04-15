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
import Svg, {
  G,
  Image as SvgImage,
  Line,
  Polygon,
  Rect,
} from 'react-native-svg';
import { MapPolygon, MapVectorData, WaypointPoint } from '../../../lib/core/types';
import { pixelToWorld, worldToSvgCoords } from '../../../lib/core/utils/mapCoordinates';
import MapLoadingIndicator from '../atoms/MapLoadingIndicator';
import WaypointMarker from '../atoms/WaypointMarker';

const SCALE_FACTOR = 5.0;

// Colores visuales
const MAP_BACKGROUND_COLOR = '#06102A';
const MAP_FREE_SPACE_COLOR = '#06102A';
const MAP_UNKNOWN_COLOR = '#06102A';
const MAP_OBSTACLE_COLOR = '#89C6DF';
const NAV_ARROW_COLOR = '#00E5FF';
const ROBOT_MARKER_SIZE = 34;

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
  robotPose?: RobotPose | null;
  goalPoint?: GoalPoint | null;
  waypoints?: WaypointPoint[];
}

function pointsToSvgString(points: [number, number][], height: number): string {
  return points
    .map(([x, y]) => `${x * SCALE_FACTOR},${(height - y) * SCALE_FACTOR}`)
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
  robotPose = null,
  goalPoint = null,
  waypoints = [],
}: MapViewerProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const translateX = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);

  const translateY = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);

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
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

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
    currentScale: number,
    currentRotation: number
  ) => {
    if (!onPointTap || !mapData) return;

    // Invertimos correctamente la transformación explícita:
    // translate -> center pivot -> rotate -> scale -> unpivot
    const dx = tapX - currentTranslateX - centerX;
    const dy = tapY - currentTranslateY - centerY;

    const cos = Math.cos(-currentRotation);
    const sin = Math.sin(-currentRotation);

    const rotatedX = dx * cos - dy * sin;
    const rotatedY = dx * sin + dy * cos;

    const unscaledX = rotatedX / currentScale;
    const unscaledY = rotatedY / currentScale;

    const svgX = unscaledX + centerX;
    const svgY = unscaledY + centerY;

    if (svgX < 0 || svgY < 0 || svgX > svgWidth || svgY > svgHeight) {
      return;
    }

    const pixelX = svgX / SCALE_FACTOR;
    const pixelY = svgY / SCALE_FACTOR;

    const { worldX, worldY } = pixelToWorld(
      pixelX,
      pixelY,
      mapData.metadata as any
    );

    onPointTap(worldX, worldY, Math.round(pixelX), Math.round(pixelY));
  };

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
        scale.value,
        rotation.value
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
      { translateX: translateX.value + centerX },
      { translateY: translateY.value + centerY },
      { rotate: `${rotation.value}rad` },
      { scale: scale.value },
      { translateX: -centerX },
      { translateY: -centerY },
    ],
  }));

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

  const renderRobotMarker = () => {
    if (!robotPose) return null;

    const { svgX, svgY } = worldToSvgCoords(
      robotPose.worldX,
      robotPose.worldY,
      metadata as any,
      SCALE_FACTOR
    );

    return (
      <SvgImage
        href={require('../../../assets/images/robot.png')}
        x={svgX - ROBOT_MARKER_SIZE / 2}
        y={svgY - ROBOT_MARKER_SIZE / 2}
        width={ROBOT_MARKER_SIZE}
        height={ROBOT_MARKER_SIZE}
        preserveAspectRatio="xMidYMid meet"
      />
    );
  };

  const renderNavigationArrow = () => {
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
          stroke={NAV_ARROW_COLOR}
          strokeWidth={3}
          strokeDasharray="12,8"
          strokeOpacity={0.95}
        />
        <Polygon
          points={arrowheadPoints(from.svgX, from.svgY, to.svgX, to.svgY, 22)}
          fill={NAV_ARROW_COLOR}
        />
      </G>
    );
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.viewport}>
          <Animated.View style={animatedStyle}>
            <Svg width={svgWidth} height={svgHeight}>
              <G>
                <Rect
                  x={0}
                  y={0}
                  width={svgWidth}
                  height={svgHeight}
                  fill={MAP_BACKGROUND_COLOR}
                />

                {renderLayer(layers.free_space.polygons, MAP_FREE_SPACE_COLOR)}
                {renderLayer(layers.unknown.polygons, MAP_UNKNOWN_COLOR)}
                {renderLayer(layers.obstacles.polygons, MAP_OBSTACLE_COLOR)}

                {renderNavigationArrow()}
                {renderRobotMarker()}
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
  container: {
    flex: 1,
    backgroundColor: MAP_BACKGROUND_COLOR,
  },
  viewport: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MAP_BACKGROUND_COLOR,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderText: {
    color: '#9DC1FF',
    fontSize: 14,
    fontWeight: '600',
  },
});