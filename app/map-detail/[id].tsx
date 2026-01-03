import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, Modal, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../src/constants/Colors';
import { useApp } from '../../src/context/AppContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.7;
const BOTTOM_SHEET_MIN_HEIGHT = 60;

type OperationMode = 'vigilancia' | 'servicio';

export default function MapDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { getMapRoutes, addRoute, updateRoute, deleteRoute } = useApp();
  
  const bottomSheetAnimation = useRef(new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)).current;
  const [isExpanded, setIsExpanded] = useState(false);
  const [operationMode, setOperationMode] = useState<OperationMode>('vigilancia');
  const [showModeAlert, setShowModeAlert] = useState(false);
  const [pendingMode, setPendingMode] = useState<OperationMode | null>(null);

  // Estados para agregar/editar rutas
  const [showAddRouteModal, setShowAddRouteModal] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [newRouteSchedule, setNewRouteSchedule] = useState('');
  
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editRouteName, setEditRouteName] = useState('');
  const [editRouteSchedule, setEditRouteSchedule] = useState('');

  const routes = getMapRoutes(id as string);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newHeight = isExpanded 
          ? BOTTOM_SHEET_MAX_HEIGHT - gestureState.dy 
          : BOTTOM_SHEET_MIN_HEIGHT - gestureState.dy;
        
        if (newHeight >= BOTTOM_SHEET_MIN_HEIGHT && newHeight <= BOTTOM_SHEET_MAX_HEIGHT) {
          bottomSheetAnimation.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const shouldExpand = gestureState.dy < -50;
        const shouldCollapse = gestureState.dy > 50;

        if (shouldExpand) {
          expandBottomSheet();
        } else if (shouldCollapse) {
          collapseBottomSheet();
        } else {
          Animated.spring(bottomSheetAnimation, {
            toValue: isExpanded ? BOTTOM_SHEET_MAX_HEIGHT : BOTTOM_SHEET_MIN_HEIGHT,
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

  const handleModeChange = (newMode: OperationMode) => {
    if (newMode !== operationMode) {
      setPendingMode(newMode);
      setShowModeAlert(true);
    }
  };

  const confirmModeChange = () => {
    if (pendingMode) {
      setOperationMode(pendingMode);
    }
    setShowModeAlert(false);
    setPendingMode(null);
  };

  const cancelModeChange = () => {
    setShowModeAlert(false);
    setPendingMode(null);
  };

  // Agregar ruta
  const handleAddRoute = () => {
    if (newRouteName.trim()) {
      addRoute(id as string, newRouteName.trim(), newRouteSchedule.trim() || undefined);
      setNewRouteName('');
      setNewRouteSchedule('');
      setShowAddRouteModal(false);
    }
  };

  // Editar ruta
  const handleEditRoute = (routeId: string, name: string, schedule?: string) => {
    setEditingRouteId(routeId);
    setEditRouteName(name);
    setEditRouteSchedule(schedule || '');
  };

  const handleSaveRoute = () => {
    if (editingRouteId && editRouteName.trim()) {
      updateRoute(editingRouteId, {
        name: editRouteName.trim(),
        schedule: editRouteSchedule.trim() || undefined,
      });
      setEditingRouteId(null);
    }
  };

  // Eliminar ruta
  const handleDeleteRoute = (routeId: string, routeName: string) => {
    Alert.alert(
      'Eliminar ruta',
      `¿Estás seguro de que deseas eliminar "${routeName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => deleteRoute(routeId)
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      
      {/* Área del mapa */}
      <View style={styles.mapCanvas}>
        <Text style={styles.mapPlaceholder}>Mapa {id}</Text>
      </View>

      {/* Nombre del Mapa - Fuera del Bottom Sheet */}
      <View style={styles.mapNameContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.mapNameBox}>
          <Text style={styles.mapNameText}>Nombre del Mapa</Text>
        </View>
      </View>

      {/* BOTTOM SHEET DESLIZABLE */}
      <Animated.View 
        style={[
          styles.bottomSheet,
          {
            height: bottomSheetAnimation,
          }
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        {/* Contenido */}
        {isExpanded && (
          <ScrollView 
            style={styles.bottomSheetContent}
            showsVerticalScrollIndicator={false}
          >
            
            {/* Robot y modo de operación */}
            <View style={styles.robotSection}>
              <View style={styles.robotInfo}>
                <Image
                  source={require('../../assets/images/robotNav.png')}
                  style={styles.robotIcon}
                  resizeMode="contain"
                />
                <Text style={styles.robotText}>Robot 1 en desplazamiento</Text>
              </View>

              <View style={styles.modeSelector}>
                <Text style={styles.modeTitle}>Modo de operación</Text>
                <View style={styles.modeTabs}>
                  <TouchableOpacity 
                    style={[
                      styles.modeTab,
                      operationMode === 'vigilancia' && styles.modeTabActive
                    ]}
                    onPress={() => handleModeChange('vigilancia')}
                  >
                    <Text style={[
                      styles.modeTabText,
                      operationMode === 'vigilancia' && styles.modeTabTextActive
                    ]}>
                      Vigilancia
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.modeTab,
                      operationMode === 'servicio' && styles.modeTabActive
                    ]}
                    onPress={() => handleModeChange('servicio')}
                  >
                    <Text style={[
                      styles.modeTabText,
                      operationMode === 'servicio' && styles.modeTabTextActive
                    ]}>
                      Servicio
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Sección de Rutas */}
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

              {/* Lista de rutas */}
              {routes.map((route) => (
                <View key={route.id} style={styles.routeItem}>
                  <View style={styles.routeInfo}>
                    <Image
                      source={require('../../assets/images/mapaNav.png')}
                      style={styles.routeIconImg}
                      resizeMode="contain"
                    />
                    <View style={styles.routeDetails}>
                      <Text style={styles.routeName}>{route.name}</Text>
                      {route.schedule && (
                        <Text style={styles.routeSchedule}>{route.schedule}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.routeActions}>
                    <TouchableOpacity 
                      style={styles.editRouteButton}
                      onPress={() => handleEditRoute(route.id, route.name, route.schedule)}
                    >
                      <Image
                        source={require('../../assets/images/lapiz.png')}
                        style={styles.editIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.deleteRouteButton}
                      onPress={() => handleDeleteRoute(route.id, route.name)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

          </ScrollView>
        )}

      </Animated.View>

      {/* Modal agregar ruta */}
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
            <TextInput
              style={styles.modalInput}
              placeholder="Horario (opcional)"
              placeholderTextColor={Colors.textSecondary}
              value={newRouteSchedule}
              onChangeText={setNewRouteSchedule}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonCancel}
                onPress={() => {
                  setShowAddRouteModal(false);
                  setNewRouteName('');
                  setNewRouteSchedule('');
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
      </Modal>

      {/* Modal editar ruta */}
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
            <TextInput
              style={styles.modalInput}
              placeholder="Horario (opcional)"
              placeholderTextColor={Colors.textSecondary}
              value={editRouteSchedule}
              onChangeText={setEditRouteSchedule}
            />
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
      </Modal>

      {/* Alerta cambio de modo */}
      {showModeAlert && (
        <View style={styles.alertOverlay}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Cambiar modo de operación</Text>
            <Text style={styles.alertMessage}>
              ¿Estás seguro de que deseas cambiar el modo de operación?
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
    backgroundColor: '#C0C0C0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  mapNameBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
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
  robotIcon: {
    width: 20,
    height: 20,
    tintColor: Colors.textSecondary,
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 24,
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
  routeIconImg: {
    width: 20,
    height: 20,
    tintColor: Colors.textSecondary,
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
  routeActions: {flexDirection: 'row',
    gap: 8,
    },
    editRouteButton: {
    padding: 8,
    },
    deleteRouteButton: {
    padding: 8,
    },
    editIcon: {
    width: 20,
    height: 20,
    },
    // MODALES
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    // ALERTA
    alertOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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