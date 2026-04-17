import React from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../../lib/core/constants/Colors';
import { Route } from '../../../lib/core/types';
import { RouteListItem } from '../molecules/RouteListItem';

interface MapBottomSheetProps {
  mapName: string;
  bottomSheetAnimation: Animated.Value;
  isExpanded: boolean;
  panHandlers: object;
  routes: Route[];
  onAddRoute: () => void;
  onEditRouteWaypoints: (routeId: string) => void;
  onEditRouteInfo?: (routeId: string, name: string, schedule?: string) => void;
  onPlayRoute: (routeId: string) => void;
  onDeleteRoute: (routeId: string, name: string) => void;
  isEditingWaypoints?: boolean;
  onAcceptWaypoints?: () => void;
}

export function MapBottomSheet({
  mapName,
  bottomSheetAnimation,
  isExpanded,
  panHandlers,
  routes,
  onAddRoute,
  onEditRouteWaypoints,
  onEditRouteInfo,
  onPlayRoute,
  onDeleteRoute,
  isEditingWaypoints = false,
  onAcceptWaypoints,
}: MapBottomSheetProps) {
  return (
    <Animated.View style={[styles.sheet, { height: bottomSheetAnimation }]}>
      <View style={styles.handleContainer} {...panHandlers}>
        <View style={styles.handle} />
      </View>

      {!isExpanded ? (
        <View style={styles.collapsedContent}>
          <Text style={styles.mapName}>{mapName}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.expandedContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.routesHeader}>
            <Text style={styles.routesTitle}>Rutas</Text>

            <View style={styles.headerButtons}>
              {isEditingWaypoints && onAcceptWaypoints && (
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={onAcceptWaypoints}
                >
                  <Text style={styles.acceptBtnText}>ACEPTAR</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.addBtn} onPress={onAddRoute}>
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {routes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Crea rutas</Text>
              <Text style={styles.emptySubtext}>
                Toca + para agregar una nueva ruta
              </Text>
            </View>
          ) : (
            routes.map((route) => (
              <View key={route.id} style={styles.routeCard}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    onEditRouteInfo?.(route.id, route.name, route.schedule)
                  }
                >
                  <RouteListItem
                    route={route}
                    onNamePress={() =>
                      onEditRouteInfo?.(route.id, route.name, route.schedule)
                    }
                    onPlayPress={() => onPlayRoute(route.id)}
                  />
                </TouchableOpacity>

                <View style={styles.routeActionsRow}>
                  <TouchableOpacity
                    style={styles.secondaryAction}
                    onPress={() => onEditRouteWaypoints(route.id)}
                  >
                    <Text style={styles.secondaryActionText}>Waypoints</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteAction}
                    onPress={() => onDeleteRoute(route.id, route.name)}
                  >
                    <Text style={styles.deleteActionText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#DDDDDD',
    borderRadius: 2,
  },
  collapsedContent: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    alignItems: 'center',
  },
  mapName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 0.3,
  },
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
    fontSize: 20,
    fontWeight: '700',
    color: '#0D111C',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    fontSize: 22,
    fontWeight: '400',
    color: '#0D111C',
    lineHeight: 26,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0D111C',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999999',
  },

  routeCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
  },
  routeActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
    marginTop: -2,
  },
  secondaryAction: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  deleteAction: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  deleteActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.danger,
  },
});