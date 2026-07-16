import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

const ErrorState = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.errorCode}>ERROR</Text>
      <AlertTriangle color="#ef4444" size={72} style={styles.icon} />
      <Text style={styles.title}>Ups, algo salió mal</Text>
      <Text style={styles.message}>{message || 'Error desconocido'}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={onRetry}>
          <Text style={styles.primaryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  errorCode: {
    color: '#333',
    fontSize: 80,
    fontWeight: '900',
    position: 'absolute',
    top: 0,
    letterSpacing: -5,
    zIndex: -1,
    opacity: 0.5,
  },
  icon: {
    marginBottom: 24,
    marginTop: 40,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: '#a3a3a3',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  actions: {
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ErrorState;
