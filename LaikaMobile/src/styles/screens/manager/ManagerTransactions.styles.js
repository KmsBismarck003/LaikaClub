import { StyleSheet } from 'react-native';
import theme from '../../theme';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  title: {
    fontSize: 16,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1.5,
    padding: 16,
    color: theme.colors.black,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.gray500,
    marginTop: 10,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    padding: 14,
    marginBottom: 12,
    ...theme.shadows.sm,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  txId: {
    fontSize: 11,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.gray500,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
  },
  eventName: {
    fontSize: 13,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  userEmail: {
    fontSize: 11,
    color: theme.colors.gray600,
  },
  txDate: {
    fontSize: 11,
    color: theme.colors.gray400,
  },
});
