import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useCart } from '../../context';
import { ticketAPI, eventAPI, getApiBaseUrl } from '../../services';
import { Header } from '../../components';
import { Calendar, MapPin, ShoppingCart, Ticket, Award, ChevronRight, Sparkles } from 'lucide-react-native';
import styles from '../../styles/screens/UserDashboard.styles';
import theme from '../../styles/theme';
import { formatDate, formatTime } from '../../utils/format';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80',
];

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getTierInfo(ticketCount) {
  if (ticketCount >= 10) return { emoji: '💎', label: 'Elite', color: '#ffd700' };
  if (ticketCount >= 5) return { emoji: '🔥', label: 'Pro Fan', color: '#f97316' };
  if (ticketCount >= 1) return { emoji: '⭐', label: 'Fan', color: '#3b82f6' };
  return { emoji: '🌱', label: 'Nuevo', color: '#22c55e' };
}

export const UserDashboardScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, addToCart } = useCart();
  
  const [events, setEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingId, setAddingId] = useState(null);

  const loadData = useCallback(async (background = false) => {
    if (!background) setLoading(true);
    try {
      const [evRes, ticketRes] = await Promise.all([
        eventAPI.getPublic({ limit: 6 }).catch(() => []),
        isAuthenticated() ? ticketAPI.getMyTickets().catch(() => []) : Promise.resolve([]),
      ]);
      setEvents(Array.isArray(evRes) ? evRes : []);
      setMyTickets(Array.isArray(ticketRes) ? ticketRes : []);
    } catch (err) {
      console.warn('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleAdd = (event) => {
    setAddingId(event.id);
    
    const cartItem = {
      event_id: event.id,
      event_name: event.name,
      date: event.date || event.event_date,
      time: event.time || event.event_time,
      venue: event.venue || event.venue_name,
      location: event.location,
      row: 1,
      column: 1,
      price: event.price_base || event.price || 300,
    };
    
    addToCart(cartItem);
    setTimeout(() => {
      setAddingId(null);
      Alert.alert(
        '¡Agregado!',
        `Se agregó un boleto de "${event.name}" a tu carrito.`,
        [
          { text: 'Ver Carrito', onPress: () => navigation.navigate('Cart') },
          { text: 'Seguir Explorando', style: 'cancel' }
        ]
      );
    }, 400);
  };

  if (!isAuthenticated()) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack />
        <View style={styles.center}>
          <Ticket size={64} color={theme.colors.gray400} style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 20, fontWeight: theme.typography.fontBlack, color: theme.colors.black, marginBottom: 8 }}>
            Tu Área Personal
          </Text>
          <Text style={{ fontSize: 13, color: theme.colors.gray600, textAlign: 'center', lineHeight: 18, marginBottom: 24, paddingHorizontal: 32 }}>
            Inicia sesión para ver tu resumen de boletos, logros y estadísticas de conciertos en Laika Club.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.exploreBtnText}>INICIAR SESIÓN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getCleanBaseUrl = () => {
    return getApiBaseUrl().replace(/\/api$/, '');
  };

  const firstName = user?.firstName || user?.first_name || 'Amigo';
  const tier = getTierInfo(myTickets.length);
  
  // Find next upcoming ticket
  const nextTicket = myTickets
    .filter(t => t.event_date || t.date)
    .sort((a, b) => new Date(a.event_date || a.date) - new Date(b.event_date || b.date))
    .find(t => {
      const days = getDaysUntil(t.event_date || t.date);
      return days !== null && days >= 0;
    });

  const daysUntil = nextTicket ? getDaysUntil(nextTicket.event_date || nextTicket.date) : null;
  const discoverEvents = events.slice(0, 4);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.black} />
          <Text style={styles.loadingText}>Cargando tu panel de control...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.black]} />
          }
        >
          {/* 1. GREETING BANNER */}
          <View style={styles.banner}>
            <Text style={styles.bannerSubtitle}>Bienvenido de vuelta</Text>
            <Text style={styles.bannerTitle}>¡Hola, {firstName}! 👋</Text>
            
            <View style={styles.badgeRow}>
              <View style={[styles.tierBadge, { borderColor: tier.color, backgroundColor: `${tier.color}20` }]}>
                <Award size={12} color={tier.color} style={{ marginRight: 4 }} />
                <Text style={[styles.tierText, { color: tier.color }]}>Nivel {tier.label}</Text>
              </View>
              
              {cartItems.length > 0 && (
                <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
                  <ShoppingCart size={12} color={theme.colors.white} />
                  <Text style={styles.cartBtnText}>{cartItems.length} en carrito</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick Actions Buttons */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: theme.colors.black, borderRadius: theme.radii.sm, paddingVertical: 12, alignItems: 'center' }}
              onPress={() => navigation.navigate('Mis Tickets')}
            >
              <Text style={{ color: theme.colors.white, fontSize: 10, fontWeight: theme.typography.fontBlack, letterSpacing: 1.5 }}>MIS BOLETOS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, borderWidth: 1.5, borderColor: theme.colors.black, borderRadius: theme.radii.sm, paddingVertical: 12, alignItems: 'center' }}
              onPress={() => navigation.navigate('UserHistory')}
            >
              <Text style={{ color: theme.colors.black, fontSize: 10, fontWeight: theme.typography.fontBlack, letterSpacing: 1.5 }}>HISTORIAL</Text>
            </TouchableOpacity>
          </View>

          {/* 2. NEXT EVENT HERO */}
          <Text style={styles.sectionLabel}>Tu próximo evento</Text>
          {nextTicket ? (
            <TouchableOpacity
              style={styles.heroCard}
              onPress={() => navigation.navigate('Mis Tickets')}
            >
              <Image
                source={{
                  uri: nextTicket.image_url || nextTicket.event_image_url || nextTicket.event?.image_url || FALLBACK_IMAGES[0]
                }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.heroGradient} />
              
              <View style={styles.heroContent}>
                <Text style={styles.heroSub}>Tu próxima experiencia</Text>
                <Text style={styles.heroTitle} numberOfLines={1}>
                  {nextTicket.event_name || nextTicket.eventName || 'Espectáculo'}
                </Text>
                <Text style={styles.nextEventDetail}>
                  {formatDate(nextTicket.event_date || nextTicket.date)} · {nextTicket.venue_name || 'Laika Arena'}
                </Text>

                <View style={styles.heroFooter}>
                  {daysUntil !== null && (
                    <View style={styles.countdownPill}>
                      <Text style={styles.countdownVal}>
                        {daysUntil === 0 ? '¡HOY!' : daysUntil}
                      </Text>
                      {daysUntil > 0 && <Text style={styles.countdownSub}>DÍAS</Text>}
                    </View>
                  )}

                  <View style={styles.actionBtn}>
                    <Text style={styles.actionBtnText}>VER BOLETO →</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.noTicketsCard}>
              <Text style={styles.noTicketsEmoji}>🎟</Text>
              <Text style={styles.noTicketsTitle}>¡Tu primera aventura te espera!</Text>
              <Text style={styles.noTicketsSub}>Descubre eventos increíbles y reserva tu primer boleto en LAIKA.</Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('Eventos')}
              >
                <Text style={styles.exploreBtnText}>EXPLORAR EVENTOS</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 3. DISCOVER EVENTS */}
          {discoverEvents.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.sectionLabel}>Descubrir Eventos</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Eventos')}>
                  <Text style={{ fontSize: 10, fontWeight: theme.typography.fontBlack, color: theme.colors.black, letterSpacing: 1 }}>VER TODOS →</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.discoverGrid}>
                {discoverEvents.map((event, idx) => {
                  const image = event.image_url
                    ? (event.image_url.startsWith('http') ? event.image_url : `${getCleanBaseUrl()}${event.image_url}`)
                    : FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
                  
                  const eventPrice = event.price_base !== undefined && event.price_base !== null ? event.price_base : event.price;
                  const eventDate = event.date || event.event_date;

                  return (
                    <View key={event.id || idx} style={styles.miniEventCard}>
                      <Image source={{ uri: image }} style={styles.miniImage} resizeMode="cover" />
                      <View style={styles.miniGradient} />
                      <Text style={styles.miniPrice}>${parseFloat(eventPrice || 0).toFixed(0)}</Text>
                      
                      <View style={styles.miniContent}>
                        <Text style={styles.miniTitle} numberOfLines={1}>{event.name}</Text>
                        <Text style={styles.recentEventDate}>
                          {formatDate(eventDate)}
                        </Text>
                        
                        <TouchableOpacity
                          style={[styles.miniAddBtn, addingId === event.id && { backgroundColor: '#22c55e' }]}
                          onPress={() => handleAdd(event)}
                          disabled={addingId === event.id}
                        >
                          <Text style={[styles.miniAddText, addingId === event.id && { color: theme.colors.white }]}>
                            {addingId === event.id ? '✓ AGREGADO' : 'AGREGAR'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* 4. ACTIVITY FEED */}
          {myTickets.length > 0 && (
            <View>
              <Text style={styles.sectionLabel}>Actividad Reciente</Text>
              <View style={styles.feedList}>
                {myTickets.slice(0, 3).map((ticket, idx) => {
                  const image = ticket.image_url || ticket.event_image_url || ticket.event?.image_url;
                  const imageUri = image
                    ? (image.startsWith('http') ? image : `${getCleanBaseUrl()}${image}`)
                    : FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
                  
                  return (
                    <TouchableOpacity
                      key={ticket.id || idx}
                      style={styles.feedItem}
                      onPress={() => navigation.navigate('Mis Tickets')}
                    >
                      <Image source={{ uri: imageUri }} style={styles.feedImage} resizeMode="cover" />
                      <View style={styles.feedInfo}>
                        <Text style={styles.feedTitle} numberOfLines={1}>
                          {ticket.event_name || ticket.eventName || 'Espectáculo'}
                        </Text>
                        <Text style={styles.feedCode}>
                          🎫 {ticket.ticket_code || `TKT-${ticket.id}`}
                        </Text>
                      </View>
                      <View style={styles.feedRight}>
                        <Text style={styles.feedPrice}>${parseFloat(ticket.price || 0).toLocaleString('es-MX')}</Text>
                        <ChevronRight size={14} color={theme.colors.gray400} style={{ marginTop: 2 }} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default UserDashboardScreen;
