import { useState } from 'react';
import { Alert } from 'react-native';
import { formatDate } from '../../../core/utils/formatDate';
import { useApp } from '../../app/context/AppContext';

export function useMapRoutes(mapId: string) {
  const { getMapRoutes, addRoute, updateRoute, deleteRoute } = useApp();

  // ── Add modal ──────────────────────────────────────────────
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteDate, setNewRouteDate] = useState(new Date());

  // ── Edit modal ─────────────────────────────────────────────
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editRouteName, setEditRouteName] = useState('');
  const [editRouteDate, setEditRouteDate] = useState(new Date());

  const routes = getMapRoutes(mapId);

  // ── Handlers ───────────────────────────────────────────────
  const handleAddRoute = (name: string, date: Date) => {
    if (name.trim()) {
      addRoute(mapId, name.trim(), formatDate(date));
      setNewRouteName('');
      setNewRouteDate(new Date());
      setShowAddRouteModal(false);
    }
  };

  const handleEditRoute = (routeId: string, name: string) => {
    setEditingRouteId(routeId);
    setEditRouteName(name);
    setEditRouteDate(new Date());
  };

  const handleSaveRoute = (name: string, date: Date) => {
    if (editingRouteId && name.trim()) {
      updateRoute(editingRouteId, { name: name.trim(), schedule: formatDate(date) });
      setEditingRouteId(null);
    }
  };

  const handleDeleteRoute = (routeId: string, routeName: string) => {
    Alert.alert(
      'Eliminar ruta',
      `¿Estás seguro de que deseas eliminar "${routeName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteRoute(routeId) },
      ]
    );
  };

  return {
    routes,
    onEditRoute: handleEditRoute,
    onDeleteRoute: handleDeleteRoute,

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