import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../styles/theme';
import { Calendar, Ticket, DollarSign, CheckCircle } from 'lucide-react-native';
import { formatCurrency } from '../../utils/managerUtils';

export const ManagerStatsCards = ({ stats }) => {
  const items = [
    {
      id: 'events',
      label: 'Total Eventos',
      value: stats.totalEvents,
      icon: Calendar,
    },
    {
      id: 'sold',
      label: 'Boletos Vendidos',
      value: stats.totalSold,
      icon: Ticket,
    },
    {
      id: 'revenue',
      label: 'Recaudación',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      isDark: true,
    },
    {
      id: 'published',
      label: 'Publicados',
      value: stats.publishedEvents,
      icon: CheckCircle,
    },
  ];

  return (
    <View style={styles.grid}>
      {items.map((item) => {
        const IconComponent = item.icon;
        return (
          <View
            key={item.id}
            style={[
              styles.card,
              item.isDark && styles.cardDark,
            ]}
          >
            <View style={styles.header}>
              <Text
                style={[
                  styles.label,
                  item.isDark && styles.textWhiteSub,
                ]}
              >
                {item.label}
              </Text>
              <IconComponent
                size={18}
                color={item.isDark ? theme.colors.white : theme.colors.black}
              />
            </View>
            <Text
              style={[
                styles.value,
                item.isDark && styles.textWhite,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {item.value}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderColor: theme.colors.black,
    borderRadius: theme.radii.base,
    padding: 14,
    marginBottom: 14,
    ...theme.shadows.sm,
  },
  cardDark: {
    backgroundColor: theme.colors.black,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
  },
  textWhite: {
    color: theme.colors.white,
  },
  textWhiteSub: {
    color: theme.colors.gray400,
  },
});

export default ManagerStatsCards;
