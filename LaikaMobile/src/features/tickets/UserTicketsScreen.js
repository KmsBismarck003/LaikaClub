import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Image, TouchableOpacity, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context';
import { ticketAPI, refundAPI, getApiBaseUrl } from '../../services';
import { Header, Badge, Button, TransferModal, BiometricShield } from '../../components';
import { Calendar, MapPin, ShieldCheck, RefreshCw, X, ShieldAlert, Share2, Printer } from 'lucide-react-native';
import { useTicketTransfer, TRANSFER_PHASE } from '../../hooks';
import styles from '../../styles/screens/UserTickets.styles';
import theme from '../../styles/theme';
import { formatDate, formatTime } from '../../utils/format';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=80',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&q=80',
];

const getQrUrl = (code) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(code)}&qzone=1&color=000000&bgcolor=ffffff`;
};

export const UserTicketsScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'

  const loadTickets = useCallback(async (background = false) => {
    if (!isAuthenticated()) return;
    
    // Load from cache first for offline support
    try {
      const cached = await AsyncStorage.getItem('@cached_tickets');
      if (cached) {
        setTickets(JSON.parse(cached));
      }
    } catch (e) {
      console.warn('Error reading cached tickets', e);
    }

    if (!background) setLoading(true);
    
    try {
      const resp = await ticketAPI.getMyTickets();
      const fetchedTickets = Array.isArray(resp) ? resp : [];
      setTickets(fetchedTickets);
      await AsyncStorage.setItem('@cached_tickets', JSON.stringify(fetchedTickets));
    } catch (err) {
      console.warn('Error loading user tickets (showing offline cache):', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTickets(true);
  };

  const handleRefund = async (ticket) => {
    Alert.alert(
      '¿SOLICITAR REEMBOLSO?',
      'Esta acción es irreversible y liberará tu asiento de inmediato.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'SOLICITAR REEMBOLSO',
          style: 'destructive',
          onPress: async () => {
            try {
              await refundAPI.requestRefund(ticket.id, 'Cancelado por usuario en dispositivo móvil');
              Alert.alert('Éxito', 'Reembolso procesado correctamente.');
              setSelectedTicket(null);
              loadTickets();
            } catch (err) {
              Alert.alert('Error', err.message || 'No se pudo procesar el reembolso.');
            }
          }
        }
      ]
    );
  };

  // Transfer hook integrations
  const transfer = useTicketTransfer({
    onSuccess: (msg) => {
      // Do nothing, UI handles it in TransferModal
    },
    onError: (err) => {
      // Handled in TransferModal
    }
  });

  if (!isAuthenticated()) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack />
        <View style={styles.guestCenter}>
          <ShieldAlert size={64} color={theme.colors.gray400} style={{ marginBottom: 16 }} />
          <Text style={styles.guestTitle}>Acceso Restringido</Text>
          <Text style={styles.guestSubtitle}>
            Inicia sesión para poder acceder a tus boletos digitales y códigos QR.
          </Text>
          <Button title="Iniciar Sesión" onPress={() => navigation.navigate('Login')} />
        </View>
      </SafeAreaView>
    );
  }

  const getCleanBaseUrl = () => {
    return getApiBaseUrl().replace(/\/api$/, '');
  };

  const isUpcoming = (t) => {
    const d = t.event_date || t.date;
    return !d || new Date(d) >= new Date();
  };

  const upcomingTickets = tickets.filter(isUpcoming);
  const pastTickets = tickets.filter(t => !isUpcoming(t));

  const renderTicketCard = (ticket, idx, isPast = false) => {
    const code = ticket.ticket_code || `TKT-${ticket.id}`;
    const image = ticket.image_url || ticket.event_image_url || ticket.event?.image_url;
    const imageUri = image
      ? (image.startsWith('http') ? image : `${getCleanBaseUrl()}${image}`)
      : FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
    
    const status = ticket.status || (isPast ? 'used' : 'active');
    const STATUS_MAP = {
      active: { label: 'Activo', variant: 'primary' },
      confirmed: { label: 'Confirmado', variant: 'info' },
      used: { label: 'Canjeado', variant: 'secondary' },
      cancelled: { label: 'Cancelado', variant: 'error' },
      refunded: { label: 'Reembolsado', variant: 'warning' },
    };
    const st = STATUS_MAP[status] || { label: status.toUpperCase(), variant: 'secondary' };

    return (
      <View key={ticket.id || idx} style={[styles.ticketCard, isPast && styles.ticketCardPast]}>
        <TouchableOpacity style={styles.ticketRow} onPress={() => setSelectedTicket(ticket)}>
          {/* Left Panel */}
          <View style={styles.leftPanel}>
            <Image source={{ uri: imageUri }} style={styles.leftImage} resizeMode="cover" />
            <View style={styles.leftOverlay}>
              <Image source={{ uri: imageUri }} style={styles.thumbImage} resizeMode="cover" />
            </View>
          </View>

          {/* Center Info */}
          <View style={styles.centerInfo}>
            <View>
              <Text style={styles.ticketEvent} numberOfLines={1}>
                {ticket.event_name || 'Espectáculo'}
              </Text>
              <Text style={styles.ticketVenue} numberOfLines={1}>
                {ticket.venue_name || 'Laika Arena'}
              </Text>
              <Text style={styles.ticketDate}>
                {formatDate(ticket.event_date || ticket.date)}
              </Text>
            </View>
            <View style={styles.badgeRow}>
              <Badge text={st.label} variant={st.variant} />
            </View>
          </View>

          {/* Perforation dashed line */}
          <View style={styles.perforation} />

          {/* Right QR Area */}
          <View style={styles.rightQr}>
            <View style={styles.miniQrContainer}>
              <Image source={{ uri: getQrUrl(code) }} style={styles.miniQrImage} resizeMode="contain" />
            </View>
            <Text style={styles.qrCodeText} numberOfLines={1}>{code}</Text>
          </View>
        </TouchableOpacity>

        {/* Transfer Button - only if active and upcoming */}
        {!isPast && (status === 'active' || status === 'confirmed') && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.transferBtn}
              onPress={() => transfer.openTransfer(ticket)}
            >
              <Share2 size={12} color={theme.colors.black} />
              <Text style={styles.transferBtnText}>TRANSFERIR BOLETO</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack />
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.black} />
          <Text style={styles.loadingText}>Accediendo a tu bóveda digital...</Text>
        </View>
      ) : (
        <BiometricShield>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.black]} />
            }
          >
          {/* Header & Tabs */}
          <View style={styles.headerRow}>
            <Text style={styles.titleLabel}>ACCESOS DIGITALES</Text>
            
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'upcoming' && styles.tabBtnActive]}
                onPress={() => setActiveTab('upcoming')}
              >
                <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>PRÓXIMOS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'past' && styles.tabBtnActive]}
                onPress={() => setActiveTab('past')}
              >
                <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>PASADOS</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tickets Display */}
          {activeTab === 'upcoming' ? (
            upcomingTickets.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No tienes boletos para próximos eventos.</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Eventos')}>
                  <Text style={styles.emptyBtnText}>ADQUIRIR ACCESOS</Text>
                </TouchableOpacity>
              </View>
            ) : (
              upcomingTickets.map((t, idx) => renderTicketCard(t, idx, false))
            )
          ) : (
            pastTickets.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No tienes boletos de eventos pasados.</Text>
              </View>
            ) : (
              pastTickets.map((t, idx) => renderTicketCard(t, idx, true))
            )
          )}

          {/* ── EVENTOS PASADOS horizontal list shown on upcoming tab if exist ─ */}
          {activeTab === 'upcoming' && pastTickets.length > 0 && (
            <View>
              <Text style={styles.pastSectionLabel}>Eventos Anteriores</Text>
              <View style={styles.pastGrid}>
                {pastTickets.slice(0, 4).map((ticket, idx) => {
                  const image = ticket.image_url || ticket.event_image_url || ticket.event?.image_url;
                  const imageUri = image
                    ? (image.startsWith('http') ? image : `${getCleanBaseUrl()}${image}`)
                    : FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
                  
                  return (
                    <TouchableOpacity
                      key={ticket.id || idx}
                      style={styles.smallCard}
                      onPress={() => setSelectedTicket(ticket)}
                    >
                      <Image source={{ uri: imageUri }} style={styles.smallThumb} resizeMode="cover" />
                      <View style={styles.smallInfo}>
                        <Text style={styles.smallTitle} numberOfLines={1}>
                          {ticket.event_name || 'Evento'}
                        </Text>
                        <Text style={styles.smallDate}>
                          {formatDate(ticket.event_date || ticket.date)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
        </BiometricShield>
      )}

      {/* ── TICKET DETAIL MODAL ──────────────────────────────────── */}
      {selectedTicket && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedTicket}
          onRequestClose={() => setSelectedTicket(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.decoLine} />
              
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Text style={styles.modalSub}>BOLETO DIGITAL OFICIAL</Text>
                  <Text style={styles.modalTitle} numberOfLines={2}>
                    {selectedTicket.event_name || 'Espectáculo'}
                  </Text>
                </View>
                <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedTicket(null)}>
                  <X size={18} color={theme.colors.black} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                {/* QR Code Big */}
                <View style={styles.qrBigWrapper}>
                  <Image
                    source={{ uri: getQrUrl(selectedTicket.ticket_code || `TKT-${selectedTicket.id}`) }}
                    style={styles.qrBigImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.qrCodeLabel}>
                  {selectedTicket.ticket_code || `TKT-${selectedTicket.id}`}
                </Text>

                {/* Info Grid */}
                <View style={styles.detailsGrid}>
                  <View style={styles.gridColFull}>
                    <Text style={styles.gridLabel}>Recinto</Text>
                    <Text style={styles.gridVal}>{selectedTicket.venue_name || 'Laika Arena'}</Text>
                  </View>
                  <View style={styles.gridCol2}>
                    <Text style={styles.gridLabel}>Fecha</Text>
                    <Text style={styles.gridVal}>{formatDate(selectedTicket.event_date || selectedTicket.date)}</Text>
                  </View>
                  <View style={styles.gridCol2}>
                    <Text style={styles.gridLabel}>Horario</Text>
                    <Text style={styles.gridVal}>{formatTime(selectedTicket.event_time || selectedTicket.time)} hrs</Text>
                  </View>
                  <View style={styles.gridCol2}>
                    <Text style={styles.gridLabel}>Zona</Text>
                    <Text style={[styles.gridVal, { color: '#ca8a04' }]}>{selectedTicket.section_name || 'GENERAL'}</Text>
                  </View>
                  <View style={styles.gridCol2}>
                    <Text style={styles.gridLabel}>Asiento</Text>
                    <Text style={[styles.gridVal, { color: '#0891b2' }]}>{selectedTicket.seat_id || 'N/A'}</Text>
                  </View>
                </View>

                {/* Modal Buttons */}
                <View style={styles.modalActions}>
                  {/* Refund option for active tickets only */}
                  {(selectedTicket.status === 'active' || selectedTicket.status === 'confirmed') && isUpcoming(selectedTicket) && (
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        borderWidth: 1.5,
                        borderColor: theme.colors.error,
                        borderRadius: theme.radii.sm,
                        paddingVertical: 12,
                        alignItems: 'center',
                      }}
                      onPress={() => handleRefund(selectedTicket)}
                    >
                      <Text style={{ color: theme.colors.error, fontSize: 10, fontWeight: theme.typography.fontBlack, letterSpacing: 1.5 }}>REEMBOLSO</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: theme.colors.black,
                      borderRadius: theme.radii.sm,
                      paddingVertical: 12,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setSelectedTicket(null);
                      transfer.openTransfer(selectedTicket);
                    }}
                    disabled={selectedTicket.status === 'refunded' || selectedTicket.status === 'used'}
                  >
                    <Text style={{ color: theme.colors.white, fontSize: 10, fontWeight: theme.typography.fontBlack, letterSpacing: 1.5 }}>TRANSFERIR</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSelectedTicket(null)}>
                <Text style={styles.closeModalText}>CERRAR VISTA</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* ── TRANSFER MODAL ───────────────────────────────────────── */}
      <TransferModal
        visible={transfer.phase !== TRANSFER_PHASE.IDLE}
        phase={transfer.phase}
        ticket={transfer.ticket}
        password={transfer.password}
        setPassword={transfer.setPassword}
        secondsLeft={transfer.secondsLeft}
        errorMsg={transfer.errorMsg}
        loading={transfer.loading}
        claimUrl={transfer.claimUrl}
        onConfirm={transfer.confirmAndGenerate}
        onCancel={transfer.cancelTransfer}
      />
    </SafeAreaView>
  );
};

export default UserTicketsScreen;
