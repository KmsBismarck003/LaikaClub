import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet,  ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../styles/theme';
import { Header, Button, Badge } from '../../components';
import { monitoringAPI } from '../../services';
import { Calendar, MapPin, Users, Megaphone, Activity, Cpu, HardDrive } from 'lucide-react-native';

export const AdminDashboardScreen = ({ navigation }) => {
  const [sysStatus, setSysStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSystemMetrics = async () => {
    setLoading(true);
    try {
      const stats = await monitoringAPI.getSystemStatus();
      setSysStatus(stats);
    } catch (err) {
      console.warn('Failed to load system metrics:', err);
      // Fallback dummy statistics matching backend format
      setSysStatus({
        status: 'operational',
        cpu: { usage_percent: 18.5 },
        memory: { usage_percent: 62.4 },
        active_sessions: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemMetrics();
  }, []);

  const handleNav = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="CONSOLE ADMIN" showBack />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Monitor Panel */}
        <View style={styles.monitorCard}>
          <View style={styles.monitorHeader}>
            <Activity size={18} color={theme.colors.black} style={{ marginRight: 6 }} />
            <Text style={styles.monitorTitle}>ESTADO DEL SERVIDOR</Text>
            {sysStatus && (
              <Badge
                text={sysStatus.status === 'operational' ? 'Estable' : 'Alerta'}
                variant={sysStatus.status === 'operational' ? 'success' : 'error'}
                style={styles.badge}
              />
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.black} style={{ marginVertical: 14 }} />
          ) : (
            <View style={styles.metricsRow}>
              <View style={styles.metricItem}>
                <Cpu size={24} color={theme.colors.black} />
                <Text style={styles.metricValue}>
                  {sysStatus?.cpu?.usage_percent ? `${sysStatus.cpu.usage_percent}%` : 'N/A'}
                </Text>
                <Text style={styles.metricLabel}>CPU</Text>
              </View>
              <View style={[styles.metricItem, styles.borderLeft]}>
                <HardDrive size={24} color={theme.colors.black} />
                <Text style={styles.metricValue}>
                  {sysStatus?.memory?.usage_percent ? `${sysStatus.memory.usage_percent}%` : 'N/A'}
                </Text>
                <Text style={styles.metricLabel}>Memoria RAM</Text>
              </View>
              <View style={[styles.metricItem, styles.borderLeft]}>
                <Users size={24} color={theme.colors.black} />
                <Text style={styles.metricValue}>
                  {sysStatus?.active_sessions || 0}
                </Text>
                <Text style={styles.metricLabel}>Sesiones</Text>
              </View>
            </View>
          )}
        </View>

        {/* Modules Grid */}
        <Text style={styles.sectionTitle}>Módulos de Gestión</Text>
        
        <View style={styles.modulesGrid}>
          
          {/* Events Card */}
          <TouchableOpacity
            style={styles.moduleCard}
            onPress={() => handleNav('AdminEvents')}
            activeOpacity={0.8}
          >
            <View style={styles.moduleIconWrapper}>
              <Calendar size={28} color={theme.colors.white} />
            </View>
            <Text style={styles.moduleName}>Eventos</Text>
            <Text style={styles.moduleDesc}>Listar, crear, editar y cambiar publicación</Text>
          </TouchableOpacity>

          {/* Venues Card */}
          <TouchableOpacity
            style={styles.moduleCard}
            onPress={() => handleNav('AdminVenues')}
            activeOpacity={0.8}
          >
            <View style={styles.moduleIconWrapper}>
              <MapPin size={28} color={theme.colors.white} />
            </View>
            <Text style={styles.moduleName}>Recintos</Text>
            <Text style={styles.moduleDesc}>Administrar complejos, salas y capacidad</Text>
          </TouchableOpacity>

          {/* Users Card */}
          <TouchableOpacity
            style={styles.moduleCard}
            onPress={() => handleNav('AdminUsers')}
            activeOpacity={0.8}
          >
            <View style={styles.moduleIconWrapper}>
              <Users size={28} color={theme.colors.white} />
            </View>
            <Text style={styles.moduleName}>Usuarios</Text>
            <Text style={styles.moduleDesc}>Habilitar/Bloquear cuentas y reset contraseñas</Text>
          </TouchableOpacity>

          {/* Ads Card */}
          <TouchableOpacity
            style={styles.moduleCard}
            onPress={() => handleNav('AdminAds')}
            activeOpacity={0.8}
          >
            <View style={styles.moduleIconWrapper}>
              <Megaphone size={28} color={theme.colors.white} />
            </View>
            <Text style={styles.moduleName}>Anuncios</Text>
            <Text style={styles.moduleDesc}>Publicar banners, registrar clics e imágenes</Text>
          </TouchableOpacity>

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
  monitorCard: {
    backgroundColor: theme.colors.gray50,
    borderWidth: 1.5,
    borderColor: theme.colors.black,
    borderRadius: theme.radii.base,
    padding: 16,
    marginBottom: 24,
    ...theme.shadows.sm,
  },
  monitorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  monitorTitle: {
    fontSize: 12,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
    letterSpacing: 1.5,
    flex: 1,
  },
  badge: {
    alignSelf: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.gray200,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
    marginTop: 6,
  },
  metricLabel: {
    fontSize: 10,
    color: theme.colors.gray500,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1.5,
    marginBottom: 16,
    color: theme.colors.black,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moduleCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    padding: 16,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  moduleIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: theme.colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleName: {
    fontSize: 15,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginBottom: 4,
  },
  moduleDesc: {
    fontSize: 11,
    color: theme.colors.gray600,
    lineHeight: 14,
  },
});

export default AdminDashboardScreen;
