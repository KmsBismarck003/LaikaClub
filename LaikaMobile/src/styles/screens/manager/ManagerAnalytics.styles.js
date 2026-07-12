import { StyleSheet } from 'react-native';
import theme from '../../theme';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 16,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1.5,
    marginBottom: 20,
    color: theme.colors.black,
    textTransform: 'uppercase',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.gray500,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1,
    marginBottom: 12,
    color: theme.colors.black,
    textTransform: 'uppercase',
    marginTop: 10,
  },
  statsSummaryCard: {
    backgroundColor: theme.colors.gray50,
    borderWidth: 1.5,
    borderColor: theme.colors.black,
    borderRadius: theme.radii.base,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.sm,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.gray600,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
  },
  chartContainer: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    padding: 16,
    marginBottom: 20,
    ...theme.shadows.sm,
    alignItems: 'center',
  },
  chartPlaceholder: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  chartBarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 120,
    width: '100%',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  chartBarCol: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 24,
    backgroundColor: theme.colors.black,
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 9,
    color: theme.colors.gray500,
    marginTop: 6,
    textAlign: 'center',
  },
});
