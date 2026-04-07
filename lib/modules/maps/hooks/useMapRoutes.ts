import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../core/services/supabaseClient';
import { formatDate } from '../../../core/utils/formatDate';
import { Route, WaypointPoint } from '../../../core/types';

export function useMapRoutes(mapId: string) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);

  // ── Add modal ──────────────────────────────────────────────
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteDate, setNewRouteDate] = useState(new Date());

  // ── Edit modal ─────────────────────────────────────────────
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editRouteName, setEditRouteName] = useState('');
  const [editRouteDate, setEditRouteDate] = useState(new Date());

  // ── Cargar rutas desde Supabase ────────────────────────────
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
        waypoints: item.waypoints || [],
      }));

      setRoutes(adapted);
    } catch (err) {
      console.error('Error cargando rutas:', err);
    } finally {
      setRoutesLoading(false);
    }
  };

  // ── Agregar ruta ───────────────────────────────────────────
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

  // ── Editar nombre de ruta ──────────────────────────────────
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

  // ── Guardar waypoints ──────────────────────────────────────
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

  // ── Eliminar ruta ──────────────────────────────────────────
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