import { StyleSheet } from 'react-native';
import theme from '../../theme';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
  },
  title: {
    fontSize: 16,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radii.sm,
  },
  createBtnText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: theme.typography.fontBold,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.gray50,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray150 || '#f0f0f0',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radii.round,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    backgroundColor: theme.colors.white,
  },
  tabActive: {
    backgroundColor: theme.colors.black,
    borderColor: theme.colors.black,
  },
  tabText: {
    fontSize: 11,
    fontWeight: theme.typography.fontMedium,
    color: theme.colors.gray600,
  },
  tabTextActive: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontBold,
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
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: theme.colors.black,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.radii.sm,
  },
  retryBtnText: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontBold,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.gray500,
    textAlign: 'center',
    marginTop: 20,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventName: {
    fontSize: 15,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    flex: 1,
    marginRight: 8,
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: theme.colors.gray600,
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray50,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray100,
    marginBottom: 12,
  },
  statCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 9,
    color: theme.colors.gray500,
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 12,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray100,
    paddingTop: 10,
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.gray700,
    marginLeft: 4,
  },
  actionBtnDanger: {
    borderColor: theme.colors.error,
  },
  actionBtnDangerText: {
    color: theme.colors.error,
  },
});
