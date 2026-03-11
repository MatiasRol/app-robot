import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../lib/core/constants/Colors';
import { formatDate } from '../../lib/core/utils/formatDate';
import { useApp } from '../../lib/modules/app/context/AppContext';
import { useMapDetail } from '../../lib/modules/maps/hooks/useMapDetail';
import MapViewer from '../../src/components/organisms/MapViewer';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.7;
const BOTTOM_SHEET_MIN_HEIGHT = 60;

type OperationMode = 'vigilancia' | 'servicio';

export default function MapDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getMapRoutes, addRoute, updateRoute, deleteRoute } = useApp();

  // ── Mapa vectorial desde Supabase ───────────────────────────────────
  const {
    mapData,
    mapName,
    loading: mapLoading,
    error: mapError,
  } = useMapDetail(id as string);

  // ── Bottom Sheet ────────────────────────────────────────────────────
  const bottomSheetAnimation = useRef(
    new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)
  ).current;
  const [isExpanded, setIsExpanded] = useState(false);

  // ── Modo de operación ───────────────────────────────────────────────
  const [operationMode, setOperationMode] = useState<OperationMode>('vigilancia');
  const [showModeAlert, setShowModeAlert] = useState(false);
  const [pendingMode, setPendingMode] = useState<OperationMode | null>(null);

  // ── Rutas ───────────────────────────────────────────────────────────
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteDate, setNewRouteDate] = useState(new Date());
  const [showNewDatePicker, setShowNewDatePicker] = useState(false);
  const [showNewTimePicker, setShowNewTimePicker] = useState(false);

  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editRouteName, setEditRouteName] = useState('');
  const [editRouteDate, setEditRouteDate] = useState(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);

  const routes = getMapRoutes(id as string);

  // ── PanResponder para el Bottom Sheet ──────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newHeight = isExpanded
          ? BOTTOM_SHEET_MAX_HEIGHT - gestureState.dy
          : BOTTOM_SHEET_MIN_HEIGHT - gestureState.dy;

        if (
          newHeight >= BOTTOM_SHEET_MIN_HEIGHT &&
          newHeight <= BOTTOM_SHEET_MAX_HEIGHT
        ) {
          bottomSheetAnimation.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50) {
          expandBottomSheet();
        } else if (gestureState.dy > 50) {
          collapseBottomSheet();
        } else {
          Animated.spring(bottomSheetAnimation, {
            toValue: isExpanded
              ? BOTTOM_SHEET_MAX_HEIGHT
              : BOTTOM_SHEET_MIN_HEIGHT,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const expandBottomSheet = () => {
    setIsExpanded(true);
    Animated.spring(bottomSheetAnimation, {
      toValue: BOTTOM_SHEET_MAX_HEIGHT,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  const collapseBottomSheet = () => {
    setIsExpanded(false);
    Animated.spring(bottomSheetAnimation, {
      toValue: BOTTOM_SHEET_MIN_HEIGHT,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  // ── Cambio de modo ──────────────────────────────────────────────────
  const handleModeChange = (newMode: OperationMode) => {
    if (newMode !== operationMode) {
      setPendingMode(newMode);
      setShowModeAlert(true);
    }
  };

  const confirmModeChange = () => {
    if (pendingMode) setOperationMode(pendingMode);
    setShowModeAlert(false);
    setPendingMode(null);
  };

  const cancelModeChange = () => {
    setShowModeAlert(false);
    setPendingMode(null);
  };

  // ── Agregar ruta ────────────────────────────────────────────────────
  const handleAddRoute = () => {
    if (newRouteName.trim()) {
      const schedule = formatDate(newRouteDate);
      addRoute(id as string, newRouteName.trim(), schedule);
      setNewRouteName('');
      setNewRouteDate(new Date());
      setShowAddRouteModal(false);
    }
  };

  // ── Editar ruta ─────────────────────────────────────────────────────
  const handleEditRoute = (
    routeId: string,
    name: string,
    schedule?: string
  ) => {
    setEditingRouteId(routeId);
    setEditRouteName(name);
    setEditRouteDate(new Date());
  };

  const handleSaveRoute = () => {
    if (editingRouteId && editRouteName.trim()) {
      const schedule = formatDate(editRouteDate);
      updateRoute(editingRouteId, {
        name: editRouteName.trim(),
        schedule,
      });
      setEditingRouteId(null);
    }
  };

  // ── Eliminar ruta ───────────────────────────────────────────────────
  const handleDeleteRoute = (routeId: string, routeName: string) => {
    Alert.alert(
      'Eliminar ruta',
      `¿Estás seguro de que deseas eliminar "${routeName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteRoute(routeId),
        },
      ]
    );
  };

  // ── DateTimePicker handlers ─────────────────────────────────────────
  const onChangeNewDate = (_: any, selectedDate?: Date) => {
    setShowNewDatePicker(false);
    if (selectedDate) setNewRouteDate(selectedDate);
  };

  const onChangeNewTime = (_: any, selectedTime?: Date) => {
    setShowNewTimePicker(false);
    if (selectedTime) {
      const updated = new Date(newRouteDate);
      updated.setHours(selectedTime.getHours());
      updated.setMinutes(selectedTime.getMinutes());
      setNewRouteDate(updated);
    }
  };

  const onChangeEditDate = (_: any, selectedDate?: Date) => {
    setShowEditDatePicker(false);
    if (selectedDate) setEditRouteDate(selectedDate);
  };

  const onChangeEditTime = (_: any, selectedTime?: Date) => {
    setShowEditTimePicker(false);
    if (selectedTime) {
      const updated = new Date(editRouteDate);
      updated.setHours(selectedTime.getHours());
      updated.setMinutes(selectedTime.getMinutes());
      setEditRouteDate(updated);
    }
  };

  // ────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>

      {/* ── VISOR DEL MAPA (reemplaza el placeholder gris) ── */}
      <View style={styles.mapCanvas}>
        <MapViewer
          mapData={mapData}
          loading={mapLoading}
          error={mapError}
        />
      </View>

      {/* ── BARRA SUPERIOR: botón volver + nombre del mapa ── */}
      <View style={styles.mapNameContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.mapNameBox}>
          <Text style={styles.mapNameText}>
            {mapName || `Mapa ${id}`}
          </Text>
        </View>
      </View>

      {/* ── BOTTOM SHEET ── */}
      <Animated.View
        style={[styles.bottomSheet, { height: bottomSheetAnimation }]}
      >
        {/* Handle para arrastrar */}
        <View
          style={styles.handleContainer}
          {...panResponder.panHandlers}
        >
          <View style={styles.handle} />
        </View>

        {/* Contenido expandido */}
        {isExpanded && (
          <ScrollView
            style={styles.bottomSheetContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Robot y modo de operación */}
            <View style={styles.robotSection}>
              <View style={styles.robotInfo}>
                <Ionicons
                  name="hardware-chip-outline"
                  size={20}
                  color={Colors.textSecondary}
                />
                <Text style={styles.robotText}>Robot 1 en desplazamiento</Text>
              </View>

              <View style={styles.modeSelector}>
                <Text style={styles.modeTitle}>Modo de operación</Text>
                <View style={styles.modeTabs}>
                  <TouchableOpacity
                    style={[
                      styles.modeTab,
                      operationMode === 'vigilancia' && styles.modeTabActive,
                    ]}
                    onPress={() => handleModeChange('vigilancia')}
                  >
                    <Text
                      style={[
                        styles.modeTabText,
                        operationMode === 'vigilancia' && styles.modeTabTextActive,
                      ]}
                    >
                      Vigilancia
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.modeTab,
                      operationMode === 'servicio' && styles.modeTabActive,
                    ]}
                    onPress={() => handleModeChange('servicio')}
                  >
                    <Text
                      style={[
                        styles.modeTabText,
                        operationMode === 'servicio' && styles.modeTabTextActive,
                      ]}
                    >
                      Servicio
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Sección de rutas */}
            <View style={styles.routesSection}>
              <View style={styles.routesHeader}>
                <Text style={styles.routesTitle}>Rutas</Text>
                <TouchableOpacity
                  style={styles.addRouteButton}
                  onPress={() => setShowAddRouteModal(true)}
                >
                  <Ionicons name="add" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              {routes.map((route) => (
                <View key={route.id} style={styles.routeItem}>
                  <View style={styles.routeInfo}>
                    <Ionicons
                      name="map-outline"
                      size={20}
                      color={Colors.textSecondary}
                    />
                    <View style={styles.routeDetails}>
                      <Text style={styles.routeName}>{route.name}</Text>
                      {route.schedule && (
                        <Text style={styles.routeSchedule}>
                          {route.schedule}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.routeActions}>
                    <TouchableOpacity
                      style={styles.editRouteButton}
                      onPress={() =>
                        handleEditRoute(route.id, route.name, route.schedule)
                      }
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={20}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteRouteButton}
                      onPress={() =>
                        handleDeleteRoute(route.id, route.name)
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#F44336"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {routes.length === 0 && (
                <Text style={styles.noRoutesText}>
                  No hay rutas. Toca + para agregar una.
                </Text>
              )}
            </View>
          </ScrollView>
        )}
      </Animated.View>

      {/* ── MODAL: Agregar ruta ── */}
      <Modal
        visible={showAddRouteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddRouteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva Ruta</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nombre de la ruta"
              placeholderTextColor={Colors.textSecondary}
              value={newRouteName}
              onChangeText={setNewRouteName}
              autoFocus
            />

            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateTimeLabel}>Programar inicio:</Text>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowNewDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                <Text style={styles.dateTimeButtonText}>
                  {newRouteDate.toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowNewTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
                <Text style={styles.dateTimeButtonText}>
                  {newRouteDate.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setShowAddRouteModal(false);
                  setNewRouteName('');
                  setNewRouteDate(new Date());
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleAddRoute}
              >
                <Text style={styles.modalButtonConfirmText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {showNewDatePicker && (
          <DateTimePicker
            value={newRouteDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeNewDate}
          />
        )}
        {showNewTimePicker && (
          <DateTimePicker
            value={newRouteDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeNewTime}
          />
        )}
      </Modal>

      {/* ── MODAL: Editar ruta ── */}
      <Modal
        visible={editingRouteId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingRouteId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Ruta</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nombre de la ruta"
              placeholderTextColor={Colors.textSecondary}
              value={editRouteName}
              onChangeText={setEditRouteName}
              autoFocus
            />

            <View style={styles.dateTimeContainer}>
              <Text style={styles.dateTimeLabel}>Programar inicio:</Text>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowEditDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
                <Text style={styles.dateTimeButtonText}>
                  {editRouteDate.toLocaleDateString('es-ES', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowEditTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
                <Text style={styles.dateTimeButtonText}>
                  {editRouteDate.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setEditingRouteId(null)}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleSaveRoute}
              >
                <Text style={styles.modalButtonConfirmText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {showEditDatePicker && (
          <DateTimePicker
            value={editRouteDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeEditDate}
          />
        )}
        {showEditTimePicker && (
          <DateTimePicker
            value={editRouteDate}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChangeEditTime}
          />
        )}
      </Modal>

      {/* ── ALERTA: Cambio de modo ── */}
      {showModeAlert && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Cambiar modo de operación</Text>
            <Text style={styles.alertMessage}>
              ¿Estás seguro de que deseas cambiar al modo{' '}
              {pendingMode === 'servicio' ? 'Servicio' : 'Vigilancia'}?
            </Text>
            <View style={styles.alertButtons}>
              <TouchableOpacity
                style={styles.alertButtonCancel}
                onPress={cancelModeChange}
              >
                <Text style={styles.alertButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.alertButtonConfirm}
                onPress={confirmModeChange}
              >
                <Text style={styles.alertButtonConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapCanvas: {
    flex: 1,
  },
  mapNameContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  mapNameBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 3,
  },
  mapNameText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#D0D0D0',
    borderRadius: 3,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  robotSection: {
    marginBottom: 24,
  },
  robotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  robotText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  modeSelector: {
    marginBottom: 8,
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 25,
    padding: 4,
    elevation: 5,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: Colors.primary,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  routesSection: {
    marginBottom: 20,
  },
  routesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addRouteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  routeDetails: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  routeSchedule: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  routeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editRouteButton: {
    padding: 8,
  },
  deleteRouteButton: {
    padding: 8,
  },
  noRoutesText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    paddingVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  dateTimeContainer: {
    marginBottom: 20,
  },
  dateTimeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
  alertOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  alertBox: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 350,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  alertButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  alertButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  alertButtonConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  alertButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
});