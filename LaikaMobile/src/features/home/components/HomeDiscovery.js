import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Check } from 'lucide-react-native';
import { getApiBaseUrl } from '../../../services';

const { width } = Dimensions.get('window');

const HomeDiscovery = ({ recentlyViewed = [], events = [], onEventPress }) => {
  const getCleanBaseUrl = () => getApiBaseUrl().replace(/\/api$/, '');

  const renderSectionHeader = (title) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.headerLine} />
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* 1. VISTOS RECIENTEMENTE */}
      {recentlyViewed.length > 0 && (
        <View style={styles.discoverySection}>
          {renderSectionHeader('VISTOS RECIENTEMENTE')}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
            {recentlyViewed.map(item => {
              const imgUri = item.image ? (item.image.startsWith('http') ? item.image : `${getCleanBaseUrl()}${item.image}`) : 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=200&q=80';
              return (
                <TouchableOpacity 
                  key={`recent-${item.id}`} 
                  style={styles.recentPill}
                  onPress={() => onEventPress(item.id)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: imgUri }} style={styles.recentImg} />
                  <Text style={styles.recentText} numberOfLines={1}>{item.name}</Text>
                  <Check color="#000" size={14} style={styles.recentCheck} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {recentlyViewed.length > 0 && <View style={styles.divider} />}

      {/* 2. LO MÁS BUSCADO */}
      <View style={styles.discoverySection}>
        {renderSectionHeader('LO MÁS BUSCADO')}
        <View style={styles.mostSearchedGrid}>
          {events.slice(0, 4).map(event => {
            const imgUri = event.image_url ? (event.image_url.startsWith('http') ? event.image_url : `${getCleanBaseUrl()}${event.image_url}`) : 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&q=80';
            return (
              <TouchableOpacity 
                key={`ms-${event.id}`} 
                style={styles.miniEventCard}
                onPress={() => onEventPress(event.id)}
                activeOpacity={0.8}
              >
                <View style={styles.miniCardImageContainer}>
                  <Image source={{ uri: imgUri }} style={styles.miniCardImage} />
                </View>
                <View style={styles.miniCardInfo}>
                  <Text style={styles.miniVenue} numberOfLines={1}>{event.venue || 'VENUE LAIKA'}</Text>
                  <Text style={styles.miniName} numberOfLines={2}>{event.name}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.divider} />

      {/* 3. DESCUBRE BANNERS */}
      <View style={styles.discoverySection}>
        {renderSectionHeader('DESCUBRE')}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bannersScroll} decelerationRate="fast" snapToInterval={width * 0.85 + 16}>
          
          <TouchableOpacity style={[styles.categoryBanner, { backgroundColor: '#1e3a8a' }]} activeOpacity={0.9}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600' }} style={styles.bannerImg} />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerSubtitle}>ESTAMOS AQUÍ PARA TI</Text>
              <Text style={styles.bannerTitle}>BOTÓN DE AYUDA</Text>
              <Text style={styles.bannerLink}>VER MÁS</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.categoryBanner, { backgroundColor: '#831843' }]} activeOpacity={0.9}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' }} style={styles.bannerImg} />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerSubtitle}>TU PLAN COMIENZA AQUÍ</Text>
              <Text style={styles.bannerTitle}>PAQUETES VIP</Text>
              <Text style={styles.bannerLink}>VER MÁS</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
      </View>

      <View style={styles.divider} />

      {/* 4. CIUDADES MÁS BUSCADAS */}
      <View style={styles.discoverySection}>
        {renderSectionHeader('CIUDADES MÁS BUSCADAS')}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.citiesScroll}>
          <TouchableOpacity style={styles.cityCard} activeOpacity={0.8}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400' }} style={styles.cityImg} />
            <View style={styles.cityOverlay}>
              <Text style={styles.cityName}>Ciudad de México</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cityCard} activeOpacity={0.8}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=400' }} style={styles.cityImg} />
            <View style={styles.cityOverlay}>
              <Text style={styles.cityName}>Guadalajara</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cityCard} activeOpacity={0.8}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1577017040065-650ee4d43339?w=400' }} style={styles.cityImg} />
            <View style={styles.cityOverlay}>
              <Text style={styles.cityName}>Monterrey</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingBottom: 24,
  },
  discoverySection: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111',
    letterSpacing: 2,
    marginRight: 16,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e5e5',
  },
  divider: {
    height: 1,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
  },
  
  /* Vistos Recientemente */
  recentScroll: {
    paddingHorizontal: 16,
  },
  recentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 30,
    padding: 6,
    paddingRight: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recentImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  recentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginRight: 8,
    maxWidth: 120,
  },
  recentCheck: {
    opacity: 0.3,
  },

  /* Lo más buscado */
  mostSearchedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  miniEventCard: {
    width: '50%',
    padding: 4,
    marginBottom: 12,
  },
  miniCardImageContainer: {
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#eee',
    marginBottom: 8,
  },
  miniCardImage: {
    width: '100%',
    height: '100%',
  },
  miniCardInfo: {
    paddingHorizontal: 4,
  },
  miniVenue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#666',
    letterSpacing: 1,
    marginBottom: 2,
  },
  miniName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
    lineHeight: 16,
  },

  /* Descubre Banners */
  bannersScroll: {
    paddingHorizontal: 16,
  },
  categoryBanner: {
    width: width * 0.85,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
  },
  bannerImg: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  bannerSubtitle: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 12,
  },
  bannerLink: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  /* Ciudades */
  citiesScroll: {
    paddingHorizontal: 16,
  },
  cityCard: {
    width: 140,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: '#222',
  },
  cityImg: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  cityOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cityName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
});

export default HomeDiscovery;
