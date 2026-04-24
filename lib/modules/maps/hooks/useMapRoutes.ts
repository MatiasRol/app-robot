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

type RouteRecord = Route & {
  scheduleMeta?: RouteScheduleMeta | null;
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

function dbWaypointsToUi(waypoints: any[] = []): WaypointPoint[] {
  return waypoints
    .map((wp) => {
      if (!wp?.position || !wp?.orientation) return null;

      const x = Number(wp.position.x ?? 0);
      const y = Number(wp.position.y ?? 0);

      const qx = Number(wp.orientation.x ?? 0);
      const qy = Number(wp.orientation.y ?? 0);
      const qz = Number(wp.orientation.z ?? 0);
      const qw = Number(wp.orientation.w ?? 1);

      const orientationAngle = 2 * Math.atan2(qz, qw);

      return {
        pixelX: 0,
        pixelY: 0,
        worldX: x,
        worldY: y,
        orientationAngle,
        quaternion: {
          x: qx,
          y: qy,
          z: qz,
          w: qw,
        },
        confirmed: true,
      } satisfies WaypointPoint;
    })
    .filter(Boolean) as WaypointPoint[];
}

function parseScheduleMeta(scheduleValue: any): RouteScheduleMeta | null {
  if (!scheduleValue) return null;

  if (typeof scheduleValue === 'object') {
    const days = Array.isArray(scheduleValue.days) ? scheduleValue.days : [];
    const time =
      typeof scheduleValue.time === 'string' ? scheduleValue.time : '';
    const recordRoute = Boolean(scheduleValue.recordRoute);
    const label =
      typeof scheduleValue.label === 'string'
        ? scheduleValue.label
        : buildScheduleLabel(days, time);

    return {
      days,
      time,
      recordRoute,
      label,
    };
  }

  if (typeof scheduleValue === 'string') {
    try {
      const parsed = JSON.parse(scheduleValue);

      if (parsed && typeof parsed === 'object') {
        const days = Array.isArray(parsed.days) ? parsed.days : [];
        const time = typeof parsed.time === 'string' ? parsed.time : '';
        const recordRoute = Boolean(parsed.recordRoute);
        const label =
          typeof parsed.label === 'string'
            ? parsed.label
            : buildScheduleLabel(days, time);

        return {
          days,
          time,
          recordRoute,
          label,
        };
      }
    } catch {
      return {
        days: [],
        time: '',
        recordRoute: false,
        label: scheduleValue,
      };
    }
  }

  return null;
}

export function useMapRoutes(mapId: string) {
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
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

      const adapted: RouteRecord[] = (data || []).map((item: any) => {
        const scheduleMeta = parseScheduleMeta(item.schedule);

        return {
          id: item.id,
          name: item.name,
          mapId: item.map_id,
          schedule: scheduleMeta?.label ?? 'Sin horario',
          scheduleMeta,
          waypoints: item.waypoints || [],
        };
      });

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
          scheduleMeta: {
            days: [],
            time: '',
            recordRoute: false,
            label: data.schedule,
          },
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

    const created: RouteRecord = {
      id: data.id,
      name: data.name,
      mapId: data.map_id,
      schedule: scheduleMeta.label,
      scheduleMeta,
      waypoints,
    };

    setRoutes((prev) => [...prev, created]);
    return created;
  };

  const updateRoute = async ({
    routeId,
    name,
    selectedDays,
    executeAt,
    recordRoute,
    waypoints,
  }: {
    routeId: string;
    name: string;
    selectedDays: string[];
    executeAt: string;
    recordRoute: boolean;
    waypoints: WaypointPoint[];
  }) => {
    const cleanName = name.trim();
    if (!routeId || !cleanName) return false;
    if (!waypoints.length) return false;

    const scheduleMeta: RouteScheduleMeta = {
      days: selectedDays,
      time: executeAt,
      recordRoute,
      label: buildScheduleLabel(selectedDays, executeAt),
    };

    const { error } = await supabase
      .from('routes')
      .update({
        name: cleanName,
        schedule: JSON.stringify(scheduleMeta),
        waypoints: uiWaypointsToDb(waypoints),
      })
      .eq('id', routeId);

    if (error) throw error;

    setRoutes((prev) =>
      prev.map((route) =>
        route.id === routeId
          ? {
              ...route,
              name: cleanName,
              schedule: scheduleMeta.label,
              scheduleMeta,
              waypoints,
            }
          : route
      )
    );

    return true;
  };

  const getRouteEditData = (routeId: string) => {
    const route = routes.find((r) => r.id === routeId);
    if (!route) return null;

    return {
      id: route.id,
      name: route.name,
      selectedDays: route.scheduleMeta?.days ?? [],
      executeAt: route.scheduleMeta?.time ?? '',
      recordRoute: route.scheduleMeta?.recordRoute ?? false,
      waypoints: dbWaypointsToUi(route.waypoints as any[]),
    };
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
            ? {
                ...r,
                name: name.trim(),
                schedule: formatDate(date),
                scheduleMeta: {
                  days: [],
                  time: '',
                  recordRoute: false,
                  label: formatDate(date),
                },
              }
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
      const route = routes.find((r) => r.id === routeId);
      const waypointsJson = uiWaypointsToDb(waypoints);

      const { error } = await supabase
        .from('routes')
        .update({ waypoints: waypointsJson })
        .eq('id', routeId);

      if (error) throw error;

      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? {
                ...r,
                waypoints,
                scheduleMeta: r.scheduleMeta ?? route?.scheduleMeta ?? null,
              }
            : r
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
    routes: routes as Route[],
    routesLoading,
    createRoute,
    updateRoute,
    getRouteEditData,
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