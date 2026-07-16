import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, FlatList, Animated } from 'react-native';
import { MapPin, Calendar, ArrowRight } from 'lucide-react-native';
import { getApiBaseUrl } from '../../../services';

const { width } = Dimensions.get('window');

const HomeHeroCarousel = ({ events, onEventPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const getCleanBaseUrl = () => getApiBaseUrl().replace(/\/api$/, '');

  const renderItem = ({ item, index }) => {
    const imageUrl = item.image_url 
      ? (item.image_url.startsWith('http') ? item.image_url : `${getCleanBaseUrl()}${item.image_url}`)
      : 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80';

    return (
      <View style={styles.heroSlide}>
        <Image source={{ uri: imageUrl }} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.heroGradient}>
          <Text style={styles.heroPageIndicators}>
            {String(index + 1).padStart(2, '0')} / {String(events.length).padStart(2, '0')}
          </Text>
          <Text style={styles.heroBadge}>• {item.category?.toUpperCase() || 'EVENTO'}</Text>
          <Text style={styles.heroTitle} numberOfLines={2}>{item.name}</Text>
          
          <View style={styles.heroMetaRow}>
            <View style={styles.heroMetaItem}>
              <Calendar color="#ccc" size={14} />
              <Text style={styles.heroMetaText}>{item.date || item.event_date}</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <MapPin color="#ccc" size={14} />
              <Text style={styles.heroMetaText} numberOfLines={1}>{item.venue || 'Laika Venue'}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.heroButton}
            onPress={() => onEventPress(item.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.heroButtonText}>Ver evento</Text>
            <ArrowRight color="#000" size={16} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Autoplay functionality
  useEffect(() => {
    if (!events || events.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % events.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [events]);

  if (!events || events.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={events}
        keyExtractor={(item) => `hero-${item.id}`}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />
      
      {events.length > 1 && (
        <View style={styles.sliderDots}>
          {events.map((_, i) => (
            <View 
              key={`dot-${i}`} 
              style={[
                styles.dot, 
                currentIndex === i ? styles.dotActive : styles.dotInactive
              ]} 
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 480,
    marginBottom: 24,
    backgroundColor: '#111',
    position: 'relative',
  },
  heroSlide: {
    width: width,
    height: 480,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroPageIndicators: {
    position: 'absolute',
    top: 20,
    right: 20,
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    opacity: 0.7,
  },
  heroBadge: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
    opacity: 0.7,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 38,
    marginBottom: 16,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  heroMetaText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  heroButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  heroButtonText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 14,
    marginRight: 8,
  },
  sliderDots: {
    position: 'absolute',
    bottom: 12,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 20,
    height: 2,
    backgroundColor: '#fff',
    marginHorizontal: 3,
  },
  dotActive: {
    opacity: 1,
  },
  dotInactive: {
    opacity: 0.3,
  },
});

export default HomeHeroCarousel;
