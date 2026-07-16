import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QrCode, CheckCircle, XCircle } from 'lucide-react-native';
import { ticketAPI } from '../../services';
import theme from '../../styles/theme';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Necesitamos permiso para usar la cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Otorgar Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setLoading(true);
    setResult(null);

    try {
      // Data usually holds the ticketCode or URL
      let ticketCode = data;
      // if it's a URL, parse it (e.g., app://ticket/12345)
      if (data.includes('ticket/')) {
        ticketCode = data.split('ticket/')[1];
      }

      // 1. Verify
      const verifyRes = await ticketAPI.verify(ticketCode);
      if (verifyRes.valid) {
        // 2. Redeem
        const redeemRes = await ticketAPI.redeem(ticketCode);
        setResult({ success: true, message: `Ticket válido. Asistente registrado.\nAsiento: ${redeemRes.ticket?.seat_label || 'General'}` });
      } else {
        setResult({ success: false, message: 'El ticket no es válido o ya fue usado.' });
      }
    } catch (error) {
      console.error(error);
      setResult({ success: false, message: error.message || 'Error al validar el ticket' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <QrCode color={theme.colors.black} size={28} />
        <Text style={styles.headerTitle}>Validación de Acceso</Text>
      </View>

      <View style={styles.cameraContainer}>
        {!scanned ? (
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          >
            <View style={styles.overlay}>
              <View style={styles.scanArea} />
            </View>
          </CameraView>
        ) : (
          <View style={styles.resultContainer}>
            {loading ? (
              <>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.resultText}>Validando ticket...</Text>
              </>
            ) : result ? (
              <>
                {result.success ? (
                  <CheckCircle color={theme.colors.success} size={64} />
                ) : (
                  <XCircle color={theme.colors.error} size={64} />
                )}
                <Text style={[styles.resultText, result.success ? styles.successText : styles.errorText]}>
                  {result.message}
                </Text>
                <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)}>
                  <Text style={styles.scanAgainText}>Escanear siguiente</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Apunta el código QR del asistente en el recuadro</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  button: { backgroundColor: theme.colors.black, padding: 12, borderRadius: 8 },
  buttonText: { color: theme.colors.white, fontWeight: 'bold' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.gray200 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 12, color: theme.colors.black },
  cameraContainer: { flex: 1, backgroundColor: theme.colors.black },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  scanArea: { width: 250, height: 250, borderWidth: 2, borderColor: theme.colors.white, backgroundColor: 'transparent' },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.white, padding: 20 },
  resultText: { fontSize: 18, textAlign: 'center', marginVertical: 20, fontWeight: '500' },
  successText: { color: theme.colors.success },
  errorText: { color: theme.colors.error },
  scanAgainButton: { backgroundColor: theme.colors.black, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 30, marginTop: 20 },
  scanAgainText: { color: theme.colors.white, fontWeight: 'bold', fontSize: 16 },
  footer: { padding: 20, backgroundColor: theme.colors.white, alignItems: 'center' },
  footerText: { color: theme.colors.gray500, fontSize: 14 },
});
