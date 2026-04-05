import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import { BOTTOM_SHEET_MAX_HEIGHT, BOTTOM_SHEET_MIN_HEIGHT } from 'lib/modules/maps/hooks/useBottomSheet';
import { OperationMode } from 'lib/modules/maps/hooks/useOperationMode';
import { Route, RouteItem } from '../molecules/RouteItem';

type BottomTab = 'rutas' | 'navegar';

interface MapBottomSheetProps {
  mapName: string;
  bottomSheetAnimation: Animated.Value;
  isExpanded: boolean;
  panHandlers: object;
  routes: Route[];
  mode: OperationMode;
  onModeChange: (mode: OperationMode) => void;
  onAddRoute: () => void;
  onEditRoute: (routeId: string, name: string) => void;
  onDeleteRoute: (routeId: string, name: string) => void;
  onNavigate?: () => void;
}

export function MapBottomSheet({
  mapName,
  bottomSheetAnimation,
  isExpanded,
  panHandlers,
  routes,
  onAddRoute,
  onEditRoute,
  onDeleteRoute,
  onNavigate,
}: MapBottomSheetProps) {
  const [activeTab, setActiveTab] = useState<BottomTab>('rutas');

  return (
    <Animated.View style={[styles.sheet, { height: bottomSheetAnimation }]}>

      {/* Handle */}
      <View style={styles.handleContainer} {...panHandlers}>
        <View style={styles.handle} />
      </View>

      {!isExpanded ? (
        /* ── Collapsed: map name + action buttons ── */
        <View style={styles.collapsedContent}>
          <Text style={styles.mapName}>{mapName}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, activeTab === 'rutas' && styles.actionBtnActive]}
              onPress={() => {
                setActiveTab('rutas');
                // parent's expand is triggered by panResponder swipe up
                // but we also allow tap to expand
              }}
            >
              <Ionicons
                name="list-outline"
                size={22}
                color={activeTab === 'rutas' ? Colors.text : Colors.textSecondary}
              />
              <Text style={[styles.actionBtnLabel, activeTab === 'rutas' && styles.actionBtnLabelActive]}>
                RUTAS
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, activeTab === 'navegar' && styles.actionBtnActive]}
              onPress={() => {
                setActiveTab('navegar');
                onNavigate?.();
              }}
            >
              <Ionicons
                name="navigate-outline"
                size={22}
                color={activeTab === 'navegar' ? Colors.text : Colors.textSecondary}
              />
              <Text style={[styles.actionBtnLabel, activeTab === 'navegar' && styles.actionBtnLabelActive]}>
                NAVEGAR
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* ── Expanded: routes list ── */
        <ScrollView
          style={styles.expandedContent}
          showsVerticalScrollIndicator={false}
        >
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
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.divider,
    borderRadius: 2,
  },

  // Collapsed
  collapsedContent: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    alignItems: 'center',
    gap: 14,
  },
  mapName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 50,
    backgroundColor: Colors.button,
    borderWidth: 1,
    borderColor: Colors.primaryDark + '60',
  },
  actionBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionBtnLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  actionBtnLabelActive: {
    color: Colors.text,
  },

  // Expanded
  expandedContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  routesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  routesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.button,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    paddingVertical: 24,
  },
});