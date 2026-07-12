import { StyleSheet } from 'react-native';
import theme from '../theme';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: theme.colors.gray600,
  },

  // Stat Row
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  titleLabel: {
    fontSize: 11,
    fontWeight: theme.typography.fontBlack,
    textTransform: 'uppercase',
    letterSpacing: 4,
    color: theme.colors.gray500,
  },
  statRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statVal: {
    fontSize: 12,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
    lineHeight: 12,
  },
  statLabel: {
    fontSize: 7,
    fontWeight: theme.typography.fontBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: theme.colors.gray500,
    marginTop: 1,
  },

  // Filters Scroll
  filtersScroll: {
    marginBottom: 16,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    backgroundColor: theme.colors.gray50,
    marginRight: 6,
  },
  filterBtnActive: {
    backgroundColor: theme.colors.black,
    borderColor: theme.colors.black,
  },
  filterText: {
    fontSize: 9,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1,
    color: theme.colors.gray600,
  },
  filterTextActive: {
    color: theme.colors.white,
  },

  // Timeline Structure
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  monthColumn: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingTop: 8,
  },
  monthWord: {
    fontSize: 10,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.gray600,
    textTransform: 'uppercase',
    letterSpacing: 1,
    lineHeight: 12,
  },
  yearWord: {
    fontSize: 8,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.gray400,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Timeline Core
  timelineCore: {
    flex: 1,
    position: 'relative',
    paddingLeft: 20,
  },
  verticalLine: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 0,
    width: 1.5,
    backgroundColor: theme.colors.gray200,
    // Note: react-native doesn't support borderStyle: 'dashed' on simple lines,
    // but a light gray solid line looks fantastic and clean!
  },

  // Timeline Item
  timelineItem: {
    position: 'relative',
    marginBottom: 12,
  },
  timelineDot: {
    position: 'absolute',
    left: -25, // centers dot over line
    top: 24,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: theme.colors.black,
    borderWidth: 2,
    borderColor: theme.colors.white,
    zIndex: 2,
  },

  // Item Card
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    padding: 12,
    ...theme.shadows.sm,
  },
  eventThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 13,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaText: {
    fontSize: 9,
    color: theme.colors.gray500,
  },

  // Price & Status
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
    marginBottom: 4,
  },

  // Empty state
  emptyCard: {
    backgroundColor: theme.colors.gray50,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.gray300,
    borderRadius: theme.radii.base,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: theme.colors.gray500,
    marginBottom: 12,
  },

  // Load more button
  loadMoreBtn: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.sm,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  loadMoreText: {
    fontSize: 10,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1.5,
    color: theme.colors.gray600,
  },
});
