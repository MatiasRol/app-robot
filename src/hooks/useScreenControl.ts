import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useRef } from 'react';
import { Colors } from '../constants/Colors';

interface UseScreenControlReturn {
  handleBack: () => Promise<void>;
}

export const useScreenControl = (onDisconnect: () => void): UseScreenControlReturn => {
  const router = useRouter();
  const navigation = useNavigation();
  const isKeepAwakeActive = useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      // Ocultar tab bar
      navigation.setOptions({
        tabBarStyle: { display: 'none' }
      });

      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({
          tabBarStyle: { display: 'none' }
        });
      }

      // Bloquear orientación en landscape
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      
      // Mantener pantalla encendida
      activateKeepAwakeAsync()
        .then(() => {
          isKeepAwakeActive.current = true;
        })
        .catch(() => {});

      return () => {
        // Restaurar tab bar
        navigation.setOptions({
          tabBarStyle: {
            backgroundColor: Colors.background,
            borderTopColor: 'transparent',
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
          }
        });

        if (parent) {
          parent.setOptions({
            tabBarStyle: {
              backgroundColor: Colors.background,
              borderTopColor: 'transparent',
              height: 70,
              paddingBottom: 10,
              paddingTop: 10,
            }
          });
        }
        
        // Restaurar orientación a portrait
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        
        // Desactivar keep awake
        if (isKeepAwakeActive.current) {
          try {
            deactivateKeepAwake();
            isKeepAwakeActive.current = false;
          } catch (error) {}
        }
      };
    }, [navigation])
  );

  const handleBack = async () => {
    onDisconnect();
    
    if (isKeepAwakeActive.current) {
      try {
        deactivateKeepAwake();
        isKeepAwakeActive.current = false;
      } catch (error) {}
    }
    
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    router.back();
  };

  return {
    handleBack,
  };
};