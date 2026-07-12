import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import theme from '../styles/theme';
import { Square } from 'lucide-react-native';

export const VenueMap = ({
  rows = 8,
  cols = 10,
  busySeats = [], // E.g., ['1-2', '3-4']
  selectedSeats = [], // E.g., [{row: 1, col: 2, price: 150}]
  onSeatSelect,
  basePrice = 350,
}) => {
  const handleSeatPress = (r, c) => {
    const seatKey = `${r}-${c}`;
    const isBusy = busySeats.includes(seatKey);
    if (isBusy) return;

    onSeatSelect(r, c, basePrice);
  };

  const isSeatSelected = (r, c) => {
    return selectedSeats.some((s) => s.row === r && s.col === c);
  };

  const isSeatBusy = (r, c) => {
    const seatKey = `${r}-${c}`;
    return busySeats.includes(seatKey);
  };

  const getSeatStyle = (r, c) => {
    const list = [styles.seat];
    if (isSeatBusy(r, c)) {
      list.push(styles.seatBusy);
    } else if (isSeatSelected(r, c)) {
      list.push(styles.seatSelected);
    } else {
      list.push(styles.seatAvailable);
    }
    return list;
  };

  const getSeatTextColor = (r, c) => {
    if (isSeatSelected(r, c)) return theme.colors.white;
    if (isSeatBusy(r, c)) return theme.colors.gray400;
    return theme.colors.black;
  };

  const renderGrid = () => {
    const grid = [];
    for (let r = 1; r <= rows; r++) {
      const rowSeats = [];
      // Row Label
      rowSeats.push(
        <View key={`row-label-${r}`} style={styles.rowLabelContainer}>
          <Text style={styles.rowLabelText}>{String.fromCharCode(64 + r)}</Text>
        </View>
      );
      
      for (let c = 1; c <= cols; c++) {
        rowSeats.push(
          <TouchableOpacity
            key={`seat-${r}-${c}`}
            style={getSeatStyle(r, c)}
            onPress={() => handleSeatPress(r, c)}
            activeOpacity={0.7}
          >
            <Text style={[styles.seatText, { color: getSeatTextColor(r, c) }]}>
              {c}
            </Text>
          </TouchableOpacity>
        );
      }
      grid.push(
        <View key={`row-${r}`} style={styles.gridRow}>
          {rowSeats}
        </View>
      );
    }
    return grid;
  };

  return (
    <View style={styles.container}>
      <View style={styles.stageContainer}>
        <View style={styles.stageLine} />
        <Text style={styles.stageText}>ESCENARIO / PANTALLA</Text>
      </View>

      <ScrollView horizontal contentContainerStyle={styles.horizontalScroll}>
        <View style={styles.gridContainer}>{renderGrid()}</View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.seatAvailable]} />
          <Text style={styles.legendText}>Disponible</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.seatSelected]} />
          <Text style={styles.legendText}>Seleccionado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.seatBusy]} />
          <Text style={styles.legendText}>Ocupado</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    alignItems: 'center',
    width: '100%',
    backgroundColor: theme.colors.white,
    padding: 16,
    borderRadius: theme.radii.base,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
  },
  stageContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 24,
  },
  stageLine: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.black,
    borderRadius: 2,
  },
  stageText: {
    fontSize: 10,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.gray500,
    marginTop: 6,
    letterSpacing: 2,
  },
  horizontalScroll: {
    paddingVertical: 10,
  },
  gridContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowLabelContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 6,
  },
  rowLabelText: {
    fontSize: 12,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.gray500,
  },
  seat: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  seatAvailable: {
    backgroundColor: theme.colors.white,
    borderColor: theme.colors.black,
  },
  seatSelected: {
    backgroundColor: theme.colors.black,
    borderColor: theme.colors.black,
  },
  seatBusy: {
    backgroundColor: theme.colors.gray200,
    borderColor: theme.colors.gray300,
  },
  seatText: {
    fontSize: 9,
    fontWeight: theme.typography.fontBold,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray100,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: theme.colors.gray600,
  },
});

export default VenueMap;
