import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context';
import { eventAPI, adsAPI, getApiBaseUrl } from '../../services';
import theme from '../../styles/theme';
import { Header, EventCard, Badge } from '../../components';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react-native';

const CATEGORIES = [
  { id: 'all', name: 'Todos' },
  { id: 'concert', name: 'Conciertos' },
  { id: 'sport', name: 'Deportes' },
  { id: 'theater', name: 'Teatro' },
  { id: 'festival', name: 'Festivales' },
  { id: 'family', name: 'Familiares' },
  { id: 'other', name: 'Otros' },
];

export const HomeScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [ads, setAds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      // Get API base URL host to pass to EventCard for images
      const [eventsRes, adsRes] = await Promise.all([
        eventAPI.getPublic({ limit: 50 }),
        adsAPI.getPublic().catch(() => []), // Fallback if ads service fails
      ]);
      setEvents(eventsRes || []);
      setAds(adsRes || []);
    } catch (err) {
      console.error('Error fetching home data:', err);
      setError('No se pudieron cargar los eventos. Verifica la conexión o configura la IP del servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Focus listener to reload data in case server settings changed
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const filteredEvents = events.filter((e) => {
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.venue && e.venue.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch && e.status === 'published';
  });

  const getCleanBaseUrl = () => {
    // Trim '/api' from base URL to reference media files like uploads
    return getApiBaseUrl().replace(/\/api$/, '');
  };

  const renderHeader = () => (
    <View style={styles.listHeader}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color={theme.colors.gray500} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar eventos, recintos..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={theme.colors.gray500}
          />
        </View>
      </View>

      {/* Ads Banner Slider */}
      {ads.length > 0 && (
        <View style={styles.adsContainer}>
          <Text style={styles.adsLabel}>ANUNCIOS DESTACADOS</Text>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {ads.map((ad) => (
              <View key={ad.id || ad._id} style={styles.adSlide}>
                <Image
                  source={{ uri: ad.image_url?.startsWith('http') ? ad.image_url : `${getCleanBaseUrl()}${ad.image_url}` }}
                  style={styles.adImage}
                  resizeMode="cover"
                />
                <View style={styles.adOverlay}>
                  <Text style={styles.adTitle}>{ad.title}</Text>
                  {ad.link_url && <Text style={styles.adLink}>Toca para ver más</Text>}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Category selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryButton,
                isSelected && styles.categoryButtonSelected,
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextSelected,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>Eventos Disponibles</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No se encontraron eventos</Text>
      <TouchableOpacity
        style={styles.clearFiltersButton}
        onPress={() => {
          setSearchTerm('');
          setSelectedCategory('all');
        }}
      >
        <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.black} />
          <Text style={styles.loadingText}>Cargando cartelera de Laika...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
            <RefreshCw size={16} color={theme.colors.white} style={{ marginRight: 6 }} />
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              customBaseUrl={getCleanBaseUrl()}
              onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#000']} />
          }
        />
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: theme.colors.gray600,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.radii.base,
  },
  retryText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontSemibold,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listHeader: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchSection: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.black,
  },
  categoriesContainer: {
    marginVertical: 12,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radii.round,
    backgroundColor: theme.colors.gray100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  categoryButtonSelected: {
    backgroundColor: theme.colors.black,
    borderColor: theme.colors.black,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: theme.typography.fontMedium,
    color: theme.colors.gray700,
  },
  categoryTextSelected: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontBold,
  },
  adsContainer: {
    marginBottom: 16,
  },
  adsLabel: {
    fontSize: 10,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.gray500,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  adSlide: {
    width: 320,
    height: 120,
    borderRadius: theme.radii.base,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
    backgroundColor: theme.colors.gray900,
  },
  adImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  adOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  adTitle: {
    color: theme.colors.white,
    fontSize: 13,
    fontWeight: theme.typography.fontBold,
  },
  adLink: {
    color: theme.colors.gray300,
    fontSize: 10,
    marginTop: 2,
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1.5,
    marginTop: 12,
    marginBottom: 8,
    color: theme.colors.black,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.gray500,
    marginBottom: 12,
  },
  clearFiltersButton: {
    borderWidth: 1.5,
    borderColor: theme.colors.black,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radii.base,
  },
  clearFiltersText: {
    color: theme.colors.black,
    fontWeight: theme.typography.fontSemibold,
    fontSize: 13,
  },
});

export default HomeScreen;
