import { useFocusEffect } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback, useEffect, useRef } from 'react';
import { Colors } from '../../../core/constants/Colors';

interface UseCameraScreenLifecycleParams {
  navigation: any;
  onEnter: () => void;
  onExit: () => void;
}

export function useCameraScreenLifecycle({
  navigation,
  onEnter,
  onExit,
}: UseCameraScreenLifecycleParams) {
  const onEnterRef = useRef(onEnter);
  const onExitRef = useRef(onExit);

  useEffect(() => {
    onEnterRef.current = onEnter;
  }, [onEnter]);

  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);

  useFocusEffect(
    useCallback(() => {
      onEnterRef.current();

      navigation.setOptions({ tabBarStyle: { display: 'none' } });

      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({ tabBarStyle: { display: 'none' } });
      }

      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      ).catch(() => {});

      return () => {
        onExitRef.current();

        navigation.setOptions({
          tabBarStyle: {
            backgroundColor: Colors.background,
            borderTopColor: 'transparent',
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
          },
        });

        if (parent) {
          parent.setOptions({
            tabBarStyle: {
              backgroundColor: Colors.background,
              borderTopColor: 'transparent',
              height: 70,
              paddingBottom: 10,
              paddingTop: 10,
            },
          });
        }

        ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT
        ).catch(() => {});
      };
    }, [navigation])
  );
}