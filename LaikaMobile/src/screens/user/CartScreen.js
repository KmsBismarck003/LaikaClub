import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart, useAuth } from '../../context';
import { ticketAPI, paymentAPI } from '../../services';
import theme from '../../styles/theme';
import { Header, Button, Input } from '../../components';
import { formatCurrency, formatDate, formatTime } from '../../utils/format';
import { Trash2, CreditCard, User, Calendar, ShieldCheck } from 'lucide-react-native';

export const CartScreen = ({ navigation }) => {
  const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [processing, setProcessing] = useState(false);
  const [cardHolder, setCardHolder] = useState(user ? `${user.firstName} ${user.lastName}` : '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleDeleteItem = (eventId, row, col) => {
    const seatKey = `${row}-${col}`;
    removeFromCart(eventId, seatKey);
  };

  const handleCheckout = async () => {
    if (!isAuthenticated()) {
      Alert.alert('Acceso Requerido', 'Inicia sesión o regístrate para finalizar tu compra.', [
        { text: 'Iniciar Sesión', onPress: () => navigation.navigate('Login') },
        { text: 'Cancelar', style: 'cancel' }
      ]);
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Carrito Vacío', 'No hay boletos en el carrito.');
      return;
    }

    // Card validation
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (!cardHolder.trim() || cleanCard.length < 15 || !expiry.includes('/') || cvv.length < 3) {
      Alert.alert('Datos de Pago', 'Por favor ingresa datos válidos de tu tarjeta.');
      return;
    }

    setProcessing(true);

    try {
      const amount = getCartTotal();
      const firstEventId = cartItems[0].event_id;

      // 1. Create Payment Intent
      const intentResp = await paymentAPI.createIntent({
        amount,
        method: 'card',
        event_id: firstEventId,
        eventId: firstEventId,
      });

      const paymentId = intentResp.payment_id || intentResp.reference || `pay_${Date.now()}`;

      // 2. Confirm Payment Intent
      await paymentAPI.confirm(paymentId);

      // 3. Purchase tickets
      const purchaseItems = cartItems.map((item) => ({
        eventId: item.event_id,
        quantity: 1,
        functionId: null,
        sectionId: '1',
        sectionName: 'General',
        price: item.price,
        seatId: `${String.fromCharCode(64 + item.row)}${item.column}`, // e.g. A3
      }));

      await ticketAPI.purchase({
        items: purchaseItems,
        paymentMethod: 'card',
        paymentId: paymentId,
        shippingInfo: null,
        shippingMethod: 'digital',
      });

      Alert.alert(
        '¡Compra Exitosa!',
        'Tus boletos han sido reservados. Búscalos en tu cartera digital.',
        [
          {
            text: 'Ver Mis Boletos',
            onPress: () => {
              clearCart();
              navigation.navigate('UserProfile');
            },
          },
        ]
      );
    } catch (err) {
      console.error('Checkout error:', err);
      Alert.alert('Error en Pago', err.message || 'No se pudo completar la compra. Revisa tu conexión.');
    } finally {
      setProcessing(false);
    }
  };

  const renderCartItem = ({ item }) => {
    const seatLabel = `${String.fromCharCode(64 + item.row)}${item.column}`;
    return (
      <View style={styles.cartItem}>
        <View style={styles.itemInfo}>
          <Text style={styles.eventName}>{item.event_name}</Text>
          <Text style={styles.itemLocation}>{item.venue || item.location}</Text>
          
          <View style={styles.detailRow}>
            <Calendar size={12} color={theme.colors.gray500} style={{ marginRight: 4 }} />
            <Text style={styles.detailText}>{formatDate(item.date)} a las {formatTime(item.time)}</Text>
          </View>
          
          <View style={styles.seatContainer}>
            <Text style={styles.seatBadge}>Asiento: {seatLabel}</Text>
            <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteItem(item.event_id, item.row, item.column)}
        >
          <Trash2 size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack />
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyTitle}>Tu Carrito está vacío</Text>
          <Text style={styles.emptySubtitle}>Agrega boletos de los eventos disponibles para finalizar la compra.</Text>
          <Button title="Explorar Eventos" onPress={() => navigation.navigate('Home')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Resumen del Pedido</Text>
        
        {/* Cart items list */}
        <View style={styles.itemsWrapper}>
          {cartItems.map((item, idx) => (
            <View key={`${item.event_id}-${item.row}-${item.column}-${idx}`}>
              {renderCartItem({ item })}
            </View>
          ))}
        </View>

        {/* Pricing Panel */}
        <View style={styles.pricePanel}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceVal}>{formatCurrency(getCartTotal())}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Cargos por Servicio</Text>
            <Text style={styles.priceVal}>{formatCurrency(0)}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total a Pagar</Text>
            <Text style={styles.totalVal}>{formatCurrency(getCartTotal())}</Text>
          </View>
        </View>

        {/* Payment Details Form */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>MÉTODO DE PAGO (Tarjeta de Crédito)</Text>
          
          <Input
            label="Titular de la tarjeta"
            value={cardHolder}
            onChangeText={setCardHolder}
            placeholder="Juan Pérez"
            icon={<User size={18} color={theme.colors.gray500} />}
          />

          <Input
            label="Número de tarjeta"
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="4000 1234 5678 9010"
            keyboardType="number-pad"
            icon={<CreditCard size={18} color={theme.colors.gray500} />}
          />

          <View style={styles.cardRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Vencimiento"
                value={expiry}
                onChangeText={setExpiry}
                placeholder="MM/AA"
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="CVV"
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                keyboardType="number-pad"
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.secureBadge}>
            <ShieldCheck size={16} color="green" style={{ marginRight: 6 }} />
            <Text style={styles.secureText}>Pago seguro encriptado simulado por LaikaClub</Text>
          </View>

          <Button
            title={`Pagar ${formatCurrency(getCartTotal())}`}
            onPress={handleCheckout}
            loading={processing}
            variant="primary"
            style={styles.checkoutBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.gray600,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1.5,
    marginBottom: 12,
    color: theme.colors.black,
  },
  itemsWrapper: {
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    marginBottom: 10,
  },
  itemInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 15,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginBottom: 2,
  },
  itemLocation: {
    fontSize: 11,
    color: theme.colors.gray600,
    marginBottom: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 11,
    color: theme.colors.gray500,
  },
  seatContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  seatBadge: {
    fontSize: 11,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    backgroundColor: theme.colors.gray200,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
  },
  deleteButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pricePanel: {
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.radii.base,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    padding: 16,
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: theme.colors.gray600,
  },
  priceVal: {
    fontSize: 13,
    fontWeight: theme.typography.fontMedium,
    color: theme.colors.black,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
  },
  totalVal: {
    fontSize: 16,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
  },
  paymentSection: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    padding: 16,
    ...theme.shadows.sm,
  },
  paymentTitle: {
    fontSize: 11,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  secureText: {
    fontSize: 10,
    color: theme.colors.gray500,
  },
  checkoutBtn: {
    marginTop: 8,
  },
});

export default CartScreen;
