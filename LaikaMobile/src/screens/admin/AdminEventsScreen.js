import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../styles/theme';
import { Header, Button, Input, Badge } from '../../components';
import { eventAPI, venueAPI } from '../../services';
import { Trash2, Edit2, Play, CircleAlert, Plus } from 'lucide-react-native';

export const AdminEventsScreen = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [priceBase, setPriceBase] = useState('');
  const [category, setCategory] = useState('concert');

  const fetchEventsAndVenues = async () => {
    setLoading(true);
    try {
      const [eventsData, venuesData] = await Promise.all([
        eventAPI.getAll(),
        venueAPI.getAll(),
      ]);
      setEvents(eventsData || []);
      setVenues(venuesData || []);
    } catch (err) {
      console.warn('Error loading admin events details:', err);
      Alert.alert('Error', 'No se pudieron cargar los datos de administración.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventsAndVenues();
  }, []);

  const handleTogglePublish = async (event) => {
    const isPub = event.status === 'published';
    try {
      if (isPub) {
        await eventAPI.unpublish(event.id);
        Alert.alert('Despublicado', 'El evento ya no es visible al público.');
      } else {
        await eventAPI.publish(event.id);
        Alert.alert('Publicado', 'El evento ahora es visible en la cartelera.');
      }
      fetchEventsAndVenues();
    } catch (err) {
      Alert.alert('Error', 'No se pudo cambiar el estado de publicación.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirmar eliminación', '¿Estás seguro de que quieres eliminar este evento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await eventAPI.delete(id);
            Alert.alert('Eliminado', 'El evento ha sido removido del catálogo.');
            fetchEventsAndVenues();
          } catch (err) {
            Alert.alert('Error', 'No se pudo eliminar el evento.');
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!name || !description || !location || !date || !time || !priceBase) {
      Alert.alert('Formulario', 'Por favor llena todos los campos.');
      return;
    }

    const payload = {
      name,
      description,
      venue: selectedVenue,
      location,
      date,
      time,
      price_base: parseFloat(priceBase),
      category,
      status: 'draft', // defaults as draft
    };

    setLoading(true);
    try {
      if (editId) {
        await eventAPI.update(editId, payload);
        Alert.alert('Actualizado', 'Evento editado exitosamente.');
      } else {
        await eventAPI.create(payload);
        Alert.alert('Creado', 'Nuevo evento agregado en modo Borrador.');
      }
      handleCancelEdit();
      fetchEventsAndVenues();
    } catch (err) {
      Alert.alert('Error al guardar', err.message || 'No se pudo guardar el evento.');
      setLoading(false);
    }
  };

  const handleEditPress = (event) => {
    setEditId(event.id);
    setName(event.name);
    setDescription(event.description);
    setSelectedVenue(event.venue || '');
    setLocation(event.location);
    setDate(event.date);
    setTime(event.time);
    setPriceBase(String(event.price_base || ''));
    setCategory(event.category || 'concert');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setName('');
    setDescription('');
    setSelectedVenue('');
    setLocation('');
    setDate('');
    setTime('');
    setPriceBase('');
    setCategory('concert');
    setIsEditing(false);
  };

  const renderEventItem = ({ item }) => (
    <View style={styles.eventRow}>
      <View style={styles.eventDetails}>
        <Text style={styles.eventName}>{item.name}</Text>
        <Text style={styles.eventLocation}>{item.venue || item.location}</Text>
        <View style={styles.badgeRow}>
          <Badge text={item.category} variant="secondary" style={{ marginRight: 6 }} />
          <Badge
            text={item.status === 'published' ? 'Público' : 'Borrador'}
            variant={item.status === 'published' ? 'success' : 'warning'}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleTogglePublish(item)}>
          <Play size={16} color={item.status === 'published' ? 'orange' : 'green'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleEditPress(item)}>
          <Edit2 size={16} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
          <Trash2 size={16} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="GESTOR EVENTOS" showBack />
      
      {isEditing ? (
        <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.formTitle}>
            {editId ? 'Editar Espectáculo' : 'Nuevo Espectáculo'}
          </Text>

          <Input label="Nombre del Evento" value={name} onChangeText={setName} placeholder="Concierto de Rock" />
          <Input label="Descripción" value={description} onChangeText={setDescription} placeholder="Detalles de la función" multiline numberOfLines={3} />
          
          <Input label="Recinto (Complejo)" value={selectedVenue} onChangeText={setSelectedVenue} placeholder="Auditorio Nacional" />
          <Input label="Ubicación (Ciudad, Estado)" value={location} onChangeText={setLocation} placeholder="CDMX, México" />
          
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input label="Fecha (AAAA-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-10-31" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input label="Hora (HH:MM)" value={time} onChangeText={setTime} placeholder="20:00" />
            </View>
          </View>

          <Input label="Precio Base (MXN)" value={priceBase} onChangeText={setPriceBase} placeholder="350" keyboardType="numeric" />

          {/* Category badges */}
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.categoriesSelect}>
            {['concert', 'sport', 'theater', 'festival'].map((cat) => {
              const isSel = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catOpt, isSel && styles.catOptSelected]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catOptText, isSel && styles.catOptTextSelected]}>
                    {cat === 'concert' ? 'Concierto' : cat === 'sport' ? 'Deporte' : cat === 'theater' ? 'Teatro' : 'Festival'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.formButtons}>
            <Button title="Cancelar" onPress={handleCancelEdit} variant="outline" style={{ flex: 1, marginRight: 8 }} />
            <Button title="Guardar" onPress={handleSave} variant="primary" style={{ flex: 1, marginLeft: 8 }} />
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Todos los Eventos ({events.length})</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setIsEditing(true)}>
              <Plus size={16} color={theme.colors.white} style={{ marginRight: 6 }} />
              <Text style={styles.addBtnText}>Añadir</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          ) : (
            <FlatList
              data={events}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderEventItem}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radii.base,
  },
  addBtnText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: theme.typography.fontBold,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    padding: 14,
    marginBottom: 10,
  },
  eventDetails: {
    flex: 1,
  },
  eventName: {
    fontSize: 15,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: theme.colors.gray600,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: theme.typography.fontMedium,
    color: theme.colors.gray700,
    marginBottom: 8,
  },
  categoriesSelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  catOpt: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    marginRight: 8,
    marginBottom: 8,
  },
  catOptSelected: {
    backgroundColor: theme.colors.black,
    borderColor: theme.colors.black,
  },
  catOptText: {
    fontSize: 12,
    color: theme.colors.gray700,
  },
  catOptTextSelected: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontBold,
  },
  formButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
});

export default AdminEventsScreen;
