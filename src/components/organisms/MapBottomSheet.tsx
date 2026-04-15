import React from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
          contentContainerStyle={styles.expandedContentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.routesHeader}>
            <Text style={styles.routesTitle}>Rutas</Text>

            <TouchableOpacity
              style={styles.addBtn}
              onPress={onAddRoute}
              activeOpacity={0.88}
            >
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {routes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay rutas</Text>
              <Text style={styles.emptySubtext}>
                Toca + para crear una nueva ruta
              </Text>
            </View>
          ) : (
            routes.map((route) => (
              <RouteListItem
                key={route.id}
                route={route}
                onNamePress={() => onEditRouteWaypoints(route.id)}
                onPlayPress={() => onPlayRoute(route.id)}
              />
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
    backgroundColor: '#F6F7F9',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  handle: {
    width: 58,
    height: 5,
    backgroundColor: '#B9BEC8',
    borderRadius: 3,
  },
  collapsedContent: {
    alignItems: 'center',
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  mapName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6C7380',
  },
  expandedContent: {
    flex: 1,
  },
  expandedContentContainer: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    paddingTop: 8,
  },
  routesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  routesTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#202020',
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9EDF3',
  },
  addBtnText: {
    fontSize: 28,
    lineHeight: 28,
    color: '#202020',
    fontWeight: '300',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 46,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#202020',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 18,
  },
});