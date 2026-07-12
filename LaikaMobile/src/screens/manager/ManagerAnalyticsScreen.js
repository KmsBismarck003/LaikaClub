import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context';
import { managerAPI } from '../../services/managerService';
import { Header } from '../../components';
import { formatCurrency } from '../../utils/managerUtils';
import styles from '../../styles/screens/manager/ManagerAnalytics.styles';
import theme from '../../styles/theme';

export const ManagerAnalyticsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    publishedEvents: 0,
    totalSold: 0,
    totalRevenue: 0,
    averagePrice: 0,
  });
  const [salesByEvent, setSalesByEvent] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch manager events
      const events = await managerAPI.getMyEvents();
      
      const totalEvents = events.length;
      const publishedEvents = events.filter((e) => e.status === 'published').length;
      const totalSold = events.reduce((acc, curr) => acc + (parseInt(curr.tickets_sold || curr.sold_tickets || 0, 10)), 0);
      const totalRevenue = events.reduce((acc, curr) => acc + (parseFloat(curr.revenue || curr.total_revenue || 0)), 0);
      const averagePrice = totalSold > 0 ? totalRevenue / totalSold : 0;

      setMetrics({
        totalEvents,
        publishedEvents,
        totalSold,
        totalRevenue,
        averagePrice,
      });

      // Prepare data for chart: top 5 events with tickets sold
      const chartData = events
        .map((e) => ({
          name: e.name.length > 15 ? e.name.substring(0, 12) + '...' : e.name,
          sold: parseInt(e.tickets_sold || e.sold_tickets || 0, 10),
        }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

      setSalesByEvent(chartData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      if (err?.status === 401) {
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha expirado o no tienes permisos. Por favor inicia sesión de nuevo.',
          [{ text: 'Aceptar', onPress: () => logout() }]
        );
      }
      setError('No se pudieron cargar las analíticas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const maxSoldVal = salesByEvent.length > 0 ? Math.max(...salesByEvent.map((d) => d.sold), 1) : 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="ANALÍTICAS" showBack />
      {loading && salesByEvent.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Cargando analítica financiera...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={{ color: theme.colors.error, fontSize: 13, marginBottom: 12 }}>{error}</Text>
          <TouchableOpacity style={{ backgroundColor: '#000', padding: 10, borderRadius: 8 }} onPress={loadData}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadData} colors={['#000']} />
          }
        >
          <Text style={styles.title}>Resumen Financiero</Text>

          {/* Metrics summary card */}
          <View style={styles.statsSummaryCard}>
            <Text style={styles.summaryTitle}>Indicadores Clave</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Espectáculos</Text>
              <Text style={styles.summaryValue}>{metrics.totalEvents}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Espectáculos Públicos</Text>
              <Text style={styles.summaryValue}>{metrics.publishedEvents}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Accesos Vendidos</Text>
              <Text style={styles.summaryValue}>{metrics.totalSold}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Precio Promedio Boleto</Text>
              <Text style={styles.summaryValue}>{formatCurrency(metrics.averagePrice)}</Text>
            </View>
            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.summaryLabel, { fontWeight: 'bold', color: '#000' }]}>Recaudación Total</Text>
              <Text style={[styles.summaryValue, { fontSize: 14, color: '#000' }]}>{formatCurrency(metrics.totalRevenue)}</Text>
            </View>
          </View>

          {/* Custom bar chart of sales by event */}
          <Text style={styles.sectionTitle}>Distribución de Ventas</Text>
          <View style={styles.chartContainer}>
            <Text style={[styles.summaryTitle, { marginBottom: 16 }]}>Top 5 Eventos (Boletos)</Text>
            
            {salesByEvent.length === 0 ? (
              <View style={styles.chartPlaceholder}>
                <Text style={{ color: '#999', fontSize: 12 }}>Sin ventas registradas</Text>
              </View>
            ) : (
              <View style={styles.chartBarRow}>
                {salesByEvent.map((item, index) => {
                  // Calculate height percentage
                  const barHeight = (item.sold / maxSoldVal) * 100;
                  return (
                    <View key={index} style={styles.chartBarCol}>
                      <Text style={{ fontSize: 9, color: '#333', fontWeight: 'bold', marginBottom: 2 }}>
                        {item.sold}
                      </Text>
                      <View style={[styles.chartBar, { height: Math.max(barHeight, 8) }]} />
                      <Text style={styles.chartLabel} numberOfLines={2}>
                        {item.name}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ManagerAnalyticsScreen;
