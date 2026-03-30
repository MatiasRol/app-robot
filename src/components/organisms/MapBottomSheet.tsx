import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import { OperationMode } from '../../../lib/modules/maps/hooks/useOperationMode';
import { OperationModeSelector } from '../molecules/OperationModeSelector';
import { Route, RouteItem } from '../molecules/RouteItem';

interface MapBottomSheetProps {
  bottomSheetAnimation: Animated.Value;
  isExpanded: boolean;
  panHandlers: object;
  routes: Route[];
  mode: OperationMode;
  onModeChange: (mode: OperationMode) => void;
  onAddRoute: () => void;
  onEditRoute: (routeId: string, name: string) => void;
  onDeleteRoute: (routeId: string, name: string) => void;
}

export function MapBottomSheet({
  bottomSheetAnimation,
  isExpanded,
  panHandlers,
  routes,
  mode,
  onModeChange,
  onAddRoute,
  onEditRoute,
  onDeleteRoute,
}: MapBottomSheetProps) {
  return (
    <Animated.View style={[styles.sheet, { height: bottomSheetAnimation }]}>
      <View style={styles.handleContainer} {...panHandlers}>
        <View style={styles.handle} />
      </View>

      {isExpanded && (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Robot status */}
          <View style={styles.robotSection}>
            <View style={styles.robotInfo}>
              <Ionicons
                name="hardware-chip-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <Text style={styles.robotText}>Robot 1 en desplazamiento</Text>
            </View>
            <OperationModeSelector mode={mode} onChange={onModeChange} />
          </View>

          {/* Routes */}
          <View style={styles.routesSection}>
            <View style={styles.routesHeader}>
              <Text style={styles.routesTitle}>Rutas</Text>
              <TouchableOpacity style={styles.addBtn} onPress={onAddRoute}>
                <Ionicons name="add" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {routes.map((route) => (
              <RouteItem
                key={route.id}
                route={route}
                onEdit={() => onEditRoute(route.id, route.name)}
                onDelete={() => onDeleteRoute(route.id, route.name)}
              />
            ))}

            {routes.length === 0 && (
              <Text style={styles.emptyText}>
                No hay rutas. Toca + para agregar una.
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 20,
  },
  handleContainer: { alignItems: 'center', paddingVertical: 12 },
  handle: { width: 40, height: 5, backgroundColor: '#D0D0D0', borderRadius: 3 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  robotSection: { marginBottom: 24 },
  robotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  robotText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  routesSection: { marginBottom: 20 },
  routesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routesTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    paddingVertical: 20,
  },
});