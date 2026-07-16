import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Lock, Unlock } from 'lucide-react-native';
import theme from '../styles/theme';

const BiometricShield = ({ children, title = 'Bóveda Segura', description = 'Verifica tu identidad para acceder' }) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    checkDeviceSupport();
  }, []);

  const checkDeviceSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (compatible && enrolled) {
        setIsSupported(true);
        authenticate(); // Trigger immediately on mount if supported
      } else {
        // Fallback: If device doesn't have biometrics, just unlock it or ask for a simple PIN logic if needed.
        // For now, we will unlock it immediately if not supported, or you can force error.
        setIsUnlocked(true);
      }
    } catch (error) {
      console.warn("Biometric support error:", error);
      setIsUnlocked(true); // Failsafe
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async () => {
    try {
      setErrorMsg('');
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: title,
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar Código',
        disableDeviceFallback: false, // Let them use PIN if fingerprint fails
      });

      if (result.success) {
        setIsUnlocked(true);
      } else {
        setErrorMsg('Autenticación fallida o cancelada.');
      }
    } catch (error) {
      setErrorMsg('Ocurrió un error al intentar autenticar.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.black} />
      </View>
    );
  }

  if (isUnlocked) {
    return children;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Lock size={48} color={theme.colors.black} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        
        {errorMsg ? (
          <Text style={styles.errorText}>{errorMsg}</Text>
        ) : null}

        <TouchableOpacity style={styles.button} onPress={authenticate}>
          <Unlock size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Desbloquear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginBottom: 24,
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default BiometricShield;
