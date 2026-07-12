import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../styles/theme';
import { Header, Button, Input } from '../../components';
import { adsAPI, getApiBaseUrl } from '../../services';
import { Trash2, Megaphone, Eye, Plus, ExternalLink } from 'lucide-react-native';

export const AdminAdsScreen = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const fetchAds = async () => {
    setLoading(true);
    try {
      const data = await adsAPI.getAll();
      setAds(data || []);
    } catch (err) {
      console.warn('Error loading ads:', err);
      // Fallback
      setAds([
        { id: 1, title: 'Gran Venta Nocturna', image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87', link_url: 'https://laikaclub.com' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleDelete = (id) => {
    Alert.alert('Confirmar eliminación', '¿Deseas eliminar esta campaña publicitaria?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await adsAPI.delete(id);
            Alert.alert('Removido', 'Campaña eliminada.');
            fetchAds();
          } catch (err) {
            Alert.alert('Error', 'No se pudo eliminar el anuncio.');
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!title.trim() || !imageUrl.trim()) {
      Alert.alert('Formulario', 'Completa el título y la URL de imagen.');
      return;
    }

    setLoading(true);
    try {
      await adsAPI.create({
        title: title.trim(),
        image_url: imageUrl.trim(),
        link_url: linkUrl.trim() || null,
        status: 'active',
      });
      Alert.alert('Éxito', 'Campaña guardada con éxito.');
      handleCancel();
      fetchAds();
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar la campaña.');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setImageUrl('');
    setLinkUrl('');
    setIsAdding(false);
  };

  const getCleanBaseUrl = () => {
    return getApiBaseUrl().replace(/\/api$/, '');
  };

  const renderAdItem = ({ item }) => {
    const isRelative = item.image_url && !item.image_url.startsWith('http');
    const fullImgUrl = isRelative ? `${getCleanBaseUrl()}${item.image_url}` : item.image_url;

    return (
      <View style={styles.adRow}>
        {item.image_url ? (
          <Image source={{ uri: fullImgUrl }} style={styles.adThumb} resizeMode="cover" />
        ) : (
          <View style={[styles.adThumb, styles.thumbPlaceholder]}>
            <Megaphone size={16} color={theme.colors.gray500} />
          </View>
        )}
        
        <View style={styles.adInfo}>
          <Text style={styles.adTitle} numberOfLines={1}>{item.title}</Text>
          {item.link_url && (
            <View style={styles.linkRow}>
              <ExternalLink size={10} color={theme.colors.gray500} style={{ marginRight: 4 }} />
              <Text style={styles.linkText} numberOfLines={1}>{item.link_url}</Text>
            </View>
          )}
          <Text style={styles.clickCount}>Campaña Activa</Text>
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Trash2 size={16} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="GESTOR ANUNCIOS" showBack />
      
      {isAdding ? (
        <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.formTitle}>Nuevo Banner Publicitario</Text>

          <Input label="Título de la campaña" value={title} onChangeText={setTitle} placeholder="Venta de Fin de Año" />
          <Input label="URL de Imagen de Fondo" value={imageUrl} onChangeText={setImageUrl} placeholder="https://ejemplo.com/banner.jpg" autoCapitalize="none" />
          <Input label="Enlace de Acción (URL)" value={linkUrl} onChangeText={setLinkUrl} placeholder="https://laikaclub.com/evento" autoCapitalize="none" />

          <View style={styles.formButtons}>
            <Button title="Cancelar" onPress={handleCancel} variant="outline" style={{ flex: 1, marginRight: 8 }} />
            <Button title="Guardar Campaña" onPress={handleSave} variant="primary" style={{ flex: 1, marginLeft: 8 }} />
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Campañas Activas ({ads.length})</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setIsAdding(true)}>
              <Plus size={16} color={theme.colors.white} style={{ marginRight: 6 }} />
              <Text style={styles.addBtnText}>Nuevo Banner</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          ) : (
            <FlatList
              data={ads}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderAdItem}
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
  adRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    padding: 12,
    marginBottom: 10,
  },
  adThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: theme.colors.gray200,
  },
  thumbPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  adInfo: {
    flex: 1,
    marginLeft: 12,
  },
  adTitle: {
    fontSize: 14,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginBottom: 2,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  linkText: {
    fontSize: 10,
    color: theme.colors.gray500,
  },
  clickCount: {
    fontSize: 11,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
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

export default AdminAdsScreen;
