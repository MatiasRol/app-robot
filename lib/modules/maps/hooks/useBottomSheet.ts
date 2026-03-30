import { useRef, useState } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
export const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.7;
export const BOTTOM_SHEET_MIN_HEIGHT = 60;

export function useBottomSheet() {
  const bottomSheetAnimation = useRef(
    new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)
  ).current;
  const [isExpanded, setIsExpanded] = useState(false);

  const expandBottomSheet = () => {
    setIsExpanded(true);
    Animated.spring(bottomSheetAnimation, {
      toValue: BOTTOM_SHEET_MAX_HEIGHT,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  const collapseBottomSheet = () => {
    setIsExpanded(false);
    Animated.spring(bottomSheetAnimation, {
      toValue: BOTTOM_SHEET_MIN_HEIGHT,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newHeight = isExpanded
          ? BOTTOM_SHEET_MAX_HEIGHT - gestureState.dy
          : BOTTOM_SHEET_MIN_HEIGHT - gestureState.dy;
        if (
          newHeight >= BOTTOM_SHEET_MIN_HEIGHT &&
          newHeight <= BOTTOM_SHEET_MAX_HEIGHT
        ) {
          bottomSheetAnimation.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50) {
          expandBottomSheet();
        } else if (gestureState.dy > 50) {
          collapseBottomSheet();
        } else {
          Animated.spring(bottomSheetAnimation, {
            toValue: isExpanded
              ? BOTTOM_SHEET_MAX_HEIGHT
              : BOTTOM_SHEET_MIN_HEIGHT,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return {
    bottomSheetAnimation,
    isExpanded,
    panHandlers: panResponder.panHandlers,
    expandBottomSheet,
    collapseBottomSheet,
  };
}