import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context';
import { ticketAPI, getApiBaseUrl } from '../../services';
import { Header, Badge } from '../../components';
import { CreditCard, MapPin, Landmark, Calendar, Search } from 'lucide-react-native';
import styles from '../../styles/screens/UserHistory.styles';
import theme from '../../styles/theme';
import { formatDate, formatCurrency } from '../../utils/format';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80',
];

const MONTH_NAMES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

export const UserHistoryScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('todos');
  const [visibleCount, setVisibleCount] = useState(10);

  const loadHistory = useCallback(async (background = false) => {
    if (!isAuthenticated()) return;
    if (!background) setLoading(true);
    try {
      const resp = await ticketAPI.getMyTickets();
      setTickets(Array.isArray(resp) ? resp : []);
    } catch (err) {
      console.warn('Error loading purchase history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory(true);
  };

  const getCleanBaseUrl = () => {
    return getApiBaseUrl().replace(/\/api$/, '');
  };

  if (!isAuthenticated()) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack />
        <View style={styles.center}>
          <CreditCard size={64} color={theme.colors.gray400} style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 20, fontWeight: theme.typography.fontBlack, color: theme.colors.black, marginBottom: 8 }}>
            Historial de Compras
          </Text>
          <Text style={{ fontSize: 13, color: theme.colors.gray600, textAlign: 'center', lineHeight: 18, marginBottom: 24, paddingHorizontal: 32 }}>
            Inicia sesión para ver tu reporte de compras, total gastado y estadísticas de visitas.
          </Text>
          <TouchableOpacity
            style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: theme.colors.black, borderRadius: theme.radii.sm }}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={{ color: theme.colors.white, fontSize: 10, fontWeight: theme.typography.fontBlack, letterSpacing: 1.5 }}>INICIAR SESIÓN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate stats
  const totalSpent = tickets.reduce((acc, t) => acc + parseFloat(t.price || 0), 0);
  const uniqueVenues = new Set(tickets.map(t => t.venue_name || 'Laika Arena')).size;
  const totalEvents = tickets.length;

  // Filtered tickets
  const filteredTickets = tickets.filter(t => {
    if (filter === 'todos') return true;
    return t.status === filter;
  });

  // Group by Month/Year
  const groupTicketsByMonth = (list) => {
    const sorted = [...list].sort((a, b) => new Date(b.event_date || b.date) - new Date(a.event_date || a.date));
    const groups = [];
    
    sorted.slice(0, visibleCount).forEach(t => {
      const d = new Date(t.event_date || t.date || new Date());
      const month = MONTH_NAMES[d.getMonth()];
      const year = d.getFullYear();
      const monthKey = `${month} ${year}`;
      
      let existingGroup = groups.find(g => g.key === monthKey);
      if (!existingGroup) {
        existingGroup = { key: monthKey, month, year, items: [] };
        groups.push(existingGroup);
      }
      existingGroup.items.push(t);
    });
    
    return groups;
  };

  const groupedTimeline = groupTicketsByMonth(filteredTickets);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.black} />
          <Text style={styles.loadingText}>Analizando facturas y compras...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.black]} />
          }
        >
          {/* Stats Summary Header */}
          <View style={styles.headerRow}>
            <Text style={styles.titleLabel}>HISTORIAL COLECTIVO</Text>
            
            <View style={styles.statRow}>
              {/* Eventos */}
              <View style={styles.statCard}>
                <View style={styles.statIconBox}>
                  <Calendar size={12} color={theme.colors.black} />
                </View>
                <View>
                  <Text style={styles.statVal}>{totalEvents}</Text>
                  <Text style={styles.statLabel}>Shows</Text>
                </View>
              </View>

              {/* Gastado */}
              <View style={styles.statCard}>
                <View style={styles.statIconBox}>
                  <CreditCard size={12} color={theme.colors.black} />
                </View>
                <View>
                  <Text style={styles.statVal}>{formatCurrency(totalSpent)}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>

              {/* Recintos */}
              <View style={styles.statCard}>
                <View style={styles.statIconBox}>
                  <Landmark size={12} color={theme.colors.black} />
                </View>
                <View>
                  <Text style={styles.statVal}>{uniqueVenues}</Text>
                  <Text style={styles.statLabel}>Sedes</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Filters Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {[
              { id: 'todos', label: 'TODOS' },
              { id: 'confirmed', label: 'CONFIRMADO' },
              { id: 'active', label: 'ACTIVO' },
              { id: 'used', label: 'USADO' },
              { id: 'cancelled', label: 'CANCELADO' },
              { id: 'refunded', label: 'REEMBOLSADO' },
            ].map(f => (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterBtn, filter === f.id && styles.filterBtnActive]}
                onPress={() => {
                  setFilter(f.id);
                  setVisibleCount(10);
                }}
              >
                <Text style={[styles.filterText, filter === f.id && styles.filterTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Timeline */}
          {groupedTimeline.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No se encontraron compras en esta categoría.</Text>
            </View>
          ) : (
            <View>
              {groupedTimeline.map((group, groupIdx) => (
                <View key={group.key} style={styles.timelineRow}>
                  {/* Left Column (Month label) */}
                  <View style={styles.monthColumn}>
                    <Text style={styles.monthWord}>{group.month}</Text>
                    <Text style={styles.yearWord}>{group.year}</Text>
                  </View>

                  {/* Right Column (Timeline items) */}
                  <View style={styles.timelineCore}>
                    {/* Vertical Connecting Line */}
                    <View style={styles.verticalLine} />

                    {group.items.map((item, itemIdx) => {
                      const image = item.image_url || item.event_image_url || item.event?.image_url;
                      const imageUri = image
                        ? (image.startsWith('http') ? image : `${getCleanBaseUrl()}${image}`)
                        : FALLBACK_IMAGES[(groupIdx + itemIdx) % FALLBACK_IMAGES.length];
                      
                       const itemStatus = item.status || 'used';
                      const STATUS_MAP = {
                        active: { label: 'Activo', variant: 'primary' },
                        confirmed: { label: 'Confirmado', variant: 'info' },
                        used: { label: 'Canjeado', variant: 'secondary' },
                        cancelled: { label: 'Cancelado', variant: 'error' },
                        refunded: { label: 'Reembolsado', variant: 'warning' },
                      };
                      const st = STATUS_MAP[itemStatus] || { label: itemStatus.toUpperCase(), variant: 'secondary' };

                      return (
                        <View key={item.id || itemIdx} style={styles.timelineItem}>
                          {/* Dot indicator */}
                          <View style={styles.timelineDot} />

                          {/* Item card */}
                          <View style={styles.itemCard}>
                            <Image source={{ uri: imageUri }} style={styles.eventThumb} resizeMode="cover" />
                            
                            <View style={styles.itemInfo}>
                              <Text style={styles.eventTitle} numberOfLines={1}>
                                {item.event_name || 'Espectáculo'}
                              </Text>
                              <View style={styles.metaRow}>
                                <Text style={styles.metaText}>
                                  📅 {formatDate(item.event_date || item.date)}
                                </Text>
                                <Text style={styles.metaText}>
                                  📍 {item.venue_name || 'Laika Arena'}
                                </Text>
                              </View>
                            </View>

                            <View style={styles.rightCol}>
                              <Text style={styles.itemPrice}>
                                {formatCurrency(item.price || 0)}
                              </Text>
                              <Badge text={st.label} variant={st.variant} />
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}

              {/* Load More Button */}
              {filteredTickets.length > visibleCount && (
                <TouchableOpacity
                  style={styles.loadMoreBtn}
                  onPress={() => setVisibleCount(prev => prev + 10)}
                >
                  <Text style={styles.loadMoreText}>VER MÁS REGISTROS</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default UserHistoryScreen;
