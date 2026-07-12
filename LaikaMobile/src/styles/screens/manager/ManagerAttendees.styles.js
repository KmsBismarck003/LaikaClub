import { StyleSheet } from 'react-native';
import theme from '../../theme';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  title: {
    fontSize: 16,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1.5,
    color: theme.colors.black,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.black,
    marginLeft: 6,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    borderRadius: theme.radii.base,
    backgroundColor: theme.colors.white,
    marginTop: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
    width: '100%',
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
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
  },
  email: {
    fontSize: 11,
    color: theme.colors.gray500,
    marginTop: 2,
  },
  ticketCode: {
    fontSize: 11,
    fontWeight: theme.typography.fontSemibold,
    color: theme.colors.gray600,
    marginTop: 4,
  },
  seat: {
    fontSize: 11,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginTop: 2,
  },
});
