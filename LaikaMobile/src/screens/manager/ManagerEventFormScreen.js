import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context';
import { managerAPI, venueAPI } from '../../services/managerService';
import { Header, Button, Input } from '../../components';
import styles from '../../styles/screens/manager/ManagerEventForm.styles';
import theme from '../../styles/theme';
import { Calendar, MapPin, ChevronDown, Check } from 'lucide-react-native';

const CATEGORIES = [
  { id: 'concert', label: 'Concierto' },
  { id: 'sport', label: 'Deporte' },
  { id: 'theater', label: 'Teatro' },
  { id: 'festival', label: 'Festival' },
  { id: 'family', label: 'Familiar' },
  { id: 'other', label: 'Otro' },
];

export const ManagerEventFormScreen = ({ navigation, route }) => {
  const { user, logout } = useAuth();
  const eventId = route.params?.eventId || null;
  const initialVenueId = route.params?.venueId || null;
  const initialVenueName = route.params?.venueName || null;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('concert');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priceBase, setPriceBase] = useState('');
  const [totalCapacity, setTotalCapacity] = useState('');

  // Venue & Room selection
  const [venues, setVenues] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Picker Modals
  const [venueModalVisible, setVenueModalVisible] = useState(false);
  const [roomModalVisible, setRoomModalVisible] = useState(false);

  // Fetch Venues & Event Details
  useEffect(() => {
    const initForm = async () => {
      setInitialLoading(true);
      try {
        // Fetch active venues
        const venuesData = await venueAPI.getAll({ status_filter: 'active' });
        setVenues(venuesData || []);

        if (eventId) {
          // Editing mode: fetch event details
          const eventDetails = await managerAPI.getEventDetail(eventId);
          if (eventDetails) {
            setName(eventDetails.name || '');
            setDescription(eventDetails.description || '');
            setCategory(eventDetails.category || 'concert');
            setDate(eventDetails.date || '');
            setTime(eventDetails.time || '');
            setPriceBase(String(eventDetails.price_base || eventDetails.price || ''));
            setTotalCapacity(String(eventDetails.total_capacity || ''));

            // Match venue
            const matchedVenue = venuesData.find(
              (v) => v.name === eventDetails.venue || v.id === eventDetails.venue_id
            );
            if (matchedVenue) {
              setSelectedVenue(matchedVenue);
              // Fetch rooms for this venue
              const roomsData = await venueAPI.getRooms(matchedVenue.id);
              setRooms(roomsData || []);

              // Match room
              const matchedRoom = roomsData.find(
                (r) => r.name === eventDetails.room || r.id === eventDetails.room_id
              );
              if (matchedRoom) {
                setSelectedRoom(matchedRoom);
              }
            }
          }
        } else if (initialVenueId) {
          // Pre-select venue from route params
          const matchedVenue = venuesData.find((v) => v.id === initialVenueId);
          if (matchedVenue) {
            setSelectedVenue(matchedVenue);
            const roomsData = await venueAPI.getRooms(matchedVenue.id);
            setRooms(roomsData || []);
          }
        }
      } catch (err) {
        console.error('Error initializing event form:', err);
        if (err?.status === 401) {
          Alert.alert(
            'Sesión Expirada',
            'Tu sesión ha expirado o no tienes permisos. Por favor inicia sesión de nuevo.',
            [{ text: 'Aceptar', onPress: () => logout() }]
          );
        } else {
          Alert.alert('Error', 'No se pudieron inicializar los catálogos.');
        }
      } finally {
        setInitialLoading(false);
      }
    };

    initForm();
  }, [eventId, initialVenueId]);

  const handleVenueSelect = async (venue) => {
    setSelectedVenue(venue);
    setSelectedRoom(null);
    setRooms([]);
    setVenueModalVisible(false);

    try {
      const roomsData = await venueAPI.getRooms(venue.id);
      setRooms(roomsData || []);
    } catch (err) {
      console.error('Error fetching rooms for venue:', err);
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setRoomModalVisible(false);
    // Suggest capacity based on room capacity
    if (room.capacity || room.total_capacity) {
      setTotalCapacity(String(room.capacity || room.total_capacity));
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !description.trim() || !date.trim() || !time.trim() || !priceBase.trim()) {
      Alert.alert('Campos incompletos', 'Por favor llena todos los campos obligatorios.');
      return;
    }

    if (!selectedVenue) {
      Alert.alert('Ubicación requerida', 'Por favor selecciona un Recinto.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category,
      date: date.trim(),
      time: time.trim(),
      price_base: parseFloat(priceBase),
      venue_id: selectedVenue.id,
      venue: selectedVenue.name,
      location: `${selectedVenue.city}, ${selectedVenue.state}`,
      room_id: selectedRoom ? selectedRoom.id : null,
      room: selectedRoom ? selectedRoom.name : null,
      total_capacity: totalCapacity ? parseInt(totalCapacity, 10) : null,
    };

    setLoading(true);
    try {
      if (eventId) {
        await managerAPI.updateEvent(eventId, payload);
        Alert.alert('Éxito', 'Espectáculo actualizado exitosamente.');
      } else {
        await managerAPI.createEvent(payload);
        Alert.alert('Éxito', 'El espectáculo ha sido creado como Borrador.');
      }
      navigation.goBack();
    } catch (err) {
      console.error('Error saving event:', err);
      if (err?.status === 401) {
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha expirado o no tienes permisos. Por favor inicia sesión de nuevo.',
          [{ text: 'Aceptar', onPress: () => logout() }]
        );
      } else {
        Alert.alert('Error al guardar', err.message || 'No se pudo guardar el espectáculo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={{ marginTop: 12, fontSize: 13, color: '#666' }}>Cargando catálogo...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={eventId ? 'EDITAR EVENTO' : 'NUEVO EVENTO'} showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{eventId ? 'Editar Espectáculo' : 'Datos del Espectáculo'}</Text>

        <Input
          label="Nombre del Evento *"
          value={name}
          onChangeText={setName}
          placeholder="Ej. Concierto Acústico Laika"
        />

        <Input
          label="Descripción *"
          value={description}
          onChangeText={setDescription}
          placeholder="Introduce los detalles para la cartelera..."
          multiline
          numberOfLines={4}
          inputStyle={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        {/* Category Picker */}
        <Text style={styles.label}>Categoría *</Text>
        <View style={styles.categorySelect}>
          {CATEGORIES.map((cat) => {
            const isSel = category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catOpt, isSel && styles.catOptSelected]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={[styles.catOptText, isSel && styles.catOptTextSelected]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date and Time inputs */}
        <View style={styles.row}>
          <View style={[styles.col, { marginRight: 8 }]}>
            <Input
              label="Fecha (AAAA-MM-DD) *"
              value={date}
              onChangeText={setDate}
              placeholder="2026-10-31"
            />
          </View>
          <View style={[styles.col, { marginLeft: 8 }]}>
            <Input
              label="Hora (HH:MM) *"
              value={time}
              onChangeText={setTime}
              placeholder="20:00"
            />
          </View>
        </View>

        {/* Venue Selection Selector */}
        <Text style={styles.label}>Recinto / Complejo *</Text>
        <TouchableOpacity
          style={stylesPicker.selector}
          onPress={() => setVenueModalVisible(true)}
          activeOpacity={0.8}
        >
          <MapPin size={18} color="#737373" style={{ marginRight: 8 }} />
          <Text style={[stylesPicker.selectorText, !selectedVenue && stylesPicker.placeholder]}>
            {selectedVenue ? selectedVenue.name : 'Selecciona un recinto'}
          </Text>
          <ChevronDown size={18} color="#737373" />
        </TouchableOpacity>

        {/* Room Selection Selector */}
        <Text style={styles.label}>Sala / Galería</Text>
        <TouchableOpacity
          style={[stylesPicker.selector, !selectedVenue && stylesPicker.selectorDisabled]}
          onPress={() => selectedVenue && setRoomModalVisible(true)}
          activeOpacity={selectedVenue ? 0.8 : 1}
        >
          <Calendar size={18} color="#737373" style={{ marginRight: 8 }} />
          <Text style={[stylesPicker.selectorText, !selectedRoom && stylesPicker.placeholder]}>
            {selectedRoom ? selectedRoom.name : selectedVenue ? 'Selecciona una sala' : 'Primero selecciona un recinto'}
          </Text>
          <ChevronDown size={18} color="#737373" />
        </TouchableOpacity>

        {/* Base Price and Capacity */}
        <View style={styles.row}>
          <View style={[styles.col, { marginRight: 8 }]}>
            <Input
              label="Precio Base (MXN) *"
              value={priceBase}
              onChangeText={setPriceBase}
              placeholder="350"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.col, { marginLeft: 8 }]}>
            <Input
              label="Aforo Máximo"
              value={totalCapacity}
              onChangeText={setTotalCapacity}
              placeholder="Ej. 120"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.formButtons}>
          <Button
            title="Cancelar"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.btn}
          />
          <Button
            title="Guardar"
            onPress={handleSave}
            loading={loading}
            variant="primary"
            style={styles.btn}
          />
        </View>
      </ScrollView>

      {/* VENUE PICKER MODAL */}
      <Modal
        visible={venueModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVenueModalVisible(false)}
      >
        <View style={stylesPicker.modalOverlay}>
          <View style={stylesPicker.modalContent}>
            <Text style={stylesPicker.modalTitle}>Selecciona un Recinto</Text>
            {venues.length === 0 ? (
              <Text style={stylesPicker.modalEmpty}>No hay recintos disponibles</Text>
            ) : (
              <FlatList
                data={venues}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => {
                  const isSelected = selectedVenue?.id === item.id;
                  return (
                    <TouchableOpacity
                      style={[stylesPicker.modalItem, isSelected && stylesPicker.modalItemActive]}
                      onPress={() => handleVenueSelect(item)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={stylesPicker.modalItemName}>{item.name}</Text>
                        <Text style={stylesPicker.modalItemSub}>{item.city}, {item.state}</Text>
                      </View>
                      {isSelected && <Check size={18} color="#000" />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
            <Button title="Cerrar" onPress={() => setVenueModalVisible(false)} variant="outline" style={{ marginTop: 12 }} />
          </View>
        </View>
      </Modal>

      {/* ROOM PICKER MODAL */}
      <Modal
        visible={roomModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRoomModalVisible(false)}
      >
        <View style={stylesPicker.modalOverlay}>
          <View style={stylesPicker.modalContent}>
            <Text style={stylesPicker.modalTitle}>Selecciona una Sala</Text>
            {rooms.length === 0 ? (
              <Text style={stylesPicker.modalEmpty}>No hay salas registradas para este recinto</Text>
            ) : (
              <FlatList
                data={rooms}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => {
                  const isSelected = selectedRoom?.id === item.id;
                  return (
                    <TouchableOpacity
                      style={[stylesPicker.modalItem, isSelected && stylesPicker.modalItemActive]}
                      onPress={() => handleRoomSelect(item)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={stylesPicker.modalItemName}>{item.name}</Text>
                        <Text style={stylesPicker.modalItemSub}>Capacidad: {item.capacity || item.total_capacity || 'N/D'}</Text>
                      </View>
                      {isSelected && <Check size={18} color="#000" />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
            <Button title="Cerrar" onPress={() => setRoomModalVisible(false)} variant="outline" style={{ marginTop: 12 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const stylesPicker = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    backgroundColor: theme.colors.gray50,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  selectorDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.gray100,
  },
  selectorText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.black,
  },
  placeholder: {
    color: theme.colors.gray400,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1.5,
    color: theme.colors.black,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalItemActive: {
    backgroundColor: '#fafafa',
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
  },
  modalItemSub: {
    fontSize: 11,
    color: theme.colors.gray500,
    marginTop: 2,
  },
  modalEmpty: {
    textAlign: 'center',
    paddingVertical: 20,
    color: '#666',
  },
});

export default ManagerEventFormScreen;
