import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Ticket, CheckCircle } from 'lucide-react-native';
import theme from '../../styles/theme';

export default function OperatorDashboardScreen() {
  // In a real scenario, fetch today's stats from operator API
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Panel Operativo</Text>
        <Text style={styles.subtitle}>Resumen del evento en curso</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users color={theme.colors.primary} size={32} />
            <Text style={styles.statValue}>1,250</Text>
            <Text style={styles.statLabel}>Asistentes Esperados</Text>
          </View>
          <View style={styles.statCard}>
            <CheckCircle color={theme.colors.success} size={32} />
            <Text style={styles.statValue}>842</Text>
            <Text style={styles.statLabel}>Tickets Validados</Text>
          </View>
          <View style={styles.statCard}>
            <Ticket color={theme.colors.warning} size={32} />
            <Text style={styles.statValue}>408</Text>
            <Text style={styles.statLabel}>Por Ingresar</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.gray50 },
  header: { padding: 24, backgroundColor: theme.colors.white, borderBottomWidth: 1, borderBottomColor: theme.colors.gray200 },
  title: { fontSize: 24, fontWeight: '900', color: theme.colors.black },
  subtitle: { fontSize: 14, color: theme.colors.gray500, marginTop: 4 },
  content: { padding: 20 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: theme.colors.white, padding: 20, borderRadius: 16, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statValue: { fontSize: 28, fontWeight: '900', color: theme.colors.black, marginVertical: 8 },
  statLabel: { fontSize: 12, color: theme.colors.gray500, textAlign: 'center', fontWeight: '600' }
});
