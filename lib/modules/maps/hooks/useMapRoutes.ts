import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../core/services/supabaseClient';
import { formatDate } from '../../../core/utils/formatDate';
import { Route, WaypointPoint } from '../../../core/types';

function quaternionToAngle(quaternion: { z: number; w: number }) {
  return 2 * Math.atan2(quaternion.z, quaternion.w);
}

function normalizeDbWaypointsToUi(waypoints: any[] = []): WaypointPoint[] {
  return waypoints
    .map((wp) => {
      if (wp?.position && wp?.orientation) {
        return {
          pixelX: 0,
          pixelY: 0,
          worldX: Number(wp.position.x ?? 0),
          worldY: Number(wp.position.y ?? 0),
          orientationAngle: quaternionToAngle({
            z: Number(wp.orientation.z ?? 0),
            w: Number(wp.orientation.w ?? 1),
          }),
          quaternion: {
            x: Number(wp.orientation.x ?? 0),
            y: Number(wp.orientation.y ?? 0),
            z: Number(wp.orientation.z ?? 0),
            w: Number(wp.orientation.w ?? 1),
          },
          confirmed: true,
        };
      }

      if (
        typeof wp?.worldX === 'number' &&
        typeof wp?.worldY === 'number' &&
        wp?.quaternion
      ) {
        return {
          pixelX: Number(wp.pixelX ?? 0),
          pixelY: Number(wp.pixelY ?? 0),
          worldX: wp.worldX,
          worldY: wp.worldY,
          orientationAngle:
            typeof wp.orientationAngle === 'number'
              ? wp.orientationAngle
              : quaternionToAngle({
                  z: Number(wp.quaternion.z ?? 0),
                  w: Number(wp.quaternion.w ?? 1),
                }),
          quaternion: {
            x: Number(wp.quaternion.x ?? 0),
            y: Number(wp.quaternion.y ?? 0),
            z: Number(wp.quaternion.z ?? 0),
            w: Number(wp.quaternion.w ?? 1),
          },
          confirmed: wp.confirmed ?? true,
        };
      }

      return null;
    })
    .filter(Boolean) as WaypointPoint[];
}

export function useMapRoutes(mapId: string) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);

  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteDate, setNewRouteDate] = useState(new Date());

  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editRouteName, setEditRouteName] = useState('');
  const [editRouteDate, setEditRouteDate] = useState(new Date());

  useEffect(() => {
    if (!mapId) return;
    fetchRoutes();
  }, [mapId]);

  const fetchRoutes = async () => {
    try {
      setRoutesLoading(true);

      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('map_id', mapId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const adapted: Route[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        mapId: item.map_id,
        schedule: item.schedule,
        waypoints: normalizeDbWaypointsToUi(item.waypoints || []),
      }));

      setRoutes(adapted);
    } catch (err) {
      console.error('Error cargando rutas:', err);
    } finally {
      setRoutesLoading(false);
    }
  };

  const handleAddRoute = async (name: string, date: Date) => {
    if (!name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('routes')
        .insert({
          map_id: mapId,
          name: name.trim(),
          schedule: formatDate(date),
          waypoints: [],
        })
        .select()
        .single();

      if (error) throw error;

      setRoutes((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.name,
          mapId: data.map_id,
          schedule: data.schedule,
          waypoints: [],
        },
      ]);

      setNewRouteName('');
      setNewRouteDate(new Date());
      setShowAddRouteModal(false);
    } catch (err) {
      console.error('Error creando ruta:', err);
    }
  };

  const handleEditRoute = (routeId: string, name: string) => {
    setEditingRouteId(routeId);
    setEditRouteName(name);
    setEditRouteDate(new Date());
  };

  const handleSaveRoute = async (name: string, date: Date) => {
    if (!editingRouteId || !name.trim()) return;

    try {
      const { error } = await supabase
        .from('routes')
        .update({ name: name.trim(), schedule: formatDate(date) })
        .eq('id', editingRouteId);

      if (error) throw error;

      setRoutes((prev) =>
        prev.map((r) =>
          r.id === editingRouteId
            ? { ...r, name: name.trim(), schedule: formatDate(date) }
            : r
        )
      );

      setEditingRouteId(null);
    } catch (err) {
      console.error('Error editando ruta:', err);
    }
  };

  const saveWaypoints = async (routeId: string, waypoints: WaypointPoint[]) => {
    try {
      const waypointsJson = waypoints.map((wp) => ({
        position: { x: wp.worldX, y: wp.worldY, z: 0.0 },
        orientation: {
          x: wp.quaternion.x,
          y: wp.quaternion.y,
          z: wp.quaternion.z,
          w: wp.quaternion.w,
        },
      }));

      const { error } = await supabase
        .from('routes')
        .update({ waypoints: waypointsJson })
        .eq('id', routeId);

      if (error) throw error;

      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId ? { ...r, waypoints } : r
        )
      );
    } catch (err) {
      console.error('Error guardando waypoints:', err);
    }
  };

  const handleDeleteRoute = (routeId: string, routeName: string) => {
    Alert.alert(
      'Eliminar ruta',
      `¿Estás seguro de que deseas eliminar "${routeName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('routes')
                .delete()
                .eq('id', routeId);

              if (error) throw error;
              setRoutes((prev) => prev.filter((r) => r.id !== routeId));
            } catch (err) {
              console.error('Error eliminando ruta:', err);
            }
          },
        },
      ]
    );
  };

  return {
    routes,
    routesLoading,
    onEditRoute: handleEditRoute,
    onDeleteRoute: handleDeleteRoute,
    saveWaypoints,

    addModalProps: {
      visible: showAddRouteModal,
      mode: 'add' as const,
      initialName: newRouteName,
      initialDate: newRouteDate,
      onConfirm: handleAddRoute,
      onCancel: () => {
        setShowAddRouteModal(false);
        setNewRouteName('');
        setNewRouteDate(new Date());
      },
    },

    editModalProps: {
      visible: editingRouteId !== null,
      mode: 'edit' as const,
      initialName: editRouteName,
      initialDate: editRouteDate,
      onConfirm: handleSaveRoute,
      onCancel: () => setEditingRouteId(null),
    },

    openAddModal: () => setShowAddRouteModal(true),
  };
}