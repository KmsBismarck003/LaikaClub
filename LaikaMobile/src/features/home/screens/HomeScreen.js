import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHomeEvents } from '../hooks/useHomeEvents';

// Components
import HomeTopNav from '../components/HomeTopNav';
import HomeHeroCarousel from '../components/HomeHeroCarousel';
import HomeCategoryFilter from '../components/HomeCategoryFilter';
import HomeDiscovery from '../components/HomeDiscovery';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import SkeletonHero from '../components/skeletons/SkeletonHero';
import SkeletonEventGrid from '../components/skeletons/SkeletonEventGrid';
import { EventCard } from '../../../components';
import { getApiBaseUrl } from '../../../services';

export const HomeScreen = ({ navigation }) => {
  const {
    events,
    filteredEvents,
    featuredEvents,
    listEvents,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    loading,
    refreshing,
    error,
    onRefresh,
    loadData,
  } = useHomeEvents();

  // Handle auto-refresh on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Re-fetch or refresh if needed without full loading state
      loadData(true);
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const handleEventPress = useCallback((eventId) => {
    navigation.navigate('EventDetail', { eventId });
  }, [navigation]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
  }, [setSearchTerm, setSelectedCategory]);

  const getCleanBaseUrl = () => getApiBaseUrl().replace(/\/api$/, '');

  const renderHeader = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.headerContainer}>
          <SkeletonHero />
          <HomeCategoryFilter 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />
          <SkeletonEventGrid count={4} />
        </View>
      );
    }

    if (error && filteredEvents.length === 0) {
      return (
        <View style={styles.headerContainer}>
          <ErrorState message={error} onRetry={() => loadData()} />
        </View>
      );
    }

    if (filteredEvents.length === 0) {
      return (
        <View style={styles.headerContainer}>
          <HomeCategoryFilter 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />
          <EmptyState onClear={handleClearFilters} />
        </View>
      );
    }

    return (
      <View style={styles.headerContainer}>
        {/* HERO CAROUSEL */}
        <HomeHeroCarousel events={featuredEvents} onEventPress={handleEventPress} />

        {/* CATEGORY FILTER */}
        <HomeCategoryFilter 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />

        {/* GRID SECTION HEADER */}
        {listEvents.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>TODOS LOS EVENTOS</Text>
              <Text style={styles.sectionCount}>{listEvents.length} EVENTOS</Text>
            </View>
            <View style={styles.sectionDivider} />
          </>
        )}
      </View>
    );
  };

  const renderFooter = () => {
    if (loading || (error && filteredEvents.length === 0) || filteredEvents.length === 0) {
      return null;
    }
    
    // Pasa los eventos al Discovery section
    return (
      <HomeDiscovery 
        recentlyViewed={events.slice(0, 3)} 
        events={events} 
        onEventPress={handleEventPress} 
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      
      {/* TOP NAV FIXO */}
      <HomeTopNav 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onMenuPress={() => navigation.navigate('Perfil')}
        onSearchPress={() => {}} 
      />

      {/* CONTENIDO PRINCIPAL */}
      <FlatList
        data={(!loading && !error) ? listEvents : []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <EventCard
            event={item}
            customBaseUrl={getCleanBaseUrl()}
            onPress={() => handleEventPress(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        showsVerticalScrollIndicator={false}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContent: {
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    paddingBottom: 16,
  },
  sectionTitle: {
    color: '#000',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sectionCount: {
    color: '#888',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 16,
    marginBottom: 24,
  },
});

export default HomeScreen;
