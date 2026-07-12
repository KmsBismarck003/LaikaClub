import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useManagerEvents } from '../../hooks';
import { useAuth } from '../../context';
import { Header, Badge } from '../../components';
import { getStatusLabel, getStatusVariant, formatDate, formatTime, formatCurrency } from '../../utils/managerUtils';
import styles from '../../styles/screens/manager/ManagerEvents.styles';
import { Play, SquareUser, Edit, Trash2, Calendar, MapPin, Ticket, Ban } from 'lucide-react-native';

const FILTER_TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'published', label: 'Públicos' },
  { id: 'draft', label: 'Borrador' },
  { id: 'cancelled', label: 'Cancelados' },
];

export const ManagerEventsScreen = ({ navigation, route }) => {
  const { logout } = useAuth();
  const { events, loading, error, fetchMyEvents, handleTogglePublish, handleCancel, handleDelete } = useManagerEvents();
  const [activeFilter, setActiveFilter] = useState('all');

  const loadData = useCallback(async () => {
    try {
      await fetchMyEvents();
    } catch (err) {
      if (err?.status === 401) {
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha expirado o no tienes permisos. Por favor inicia sesión de nuevo.',
          [{ text: 'Aceptar', onPress: () => logout() }]
        );
      }
    }
  }, [fetchMyEvents, logout]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const filteredEvents = events.filter((e) => {
    if (activeFilter === 'all') return true;
    return e.status === activeFilter;
  });

  const renderEventItem = ({ item }) => {
    const totalSold = parseInt(item.tickets_sold || item.sold_tickets || 0, 10);
    const totalRevenue = parseFloat(item.revenue || item.total_revenue || 0);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.eventName}>{item.name}</Text>
          <Badge
            text={getStatusLabel(item.status)}
            variant={getStatusVariant(item.status)}
          />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Calendar size={12} color="#737373" />
            <Text style={styles.infoText}>
              {formatDate(item.date)} a las {formatTime(item.time)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={12} color="#737373" />
            <Text style={styles.infoText}>{item.venue || item.location || 'N/D'}</Text>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Vendidos</Text>
            <Text style={styles.statVal}>{totalSold}</Text>
          </View>
          <View style={[styles.statCol, { borderLeftWidth: 1, borderLeftColor: '#e5e5e5', paddingLeft: 10 }]}>
            <Text style={styles.statLabel}>Recaudado</Text>
            <Text style={styles.statVal}>{formatCurrency(totalRevenue)}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          {/* Attendees */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('ManagerAttendees', { eventId: item.id, eventName: item.name })}
          >
            <SquareUser size={14} color="#525252" />
            <Text style={styles.actionBtnText}>Asistentes</Text>
          </TouchableOpacity>

          {/* Edit */}
          {item.status !== 'cancelled' && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('ManagerEventForm', { eventId: item.id })}
            >
              <Edit size={14} color="#525252" />
              <Text style={styles.actionBtnText}>Editar</Text>
            </TouchableOpacity>
          )}

          {/* Cancel */}
          {item.status === 'published' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDanger]}
              onPress={() => handleCancel(item)}
            >
              <Ban size={14} color="#ef4444" />
              <Text style={[styles.actionBtnText, styles.actionBtnDangerText]}>Cancelar</Text>
            </TouchableOpacity>
          )}

          {/* Toggle Publish (Draft/Published) */}
          {item.status !== 'cancelled' && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleTogglePublish(item)}
            >
              <Play size={14} color={item.status === 'published' ? '#d97706' : '#22c55e'} />
              <Text style={styles.actionBtnText}>
                {item.status === 'published' ? 'Pausar' : 'Publicar'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Delete */}
          {item.status === 'draft' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDanger]}
              onPress={() => handleDelete(item)}
            >
              <Trash2 size={14} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="MIS EVENTOS" showBack />

      {/* Header filter actions */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Eventos ({events.length})</Text>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate('ManagerEventForm')}
        >
          <Plus size={14} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.createBtnText}>Añadir</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs scroll list */}
      <View>
        <FlatList
          data={FILTER_TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterTabs}
          renderItem={({ item }) => {
            const isActive = activeFilter === item.id;
            return (
              <TouchableOpacity
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => setActiveFilter(item.id)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading && events.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderEventItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadData} colors={['#000']} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay espectáculos en esta categoría.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ManagerEventsScreen;
