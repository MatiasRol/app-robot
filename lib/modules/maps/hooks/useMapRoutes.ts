import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../core/services/supabaseClient';
import { Route, WaypointPoint } from '../../../core/types';

type RouteScheduleMeta = {
  days: string[];
  time: string;
  recordRoute: boolean;
  label: string;
};

export interface RouteWithMeta extends Route {
  scheduleMeta?: RouteScheduleMeta;
}

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

function parseScheduleMeta(value: string | null | undefined): RouteScheduleMeta | undefined {
  if (!value) return undefined;

  try {
    const parsed = JSON.parse(value);

    if (
      parsed &&
      Array.isArray(parsed.days) &&
      typeof parsed.time === 'string' &&
      typeof parsed.recordRoute === 'boolean' &&
      typeof parsed.label === 'string'
    ) {
      return parsed;
    }
  } catch {}

  return {
    days: [],
    time: '',
    recordRoute: false,
    label: value,
  };
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
  const [routes, setRoutes] = useState<RouteWithMeta[]>([]);
  const [routesLoading, setRoutesLoading] = useState(true);

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

      const adapted: RouteWithMeta[] = (data || []).map((item: any) => {
        const scheduleMeta = parseScheduleMeta(item.schedule);

        return {
          id: item.id,
          name: item.name,
          mapId: item.map_id,
          schedule: scheduleMeta?.label ?? '',
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

    const createdRoute: RouteWithMeta = {
      id: data.id,
      name: data.name,
      mapId: data.map_id,
      schedule: scheduleMeta.label,
      scheduleMeta,
      waypoints,
    };

    setRoutes((prev) => [...prev, createdRoute]);

    return createdRoute;
  };

  const saveWaypoints = async (routeId: string, waypoints: WaypointPoint[]) => {
    try {
      const { error } = await supabase
        .from('routes')
        .update({ waypoints: uiWaypointsToDb(waypoints) })
        .eq('id', routeId);

      if (error) throw error;

      setRoutes((prev) =>
        prev.map((route) =>
          route.id === routeId
            ? {
                ...route,
                waypoints,
              }
            : route
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

              setRoutes((prev) => prev.filter((route) => route.id !== routeId));
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
    saveWaypoints,
    onDeleteRoute: handleDeleteRoute,
    refreshRoutes: fetchRoutes,
  };
}