import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import SunkenPressable from '../atoms/SunkenPressable';

type ActionStatusVariant = 'success' | 'warning' | 'error' | 'info';

interface ActionStatusAlertProps {
  visible: boolean;
  title: string;
  message: string;
  variant?: ActionStatusVariant;
  confirmText?: string;
  onConfirm: () => void;
}

function getVariantStyles(variant: ActionStatusVariant) {
  switch (variant) {
    case 'success':
      return {
        accent: '#124BAF',
        buttonBg: '#124BAF',
        buttonText: '#FFFFFF',
      };
    case 'warning':
      return {
        accent: '#C98A00',
        buttonBg: '#C98A00',
        buttonText: '#FFFFFF',
      };
    case 'error':
      return {
        accent: '#B13A3A',
        buttonBg: '#B13A3A',
        buttonText: '#FFFFFF',
      };
    case 'info':
    default:
      return {
        accent: Colors.primary,
        buttonBg: Colors.primary,
        buttonText: '#FFFFFF',
      };
  }
}

export function ActionStatusAlert({
  visible,
  title,
  message,
  variant = 'info',
  confirmText = 'ENTENDIDO',
  onConfirm,
}: ActionStatusAlertProps) {
  if (!visible) return null;

  const palette = getVariantStyles(variant);

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <View
          style={[
            styles.accentBar,
            { backgroundColor: palette.accent },
          ]}
        />

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <SunkenPressable
          style={[
            styles.confirmBtn,
            { backgroundColor: palette.buttonBg },
          ]}
          onPress={onConfirm}
          activeScale={0.97}
          activeTranslateY={3}
          activeOpacity={0.92}
        >
          <Text
            style={[
              styles.confirmText,
              { color: palette.buttonText },
            ]}
          >
            {confirmText}
          </Text>
        </SunkenPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.26)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1100,
    paddingHorizontal: 24,
  },
  box: {
    width: '100%',
    maxWidth: 310,
    backgroundColor: '#F4F4F4',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 18,
    alignItems: 'center',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
  },
  title: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
    color: '#202020',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555555',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  confirmBtn: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});