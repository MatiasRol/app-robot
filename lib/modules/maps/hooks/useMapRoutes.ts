import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../core/services/supabaseClient';
import { formatDate } from '../../../core/utils/formatDate';
import { Route, WaypointPoint } from '../../../core/types';

type RouteScheduleMeta = {
  days: string[];
  time: string;
  recordRoute: boolean;
  label: string;
};

function buildScheduleLabel(days: string[], time: string) {
  const DAY_LABELS: Record<string, string> = {
    mon: 'L',
    tue: 'M',
    wed: 'M',
    thu: 'J',
    fri: 'V',
    sat: 'S',
    sun: 'D',
  };

  if (days.length === 0 && !time.trim()) {
    return 'Sin horario';
  }

  const dayText =
    days.length > 0 ? days.map((day) => DAY_LABELS[day] ?? day).join(', ') : '';

  if (dayText && time.trim()) {
    return `${dayText} a las ${time.trim()}`;
  }

  if (dayText) return dayText;
  return `A las ${time.trim()}`;
}

function uiWaypointsToDb(waypoints: WaypointPoint[]) {
  return waypoints.map((wp) => ({
    position: {
      x: wp.worldX,
      y: wp.worldY,
      z: 0.0,
    },
    orientation: {
      x: wp.quaternion.x,
      y: wp.quaternion.y,
      z: wp.quaternion.z,
      w: wp.quaternion.w,
    },
  }));
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
        schedule:
          typeof item.schedule === 'string'
            ? item.schedule
            : item.schedule?.label ?? 'Sin horario',
        waypoints: item.waypoints || [],
      }));

      setRoutes(adapted);
    } catch (err) {
      console.error('Error cargando rutas:', err);
    } finally {
      setRoutesLoading(false);
    }
  };

  const handleAddRoute = async (name: string, date: Date) => {
    if (!name.trim()) return false;

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
      return true;
    } catch (err) {
      console.error('Error creando ruta:', err);
      return false;
    }
  };

  const createRoute = async ({
    name,
    selectedDays,
    executeAt,
    recordRoute,
    waypoints,
  }: {
    name: string;
    selectedDays: string[];
    executeAt: string;
    recordRoute: boolean;
    waypoints: WaypointPoint[];
  }) => {
    const cleanName = name.trim();
    if (!cleanName) return null;
    if (!waypoints.length) return null;

    const scheduleMeta: RouteScheduleMeta = {
      days: selectedDays,
      time: executeAt,
      recordRoute,
      label: buildScheduleLabel(selectedDays, executeAt),
    };

    const { data, error } = await supabase
      .from('routes')
      .insert({
        map_id: mapId,
        name: cleanName,
        schedule: JSON.stringify(scheduleMeta),
        waypoints: uiWaypointsToDb(waypoints),
      })
      .select()
      .single();

    if (error) throw error;

    const created: Route = {
      id: data.id,
      name: data.name,
      mapId: data.map_id,
      schedule: scheduleMeta.label,
      waypoints,
    };

    setRoutes((prev) => [...prev, created]);
    return created;
  };

  const handleEditRoute = (routeId: string, name: string) => {
    setEditingRouteId(routeId);
    setEditRouteName(name);
    setEditRouteDate(new Date());
  };

  const handleSaveRoute = async (name: string, date: Date) => {
    if (!editingRouteId || !name.trim()) return false;

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
      return true;
    } catch (err) {
      console.error('Error editando ruta:', err);
      return false;
    }
  };

  const saveWaypoints = async (routeId: string, waypoints: WaypointPoint[]) => {
    try {
      const waypointsJson = uiWaypointsToDb(waypoints);

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

      return true;
    } catch (err) {
      console.error('Error guardando waypoints:', err);
      return false;
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
    createRoute,
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