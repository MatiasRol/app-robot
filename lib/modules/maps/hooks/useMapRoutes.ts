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

function quaternionToAngle(quaternion: { z: number; w: number }) {
  return 2 * Math.atan2(quaternion.z, quaternion.w);
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
  } catch {
    // Si no es JSON, lo tratamos como texto viejo
  }

  return {
    days: [],
    time: '',
    recordRoute: false,
    label: value,
  };
}

function dbWaypointsToUi(waypoints: any[] = []): WaypointPoint[] {
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
          worldX: Number(wp.worldX ?? 0),
          worldY: Number(wp.worldY ?? 0),
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

      const adapted: Route[] = (data || []).map((item: any) => {
        const scheduleMeta = parseScheduleMeta(item.schedule);

        return {
          id: item.id,
          name: item.name,
          mapId: item.map_id,
          schedule: scheduleMeta?.label ?? '',
          waypoints: dbWaypointsToUi(item.waypoints || []),
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

    const createdRoute: Route = {
      id: data.id,
      name: data.name,
      mapId: data.map_id,
      schedule: scheduleMeta.label,
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