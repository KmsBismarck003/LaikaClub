import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput, ActivityIndicator, Share, TouchableOpacity } from 'react-native';
import theme from '../styles/theme';
import Button from './Button';
import Input from './Input';
import { KeyRound, ShieldAlert, CheckCircle2, Share2, X } from 'lucide-react-native';
import { TRANSFER_PHASE } from '../hooks/useTicketTransfer';

export const TransferModal = ({
  visible,
  phase,
  ticket,
  password,
  setPassword,
  secondsLeft,
  errorMsg,
  loading,
  claimUrl,
  onConfirm,
  onCancel,
}) => {
  const handleShare = async () => {
    if (!claimUrl) return;
    try {
      await Share.share({
        message: `¡Hola! Te he transferido un boleto para "${ticket?.event_name || ticket?.eventName || 'Evento LAIKA'}". Reclámalo aquí: ${claimUrl}`,
        title: 'Transferencia de Boleto Laika Club',
      });
    } catch (error) {
      console.warn('Error sharing transfer link:', error);
    }
  };

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>TRANSFERENCIA SEGURA</Text>
            {phase !== TRANSFER_PHASE.GENERATING && (
              <TouchableOpacity onPress={onCancel} style={styles.closeBtn}>
                <X size={20} color={theme.colors.black} />
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <View style={styles.modalContent}>
            {phase === TRANSFER_PHASE.CONFIRMING && (
              <View>
                <Text style={styles.infoText}>
                  Estás a punto de transferir el acceso de:
                </Text>
                <View style={styles.ticketDetails}>
                  <Text style={styles.eventName}>
                    {ticket?.event_name || ticket?.eventName || 'Evento'}
                  </Text>
                  <Text style={styles.seatLabel}>
                    Asiento: {ticket?.seat_id || 'General'}
                  </Text>
                </View>

                <Text style={styles.warningText}>
                  Por seguridad, introduce tu contraseña para confirmar que eres el propietario de este boleto.
                </Text>

                <Input
                  label="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Introduce tu contraseña"
                  secureTextEntry
                  icon={<KeyRound size={18} color={theme.colors.gray500} />}
                  error={errorMsg}
                />

                <View style={styles.btnRow}>
                  <Button
                    title="Cancelar"
                    onPress={onCancel}
                    variant="outline"
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    title="Generar Enlace"
                    onPress={onConfirm}
                    loading={loading}
                    variant="primary"
                    style={{ flex: 1, marginLeft: 8 }}
                  />
                </View>
              </View>
            )}

            {phase === TRANSFER_PHASE.GENERATING && (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.colors.black} style={{ marginBottom: 16 }} />
                <Text style={styles.loadingText}>Cifrando boleto y generando token seguro...</Text>
              </View>
            )}

            {phase === TRANSFER_PHASE.DONE && (
              <View style={styles.centerContainer}>
                <CheckCircle2 size={54} color="green" style={{ marginBottom: 16 }} />
                <Text style={styles.successTitle}>¡ENLACE GENERADO!</Text>
                <Text style={styles.successSubtitle}>
                  Comparte este enlace con el receptor. Una vez reclamado, tu boleto quedará invalidado de tu cuenta.
                </Text>

                {/* Countdown */}
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownLabel}>EXPIRA EN:</Text>
                  <Text style={styles.countdownValue}>{formatCountdown(secondsLeft)}</Text>
                </View>

                {/* Share Action */}
                <TouchableOpacity style={styles.shareBox} onPress={handleShare}>
                  <Text style={styles.urlText} numberOfLines={1}>
                    {claimUrl}
                  </Text>
                  <View style={styles.shareBtnInline}>
                    <Share2 size={16} color={theme.colors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.shareBtnText}>COMPARTIR</Text>
                  </View>
                </TouchableOpacity>

                <Button
                  title="Cerrar Bóveda"
                  onPress={onCancel}
                  variant="outline"
                  style={{ width: '100%', marginTop: 8 }}
                />
              </View>
            )}

            {phase === TRANSFER_PHASE.ERROR && (
              <View style={styles.centerContainer}>
                <ShieldAlert size={54} color={theme.colors.error} style={{ marginBottom: 16 }} />
                <Text style={styles.errorTitle}>ERROR DE SEGURIDAD</Text>
                <Text style={styles.errorSubtitle}>
                  {errorMsg || 'No se pudo generar el enlace de transferencia. Verifica tu contraseña.'}
                </Text>

                <Button
                  title="Reintentar"
                  onPress={() => onConfirm()}
                  variant="primary"
                  style={{ width: '100%', marginBottom: 10 }}
                />
                <Button
                  title="Volver"
                  onPress={onCancel}
                  variant="outline"
                  style={{ width: '100%' }}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.base,
    borderWidth: 1.5,
    borderColor: theme.colors.black,
    ...theme.shadows.md,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
    backgroundColor: theme.colors.gray50,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 2,
    color: theme.colors.black,
  },
  closeBtn: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.gray500,
    marginBottom: 6,
  },
  ticketDetails: {
    backgroundColor: theme.colors.gray50,
    padding: 12,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    marginBottom: 16,
  },
  eventName: {
    fontSize: 16,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginBottom: 2,
  },
  seatLabel: {
    fontSize: 12,
    color: theme.colors.gray600,
    fontWeight: theme.typography.fontSemibold,
  },
  warningText: {
    fontSize: 12,
    color: theme.colors.gray600,
    lineHeight: 18,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  centerContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.gray600,
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
    letterSpacing: 1,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    color: theme.colors.gray600,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 99,
    marginBottom: 20,
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.gray500,
    marginRight: 6,
  },
  countdownValue: {
    fontSize: 14,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
  },
  shareBox: {
    width: '100%',
    backgroundColor: theme.colors.black,
    borderRadius: theme.radii.sm,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  urlText: {
    color: theme.colors.gray400,
    fontSize: 11,
    marginBottom: 8,
    fontFamily: 'System',
  },
  shareBtnInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  shareBtnText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: theme.typography.fontBold,
    letterSpacing: 1,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.error,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 13,
    color: theme.colors.gray600,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
});

export default TransferModal;
