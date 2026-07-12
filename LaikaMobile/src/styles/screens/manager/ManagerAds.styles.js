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
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    padding: 14,
    marginBottom: 14,
    ...theme.shadows.sm,
  },
  adImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: theme.colors.gray100,
    marginBottom: 10,
  },
  adTitle: {
    fontSize: 14,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginBottom: 4,
  },
  adUrl: {
    fontSize: 11,
    color: theme.colors.gray500,
    marginBottom: 8,
  },
  adStatsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray50,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray100,
  },
  adStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  adStatLabel: {
    fontSize: 9,
    color: theme.colors.gray500,
    textTransform: 'uppercase',
  },
  adStatValue: {
    fontSize: 13,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginTop: 2,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.gray200,
  },
});
