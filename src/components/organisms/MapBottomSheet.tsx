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
              <View key={route.id} style={styles.routeWrap}>
                <RouteListItem
                  route={route}
                  onNamePress={() => onEditRouteWaypoints(route.id)}
                  onPlayPress={() => onPlayRoute(route.id)}
                />

                <View style={styles.routeActions}>
                  <TouchableOpacity
                    onPress={() => onDeleteRoute(route.id, route.name)}
                    style={styles.deleteBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteBtnText}>Eliminar</Text>
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
  routeWrap: {
    marginBottom: 10,
  },
  routeActions: {
    alignItems: 'flex-end',
    paddingRight: 8,
    marginTop: -4,
  },
  deleteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B13A3A',
  },
});