import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../context';
import { eventAPI, ticketAPI, getApiBaseUrl } from '../../services';
import theme from '../../styles/theme';
import { Header, VenueMap, Button, Badge } from '../../components';
import { formatCurrency, formatFullDate, formatTime } from '../../utils/format';
import { MapPin, Calendar, Clock, ShoppingCart } from 'lucide-react-native';

export const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { addToCart } = useCart();
  
  const [event, setEvent] = useState(null);
  const [busySeats, setBusySeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEventData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const eventData = await eventAPI.getById(eventId);
      setEvent(eventData);

      // Fetch occupied seats
      try {
        const busyRes = await ticketAPI.getBusySeats(eventId);
        // busyRes is usually a list of strings like ["1-2", "3-5"]
        setBusySeats(busyRes || []);
      } catch (err) {
        console.warn('Failed to load busy seats, using empty selection:', err);
        setBusySeats([]);
      }
    } catch (err) {
      console.error('Error fetching event detail:', err);
      setError('No se pudo cargar el detalle del evento.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  const handleSeatSelect = (row, col, price) => {
    const isSelected = selectedSeats.some((s) => s.row === row && s.col === col);
    if (isSelected) {
      // Remove
      setSelectedSeats(selectedSeats.filter((s) => !(s.row === row && s.col === col)));
    } else {
      // Add
      setSelectedSeats([...selectedSeats, { row, col, price }]);
    }
  };

  const handleAddToCart = () => {
    if (selectedSeats.length === 0) {
      Alert.alert('Selecciona asientos', 'Por favor selecciona al menos un asiento en el mapa.');
      return;
    }

    let addedCount = 0;
    selectedSeats.forEach((seat) => {
      const cartItem = {
        event_id: event.id,
        event_name: event.name,
        date: event.date,
        time: event.time,
        venue: event.venue,
        location: event.location,
        row: seat.row,
        column: seat.col,
        price: seat.price,
      };
      
      const success = addToCart(cartItem);
      if (success) addedCount++;
    });

    if (addedCount > 0) {
      Alert.alert(
        'Boletos añadidos',
        `Se agregaron ${addedCount} boletos a tu carrito.`,
        [
          { text: 'Seguir buscando', style: 'cancel' },
          { text: 'Ver Carrito', onPress: () => navigation.navigate('Cart') }
        ]
      );
      setSelectedSeats([]);
    } else {
      Alert.alert('Boletos ya agregados', 'Los asientos seleccionados ya están en tu carrito.');
    }
  };

  const getCleanBaseUrl = () => {
    return getApiBaseUrl().replace(/\/api$/, '');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.black} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack />
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || 'Detalle no disponible.'}</Text>
          <Button title="Volver al Inicio" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  // Seating configuration defaults if room doesn't exist
  const roomRows = event.rows_total || 6;
  const roomCols = event.cols_total || 8;
  const seatPrice = event.price_base || 300;

  const imageSource = event.image_url
    ? { uri: event.image_url.startsWith('http') ? event.image_url : `${getCleanBaseUrl()}${event.image_url}` }
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.bannerContainer}>
          {imageSource ? (
            <Image source={imageSource} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>LAIKA CLUB</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{event.name}</Text>
          <Badge text={event.category} style={styles.categoryBadge} />

          <Text style={styles.description}>{event.description}</Text>

          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <Calendar size={16} color={theme.colors.black} style={styles.detailIcon} />
              <Text style={styles.detailText}>{formatFullDate(event.date)}</Text>
            </View>
            <View style={styles.detailItem}>
              <Clock size={16} color={theme.colors.black} style={styles.detailIcon} />
              <Text style={styles.detailText}>{formatTime(event.time)} hrs</Text>
            </View>
            <View style={styles.detailItem}>
              <MapPin size={16} color={theme.colors.black} style={styles.detailIcon} />
              <Text style={styles.detailText}>
                {event.venue ? `${event.venue}, ` : ''}{event.location}
              </Text>
            </View>
          </View>
        </View>

        {/* Seating Map Section */}
        {event.status === 'published' && (
          <View style={styles.mapSection}>
            <Text style={styles.mapTitle}>SELECCIONA TUS ASIENTOS</Text>
            <Text style={styles.mapSubtitle}>
              Toca cada asiento para reservarlo. Precio base: {formatCurrency(seatPrice)}
            </Text>

            <VenueMap
              rows={roomRows}
              cols={roomCols}
              busySeats={busySeats}
              selectedSeats={selectedSeats}
              onSeatSelect={handleSeatSelect}
              basePrice={seatPrice}
            />

            {selectedSeats.length > 0 && (
              <View style={styles.selectionSummary}>
                <View>
                  <Text style={styles.summaryLabel}>Asientos seleccionados:</Text>
                  <Text style={styles.summaryValues}>
                    {selectedSeats.map((s) => `${String.fromCharCode(64 + s.row)}${s.col}`).join(', ')}
                  </Text>
                </View>
                <View style={styles.priceSummary}>
                  <Text style={styles.summaryLabel}>Total parcial:</Text>
                  <Text style={styles.summaryTotal}>
                    {formatCurrency(selectedSeats.reduce((acc, s) => acc + s.price, 0))}
                  </Text>
                </View>
              </View>
            )}

            <Button
              title={selectedSeats.length > 0 ? `Agregar ${selectedSeats.length} Boletos` : 'Selecciona Asientos'}
              onPress={handleAddToCart}
              disabled={selectedSeats.length === 0}
              variant="primary"
              icon={<ShoppingCart size={18} color="#fff" style={{ marginRight: 8 }} />}
              style={styles.cartButton}
            />
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  bannerContainer: {
    height: 220,
    backgroundColor: theme.colors.gray100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 4,
  },
  infoContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  title: {
    fontSize: 22,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
    marginBottom: 6,
  },
  categoryBadge: {
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: theme.colors.gray700,
    lineHeight: 20,
    marginBottom: 20,
  },
  detailsList: {
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.radii.base,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIcon: {
    marginRight: 10,
  },
  detailText: {
    fontSize: 13,
    color: theme.colors.gray800,
    fontWeight: theme.typography.fontMedium,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    marginBottom: 20,
  },
  mapSection: {
    padding: 20,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
    letterSpacing: 2,
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: 11,
    color: theme.colors.gray500,
    marginBottom: 16,
  },
  selectionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.gray50,
    borderWidth: 1.5,
    borderColor: theme.colors.black,
    borderRadius: theme.radii.base,
    padding: 12,
    marginVertical: 16,
  },
  summaryLabel: {
    fontSize: 10,
    color: theme.colors.gray500,
    fontWeight: theme.typography.fontBold,
  },
  summaryValues: {
    fontSize: 14,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginTop: 2,
  },
  priceSummary: {
    alignItems: 'flex-end',
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
    marginTop: 2,
  },
  cartButton: {
    marginTop: 10,
  },
});

export default EventDetailScreen;
