import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SearchX } from 'lucide-react-native';

const EmptyState = ({ onClear }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <SearchX color="#666" size={48} />
      </View>
      <Text style={styles.title}>No se encontraron eventos</Text>
      <Text style={styles.subtitle}>Intenta ajustar tus filtros o buscar algo diferente.</Text>
      <TouchableOpacity style={styles.button} onPress={onClear}>
        <Text style={styles.buttonText}>Limpiar filtros</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#a3a3a3',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default EmptyState;
