import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../lib/core/constants/Colors';
import { useApp } from '../../lib/modules/app/context/AppContext';
import MapCard from '../../src/components/molecules/MapCard';

export default function MapsScreen() {
  const router = useRouter();
  const { maps, addMap } = useApp();
  const [showAddMapModal, setShowAddMapModal] = useState(false);
  const [newMapName, setNewMapName] = useState('');

  const handleAddMap = () => {
    if (newMapName.trim()) {
      addMap(newMapName.trim());
      setNewMapName('');
      setShowAddMapModal(false);
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        
        <TouchableOpacity style={styles.profileButton}>
          <Image
            source={require('../../assets/images/avatar-placeholder.png')}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>¡TUS</Text>
          <Text style={styles.title}>MAPAS!</Text>
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddMapModal(true)}
        >
          <Image
            source={require('../../assets/images/botonMas.png')}
            style={styles.addIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {maps.map((map) => (
          <MapCard key={map.id} map={map} />
        ))}
      </ScrollView>

      <Modal
        visible={showAddMapModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddMapModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Mapa</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre del mapa"
              placeholderTextColor={Colors.textSecondary}
              value={newMapName}
              onChangeText={setNewMapName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButtonCancel}
                onPress={() => {
                  setShowAddMapModal(false);
                  setNewMapName('');
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalButtonConfirm}
                onPress={handleAddMap}
              >
                <Text style={styles.modalButtonConfirmText}>Crear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#252932',
  },
  header: {
    backgroundColor: '#252932',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    position: 'relative',
  },
  profileButton: {
    position: 'absolute',
    top: 16,
    right: 24,
    borderRadius: 30,
    overflow: 'hidden',
    zIndex: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  titleContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textLight,
    letterSpacing: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: -20,
    right: 24,
    width: 64,
    height: 64,
    backgroundColor: Colors.surface,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  addIcon: {
    width: 40,
    height: 40,
    tintColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },

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
    marginBottom: 24,
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
});