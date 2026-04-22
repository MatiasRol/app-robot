import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../core/services/supabaseClient';
import { formatDate } from '../../../core/utils/formatDate';
import { Route, WaypointPoint } from '../../../core/types';

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
    if (!mapId) {
      setRoutes([]);
      setRoutesLoading(false);
      return;
    }

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
      Alert.alert('Rutas', 'No se pudieron cargar las rutas de este mapa.');
      setRoutes([]);
    } finally {
      setRoutesLoading(false);
    }
  };

  const handleAddRoute = async (name: string, date: Date) => {
    if (!name.trim()) {
      Alert.alert('Ruta', 'Escribe un nombre para la ruta.');
      return;
    }

    try {
      const { error } = await supabase
        .from('routes')
        .insert({
          map_id: mapId,
          name: name.trim(),
          schedule: formatDate(date),
          waypoints: [],
        });

      if (error) throw error;

      setNewRouteName('');
      setNewRouteDate(new Date());
      setShowAddRouteModal(false);

      await fetchRoutes();
    } catch (err) {
      console.error('Error creando ruta:', err);
      Alert.alert('Ruta', 'No se pudo crear la ruta.');
    }
  };

  const handleEditRoute = (routeId: string, name: string) => {
    setEditingRouteId(routeId);
    setEditRouteName(name);
    setEditRouteDate(new Date());
  };

  const handleSaveRoute = async (name: string, date: Date) => {
    if (!editingRouteId || !name.trim()) {
      Alert.alert('Ruta', 'Escribe un nombre válido para la ruta.');
      return;
    }

    try {
      const { error } = await supabase
        .from('routes')
        .update({
          name: name.trim(),
          schedule: formatDate(date),
        })
        .eq('id', editingRouteId);

      if (error) throw error;

      setEditingRouteId(null);
      await fetchRoutes();
    } catch (err) {
      console.error('Error editando ruta:', err);
      Alert.alert('Ruta', 'No se pudo guardar la ruta.');
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

      await fetchRoutes();
    } catch (err) {
      console.error('Error guardando waypoints:', err);
      Alert.alert('Ruta', 'No se pudieron guardar los waypoints.');
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

              await fetchRoutes();
            } catch (err) {
              console.error('Error eliminando ruta:', err);
              Alert.alert('Ruta', 'No se pudo eliminar la ruta.');
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
    reloadRoutes: fetchRoutes,

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