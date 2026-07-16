import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,  TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadApiBaseUrl, saveApiBaseUrl, resetApiBaseUrl } from '../../services/apiClient';
import theme from '../../styles/theme';
import { Button, Input } from '../../components';

export const ServerConfigScreen = ({ navigation }) => {
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null); // 'connected' | 'error'

  useEffect(() => {
    const fetchUrl = async () => {
      const currentUrl = await loadApiBaseUrl();
      setUrl(currentUrl);
    };
    fetchUrl();
  }, []);

  const handleTestConnection = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Por favor ingresa una URL válida.');
      return;
    }

    setTesting(true);
    setStatus(null);

    try {
      // Simple public endpoint check
      const response = await fetch(`${url.trim()}/events/public?limit=1`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setStatus('connected');
        Alert.alert('Conectado', '¡Conexión establecida con éxito con el backend!');
      } else {
        setStatus('error');
        Alert.alert('Error', `Servidor respondió con código: ${response.status}`);
      }
    } catch (err) {
      setStatus('error');
      Alert.alert('Fallo de conexión', 'No se pudo conectar al servidor. Revisa la IP, el puerto (8000) o que la red local sea la misma.');
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'La URL no puede estar vacía.');
      return;
    }

    const saved = await saveApiBaseUrl(url.trim());
    if (saved) {
      Alert.alert('Guardado', 'URL del Servidor actualizada.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Error', 'No se pudo guardar la configuración.');
    }
  };

  const handleReset = async () => {
    const defaultUrl = await resetApiBaseUrl();
    if (defaultUrl) {
      setUrl(defaultUrl);
      Alert.alert('Restablecido', `Se restableció la URL autodetectada:\n${defaultUrl}`);
    } else {
      Alert.alert('Error', 'No se pudo restablecer la URL.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>CONFIGURACIÓN DE RED</Text>
        <Text style={styles.description}>
          La aplicación detecta automáticamente la IP del servidor de desarrollo de tu computadora. Si deseas cambiarla de forma manual, ingrésala a continuación:
        </Text>

        <Input
          label="URL del API Gateway"
          value={url}
          onChangeText={setUrl}
          placeholder="http://192.168.X.X:8000/api"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Estado actual: </Text>
          {testing ? (
            <ActivityIndicator size="small" color={theme.colors.black} />
          ) : status === 'connected' ? (
            <Text style={styles.connected}>CONECTADO</Text>
          ) : status === 'error' ? (
            <Text style={styles.disconnected}>DESCONECTADO</Text>
          ) : (
            <Text style={styles.unknown}>SIN PROBAR</Text>
          )}
        </View>

        <View style={styles.actions}>
          <Button
            title="Probar Conexión"
            onPress={handleTestConnection}
            variant="outline"
            loading={testing}
            style={styles.button}
          />

          <Button
            title="Guardar Cambios"
            onPress={handleSave}
            variant="primary"
            style={styles.button}
          />

          <TouchableOpacity style={styles.resetLink} onPress={handleReset}>
            <Text style={styles.resetText}>Restaurar Conexión Automática / Autodetectar IP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 2,
    marginBottom: 12,
    color: theme.colors.black,
    textAlign: 'center',
  },
  description: {
    fontSize: 13,
    color: theme.colors.gray600,
    lineHeight: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingVertical: 10,
    backgroundColor: theme.colors.gray50,
    borderRadius: theme.radii.sm,
  },
  statusLabel: {
    fontSize: 13,
    color: theme.colors.gray700,
  },
  connected: {
    fontSize: 13,
    fontWeight: theme.typography.fontBold,
    color: 'green',
  },
  disconnected: {
    fontSize: 13,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.error,
  },
  unknown: {
    fontSize: 13,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.gray500,
  },
  actions: {
    marginTop: 10,
  },
  button: {
    marginBottom: 12,
  },
  resetLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  resetText: {
    fontSize: 11,
    color: theme.colors.gray500,
    textDecorationLine: 'underline',
  },
});

export default ServerConfigScreen;
