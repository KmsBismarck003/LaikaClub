import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../styles/theme';
import { Header, Button, Input } from '../../components';
import { venueAPI } from '../../services';
import { Trash2, MapPin, Building, Plus } from 'lucide-react-native';

export const AdminVenuesScreen = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('México');
  const [city, setCity] = useState('');

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const data = await venueAPI.getAll();
      setVenues(data || []);
    } catch (err) {
      console.warn('Error loading venues:', err);
      Alert.alert('Error', 'No se pudieron obtener los recintos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleDelete = (id) => {
    Alert.alert('Confirmar eliminación', '¿Deseas eliminar este recinto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await venueAPI.delete(id);
            Alert.alert('Removido', 'Recinto eliminado con éxito.');
            fetchVenues();
          } catch (err) {
            Alert.alert('Error', 'No se pudo eliminar el recinto. Puede estar vinculado a eventos.');
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!name.trim() || !address.trim() || !city.trim()) {
      Alert.alert('Formulario', 'Completa los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await venueAPI.create({
        name: name.trim(),
        address: address.trim(),
        country: country.trim(),
        state: city.trim(), // API mapping state -> state / city
        status: 'active',
      });
      Alert.alert('Éxito', 'Recinto registrado.');
      handleCancel();
      fetchVenues();
    } catch (err) {
      Alert.alert('Error', err.message || 'No se pudo registrar el recinto.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setAddress('');
    setCity('');
    setIsAdding(false);
  };

  const renderVenueItem = ({ item }) => (
    <View style={styles.venueRow}>
      <View style={styles.venueInfo}>
        <View style={styles.nameRow}>
          <Building size={16} color={theme.colors.black} style={{ marginRight: 6 }} />
          <Text style={styles.venueName}>{item.name}</Text>
        </View>
        <View style={styles.addressRow}>
          <MapPin size={14} color={theme.colors.gray500} style={{ marginRight: 4 }} />
          <Text style={styles.venueAddress}>{item.address}, {item.state || item.location}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
        <Trash2 size={16} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="GESTOR RECINTOS" showBack />
      
      {isAdding ? (
        <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.formTitle}>Agregar Nuevo Recinto</Text>

          <Input label="Nombre del Complejo" value={name} onChangeText={setName} placeholder="Arena Laika" />
          <Input label="Dirección Completa" value={address} onChangeText={setAddress} placeholder="Av. Principal #123, Centro" />
          <Input label="Estado / Ciudad" value={city} onChangeText={setCity} placeholder="Jalisco" />
          <Input label="País" value={country} onChangeText={setCountry} placeholder="México" />

          <View style={styles.formButtons}>
            <Button title="Cancelar" onPress={handleCancel} variant="outline" style={{ flex: 1, marginRight: 8 }} />
            <Button title="Guardar Recinto" onPress={handleSave} variant="primary" style={{ flex: 1, marginLeft: 8 }} />
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Todos los Recintos ({venues.length})</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setIsAdding(true)}>
              <Plus size={16} color={theme.colors.white} style={{ marginRight: 6 }} />
              <Text style={styles.addBtnText}>Nuevo Recinto</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          ) : (
            <FlatList
              data={venues}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderVenueItem}
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
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    padding: 16,
    marginBottom: 10,
  },
  venueInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  venueName: {
    fontSize: 15,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueAddress: {
    fontSize: 11,
    color: theme.colors.gray600,
  },
  deleteBtn: {
    padding: 10,
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  formButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
});

export default AdminVenuesScreen;
