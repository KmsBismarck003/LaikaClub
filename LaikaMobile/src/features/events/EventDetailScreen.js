import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../context';
import { eventAPI, ticketAPI, getApiBaseUrl } from '../../services';
import { VenueMap } from '../../components';
import { formatCurrency, formatFullDate, formatTime } from '../../utils/format';
import { MapPin, Calendar, Clock, ShoppingCart, ChevronLeft, Share2 } from 'lucide-react-native';

const { height } = Dimensions.get('window');

export const EventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { addToCart } = useCart();
  const insets = useSafeAreaInsets();
  
  const [event, setEvent] = useState(null);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [busySeats, setBusySeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isClaimingFree, setIsClaimingFree] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEventData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const eventData = await eventAPI.getById(eventId);
      setEvent(eventData);

      let initialFunctionId = null;
      if (eventData.functions && eventData.functions.length > 0) {
        setSelectedFunction(eventData.functions[0]);
        initialFunctionId = eventData.functions[0].id;
      }

      try {
        const busyRes = await ticketAPI.getBusySeats(eventId, initialFunctionId);
        setBusySeats(busyRes || []);
      } catch (err) {
        setBusySeats([]);
      }
    } catch (err) {
      setError('No se pudo cargar el detalle del evento.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const handleFunctionSelect = async (func) => {
    setSelectedFunction(func);
    setSelectedSeats([]);
    try {
      const busyRes = await ticketAPI.getBusySeats(event.id, func.id);
      setBusySeats(busyRes || []);
    } catch (err) {
      setBusySeats([]);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  const handleSeatSelect = (row, col, price) => {
    const isSelected = selectedSeats.some((s) => s.row === row && s.col === col);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => !(s.row === row && s.col === col)));
    } else {
      setSelectedSeats([...selectedSeats, { row, col, price }]);
    }
  };

  const isFreeEvent = event?.is_free === true || event?.price === 0 || event?.price_base === 0;

  const isEventSeating = event?.use_seating_map !== false && (
    (event?.room?.layout_json?.components?.length > 0) ||
    (event?.seating_map?.layout_json?.components?.length > 0) ||
    (event?.rows_total && event?.cols_total)
  );

  const handleAddToCart = () => {
    if (isEventSeating && selectedSeats.length === 0) {
      Alert.alert('Selecciona asientos', 'Por favor selecciona al menos un asiento.');
      return;
    }

    let addedCount = 0;
    const finalDate = selectedFunction ? (selectedFunction.event_date || selectedFunction.date) : (event.date || event.event_date);
    const finalTime = selectedFunction ? (selectedFunction.event_time || selectedFunction.time) : (event.time || event.event_time);
    
    if (isEventSeating) {
      selectedSeats.forEach((seat) => {
        const success = addToCart({
          event_id: event.id,
          event_name: event.name,
          date: finalDate,
          time: finalTime,
          venue: event.venue,
          location: event.location,
          row: seat.row,
          column: seat.col,
          price: seat.price,
          function_id: selectedFunction?.id || null,
        });
        if (success) addedCount++;
      });
    } else {
      for (let i = 0; i < quantity; i++) {
        const success = addToCart({
          event_id: event.id,
          event_name: event.name,
          date: finalDate,
          time: finalTime,
          venue: event.venue,
          location: event.location,
          price: event.price || event.price_base || 0,
          function_id: selectedFunction?.id || null,
        });
        if (success) addedCount++;
      }
    }

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
      setQuantity(1);
    }
  };

  const handleClaimFree = async () => {
    if (isEventSeating && selectedSeats.length === 0) {
      Alert.alert('Selecciona asientos', 'Por favor selecciona al menos un asiento.');
      return;
    }
    setIsClaimingFree(true);
    try {
      if (isEventSeating) {
        for (const seat of selectedSeats) {
          await ticketAPI.claimFree({
            eventId: event.id,
            functionId: selectedFunction?.id || null,
            seatId: `${seat.row}-${seat.col}`
          });
        }
      } else {
        for (let i = 0; i < quantity; i++) {
          await ticketAPI.claimFree({
            eventId: event.id,
            functionId: selectedFunction?.id || null
          });
        }
      }
      
      // Premium haptic feedback for success
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert('¡Éxito!', 'Entradas registradas en tu Wallet.', [
        { text: 'Ver mis boletos', onPress: () => navigation.navigate('Mis Tickets') },
        { text: 'Cerrar', style: 'cancel' }
      ]);
      setSelectedSeats([]);
      setQuantity(1);
      fetchEventData();
    } catch (err) {
      Alert.alert('Error', 'No se pudieron registrar las entradas.');
    } finally {
      setIsClaimingFree(false);
    }
  };

  const getCleanBaseUrl = () => getApiBaseUrl().replace(/\/api$/, '');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{color: '#ef4444', marginBottom: 16}}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnError}>
          <Text style={{color: '#fff'}}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const roomRows = event.rows_total || 6;
  const roomCols = event.cols_total || 8;
  const seatPrice = event.price_base || 300;

  const imageSource = event.image_url
    ? { uri: event.image_url.startsWith('http') ? event.image_url : `${getCleanBaseUrl()}${event.image_url}` }
    : { uri: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80' };

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Full Bleed Image Header */}
        <View style={styles.heroSection}>
          <Image source={imageSource} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay}>
            
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroBadge}>• {event.category?.toUpperCase() || 'ESPECTÁCULO'}</Text>
              <Text style={styles.heroTitle}>{event.name}</Text>
              
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Calendar size={14} color="#fff" style={styles.metaIcon} />
                  <Text style={styles.metaText}>
                    {formatFullDate(selectedFunction ? (selectedFunction.event_date || selectedFunction.date) : (event.date || event.event_date))}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#fff" style={styles.metaIcon} />
                  <Text style={styles.metaText}>
                    {formatTime(selectedFunction ? (selectedFunction.event_time || selectedFunction.time) : (event.time || event.event_time))} hrs
                  </Text>
                </View>
              </View>

              <View style={styles.metaItem}>
                <MapPin size={14} color="#fff" style={styles.metaIcon} />
                <Text style={styles.metaText}>{event.venue ? `${event.venue}, ` : ''}{event.location}</Text>
              </View>

              {/* Share FAB */}
              <TouchableOpacity style={styles.shareBtn}>
                <Share2 size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {event.functions && event.functions.length > 1 && (
            <View style={{ marginBottom: 24 }}>
              <Text style={styles.descriptionLabel}>FECHAS Y HORARIOS DISPONIBLES</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, paddingHorizontal: 24 }}>
                {event.functions.map((func) => {
                  const isSelected = selectedFunction?.id === func.id;
                  return (
                    <TouchableOpacity
                      key={func.id}
                      style={[
                        styles.functionPill,
                        isSelected && styles.functionPillActive
                      ]}
                      onPress={() => handleFunctionSelect(func)}
                    >
                      <Text style={[styles.functionPillText, isSelected && styles.functionPillTextActive]}>
                        {formatFullDate(func.event_date || func.date)}
                      </Text>
                      <Text style={[styles.functionPillTime, isSelected && styles.functionPillTextActive]}>
                        {formatTime(func.event_time || func.time)} hrs
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <View style={{ width: 48 }} />
              </ScrollView>
            </View>
          )}

          <Text style={styles.descriptionLabel}>ACERCA DEL EVENTO</Text>
          <Text style={styles.description}>{event.description}</Text>

          {/* Seating Map Section */}
          {event.status === 'published' && (
            <View style={styles.mapSection}>
              <View style={styles.mapHeaderRow}>
                <MapPin size={10} color="#ff3366" style={{marginRight: 4}} />
                <Text style={styles.mapTitle}>
                  {isEventSeating ? 'SELECCIONA TUS ASIENTOS' : 'SELECCIONA TUS BOLETOS'}
                </Text>
              </View>

              <View style={styles.filtersContainer}>
                <View style={styles.filterBox}>
                  <Text style={styles.filterText}>{event.location || 'Ciudad'}</Text>
                </View>
                <View style={styles.filterBox}>
                  <Text style={styles.filterText}>{event.venue || 'Recinto'}</Text>
                </View>
              </View>

              {isEventSeating ? (
                <>
                  <Text style={styles.mapSubtitleLabel}>SELECCIONA EN EL MAPA</Text>

                  <VenueMap
                    rows={roomRows}
                    cols={roomCols}
                    busySeats={busySeats}
                    selectedSeats={selectedSeats}
                    onSeatSelect={handleSeatSelect}
                    basePrice={seatPrice}
                  />

                  {selectedSeats.length > 0 && (
                    <View style={styles.ticketItemRow}>
                      <View style={styles.ticketCheckbox}>
                        <Text style={{color: '#fff', fontSize: 10}}>✓</Text>
                      </View>
                      <View style={{flex: 1}}>
                        <Text style={styles.ticketName}>Asientos seleccionados</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                          <View style={styles.ticketDot} />
                          <Text style={styles.ticketType}>{selectedSeats.length} boletos ( {selectedSeats.map(s => `${String.fromCharCode(64 + s.row)}${s.col}`).join(', ')} )</Text>
                        </View>
                        {!isFreeEvent && (
                          <Text style={styles.ticketPrice}>{formatCurrency(selectedSeats.reduce((acc, s) => acc + s.price, 0))}</Text>
                        )}
                        {isFreeEvent && (
                          <Text style={[styles.ticketPrice, { color: '#22c55e' }]}>GRATIS</Text>
                        )}
                      </View>
                      <View style={styles.ticketRadioActive}>
                        <View style={styles.ticketRadioInner} />
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityLabel}>CANTIDAD</Text>
                  <View style={styles.quantitySelectorRow}>
                    <TouchableOpacity 
                      onPress={() => setQuantity(Math.max(1, quantity - 1))} 
                      style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                      disabled={quantity <= 1}
                    >
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyValueText}>{quantity}</Text>
                    <TouchableOpacity 
                      onPress={() => setQuantity(Math.min(10, quantity + 1))} 
                      style={[styles.qtyBtn, quantity >= 10 && styles.qtyBtnDisabled]}
                      disabled={quantity >= 10}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total estimado:</Text>
                    {isFreeEvent ? (
                      <Text style={[styles.totalAmount, { color: '#22c55e' }]}>GRATIS</Text>
                    ) : (
                      <Text style={styles.totalAmount}>{formatCurrency(quantity * seatPrice)}</Text>
                    )}
                  </View>
                </View>
              )}

              {isFreeEvent ? (
                <TouchableOpacity
                  style={[
                    styles.cartButton, 
                    { backgroundColor: '#16a34a', borderColor: '#16a34a' },
                    isEventSeating && selectedSeats.length === 0 && { opacity: 0.5 }
                  ]}
                  onPress={handleClaimFree}
                  disabled={isClaimingFree || (isEventSeating && selectedSeats.length === 0)}
                >
                  {isClaimingFree ? (
                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                  ) : (
                    <Text style={{color: '#fff', fontSize: 18, marginRight: 8}}>🎫</Text>
                  )}
                  <Text style={[styles.cartButtonText, { color: '#fff' }]}>
                    {isClaimingFree ? 'REGISTRANDO...' : 'OBTENER ENTRADA GRATIS'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.cartButton, (isEventSeating && selectedSeats.length === 0) && styles.cartButtonDisabled]}
                  onPress={handleAddToCart}
                  disabled={isEventSeating && selectedSeats.length === 0}
                >
                  <ShoppingCart size={18} color={(isEventSeating && selectedSeats.length === 0) ? "#888" : "#fff"} style={{ marginRight: 8 }} />
                  <Text style={[styles.cartButtonText, (isEventSeating && selectedSeats.length === 0) && {color: '#888'}]}>
                    {isEventSeating 
                      ? (selectedSeats.length > 0 ? `AGREGAR ${selectedSeats.length} BOLETOS` : 'SELECCIONA ASIENTOS')
                      : `AGREGAR ${quantity} BOLETOS`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Back Button */}
      <TouchableOpacity 
        style={[styles.floatingBack, { top: insets.top + 10 }]}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft size={20} color="#fff" />
        <Text style={styles.floatingBackText}>REGRESAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnError: {
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    height: height * 0.65,
    width: '100%',
    position: 'relative',
    backgroundColor: '#111',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    padding: 24,
  },
  heroTextContainer: {
    paddingBottom: 10,
  },
  heroBadge: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 40,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 6,
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  shareBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  contentSection: {
    padding: 24,
  },
  descriptionLabel: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#ccc',
    lineHeight: 24,
    marginBottom: 32,
  },
  mapSection: {
    backgroundColor: '#161616',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterBox: {
    flex: 1,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  filterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  mapSubtitleLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 8,
  },
  ticketItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginVertical: 16,
    marginHorizontal: -16, // Bleed out of the container padding
  },
  ticketCheckbox: {
    width: 18,
    height: 18,
    backgroundColor: '#ff3366',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ticketName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  ticketDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginRight: 6,
  },
  ticketType: {
    color: '#aaa',
    fontSize: 11,
  },
  ticketPrice: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  ticketRadioActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff3366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  cartButton: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  cartButtonDisabled: {
    borderColor: '#444',
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  floatingBack: {
    position: 'absolute',
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  floatingBackText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 4,
  },
  quantityContainer: {
    marginVertical: 20,
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  quantityLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  quantitySelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnDisabled: {
    opacity: 0.5,
  },
  qtyBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  qtyValueText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginHorizontal: 40,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  totalLabel: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
  },
  totalAmount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  functionPill: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  functionPillActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  functionPillText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  functionPillTextActive: {
    color: '#000',
  },
  functionPillTime: {
    color: '#888',
    fontSize: 11,
  },
});

export default EventDetailScreen;
