import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context';
import { useManagerStats } from '../../hooks';
import { Header, ManagerStatsCards } from '../../components';
import styles from '../../styles/screens/manager/ManagerDashboard.styles';
import { Calendar, ChartBar, CreditCard, Users, Plus, Megaphone, Map } from 'lucide-react-native';

export const ManagerDashboardScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { stats, venues, loading, error, fetchDashboardData } = useManagerStats();

  const loadData = useCallback(async () => {
    try {
      await fetchDashboardData(user?.id);
    } catch (err) {
      if (err?.status === 401) {
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha expirado o no tienes permisos. Por favor inicia sesión de nuevo.',
          [{ text: 'Aceptar', onPress: () => logout() }]
        );
      }
    }
  }, [fetchDashboardData, user, logout]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const handleNav = (screenName, params = {}) => {
    navigation.navigate(screenName, params);
  };

  const shortcuts = [
    { id: 'events', label: 'Mis Eventos', screen: 'ManagerEvents', icon: Calendar },
    { id: 'stats', label: 'Analíticas', screen: 'ManagerAnalytics', icon: ChartBar },
    { id: 'transactions', label: 'Ventas', screen: 'ManagerTransactions', icon: CreditCard },
    { id: 'attendees', label: 'Asistentes', screen: 'ManagerAttendees', icon: Users },
    { id: 'create', label: 'Nuevo Evento', screen: 'ManagerEventForm', icon: Plus },
    { id: 'ads', label: 'Publicidad', screen: 'ManagerAds', icon: Megaphone },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="PANEL GESTOR" showBack onBackPress={() => navigation.navigate('UserProfile')} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} colors={['#000']} />
        }
      >
        {/* Welcome Greeting Banner */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeGreeting}>¡Hola, {user?.firstName || 'Gestor'}!</Text>
          <Text style={styles.welcomeDate}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>

        {/* Status indicator */}
        <View style={styles.vitalsPanel}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>ESTADO DEL GESTOR: CONECTADO Y ACTIVO</Text>
        </View>

        {/* Dashboard Stats Grid Component */}
        <Text style={styles.sectionTitle}>Métricas del Periodo</Text>
        <ManagerStatsCards stats={stats} />

        {/* Shortcuts */}
        <Text style={styles.sectionTitle}>Consola de Control</Text>
        <View style={styles.shortcutsGrid}>
          {shortcuts.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.shortcutCard}
                onPress={() => handleNav(item.screen)}
                activeOpacity={0.8}
              >
                <Text style={styles.shortcutLabel}>{item.label}</Text>
                <View style={styles.shortcutIconBox}>
                  <IconComponent size={18} color="#000" />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Assigned Venues */}
        <Text style={styles.sectionTitle}>Mis Recintos Asignados</Text>
        {venues.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No tienes recintos asignados en este momento. Contacta al Administrador.
            </Text>
          </View>
        ) : (
          venues.map((venue) => (
            <View key={venue.id} style={styles.venueCard}>
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{venue.name}</Text>
                <Text style={styles.venueLocation}>{venue.city}, {venue.state}</Text>
              </View>
              <View style={styles.venueActions}>
                {/* Quick Add Event Button */}
                <TouchableOpacity
                  style={[styles.venueActionBtn, styles.venueActionBtnPrimary]}
                  onPress={() => handleNav('ManagerEventForm', { venueId: venue.id, venueName: venue.name })}
                >
                  <Plus size={16} color="#fff" />
                </TouchableOpacity>
                {/* View map info details */}
                <TouchableOpacity
                  style={styles.venueActionBtn}
                  onPress={() => handleNav('ManagerEvents', { venueId: venue.id })}
                >
                  <Map size={16} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManagerDashboardScreen;
