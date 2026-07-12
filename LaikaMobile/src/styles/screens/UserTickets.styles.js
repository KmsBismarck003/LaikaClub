import { StyleSheet } from 'react-native';
import theme from '../theme';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  guestCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 13,
    color: theme.colors.gray600,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Tab Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleLabel: {
    fontSize: 11,
    fontWeight: theme.typography.fontBlack,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: theme.colors.gray500,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray100,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 99,
    padding: 2,
  },
  tabBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 99,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  tabText: {
    fontSize: 9,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1,
    color: theme.colors.gray500,
  },
  tabTextActive: {
    color: theme.colors.black,
  },

  // Ticket Card
  ticketCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderColor: theme.colors.black,
    borderRadius: theme.radii.base,
    marginBottom: 16,
    overflow: 'hidden',
    ...theme.shadows.base,
  },
  ticketCardPast: {
    opacity: 0.6,
    borderColor: theme.colors.gray300,
  },
  ticketRow: {
    flexDirection: 'row',
    height: 120,
  },
  
  // Left Panel
  leftPanel: {
    width: 110,
    position: 'relative',
    backgroundColor: theme.colors.gray900,
  },
  leftImage: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    opacity: 0.65,
  },
  leftOverlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.white,
  },

  // Center Info
  centerInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  ticketEvent: {
    fontSize: 14,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginBottom: 2,
  },
  ticketVenue: {
    fontSize: 10,
    color: theme.colors.gray600,
    marginBottom: 2,
  },
  ticketDate: {
    fontSize: 10,
    color: theme.colors.gray500,
  },
  badgeRow: {
    flexDirection: 'row',
  },

  // Perforation line
  perforation: {
    width: 1,
    borderLeftWidth: 1.5,
    borderLeftColor: theme.colors.gray200,
    borderStyle: 'dashed',
    marginVertical: 8,
  },

  // Right QR Area
  rightQr: {
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  miniQrContainer: {
    width: 54,
    height: 54,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: 6,
    backgroundColor: theme.colors.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  miniQrImage: {
    width: 48,
    height: 48,
  },
  miniQrPlaceholder: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.black,
    position: 'relative',
  },
  qrSquare: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.black,
  },
  qrSquareRight: {
    left: undefined,
    right: 2,
  },
  qrSquareBottom: {
    top: undefined,
    bottom: 2,
  },
  qrCodeText: {
    fontSize: 8,
    fontFamily: 'System',
    color: theme.colors.gray500,
    fontWeight: theme.typography.fontSemibold,
    textAlign: 'center',
  },

  // Ticket actions
  actionContainer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray100,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  transferBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    borderRadius: 8,
    paddingVertical: 6,
  },
  transferBtnText: {
    fontSize: 10,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    letterSpacing: 1,
    marginLeft: 6,
  },

  // Past events section header
  pastSectionLabel: {
    fontSize: 10,
    fontWeight: theme.typography.fontBlack,
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: theme.colors.gray400,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
    paddingBottom: 6,
    marginTop: 14,
    marginBottom: 12,
  },
  pastGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  smallCard: {
    width: '48%',
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.sm,
    flexDirection: 'row',
    padding: 8,
    height: 64,
    alignItems: 'center',
    opacity: 0.6,
  },
  smallThumb: {
    width: 48,
    height: 48,
    borderRadius: 6,
    marginRight: 8,
  },
  smallInfo: {
    flex: 1,
  },
  smallTitle: {
    fontSize: 11,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
  },
  smallDate: {
    fontSize: 8,
    color: theme.colors.gray500,
  },

  // Empty State
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
    marginBottom: 16,
  },
  emptyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.black,
    borderRadius: 99,
  },
  emptyBtnText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1.5,
  },

  // Detail Modal style
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.base,
    borderWidth: 1.5,
    borderColor: theme.colors.black,
    ...theme.shadows.lg,
    overflow: 'hidden',
  },
  decoLine: {
    height: 6,
    backgroundColor: theme.colors.black,
  },
  modalHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalHeaderLeft: {
    flex: 1,
  },
  modalSub: {
    fontSize: 9,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.gray500,
    letterSpacing: 2,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  qrBigWrapper: {
    width: 200,
    height: 200,
    padding: 10,
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.base,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...theme.shadows.base,
  },
  qrBigImage: {
    width: 180,
    height: 180,
  },
  qrCodeLabel: {
    fontSize: 11,
    fontFamily: 'System',
    fontWeight: theme.typography.fontBold,
    color: theme.colors.gray600,
    letterSpacing: 2,
    backgroundColor: theme.colors.gray50,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  detailsGrid: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    paddingTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 12,
    marginBottom: 20,
  },
  gridCol2: {
    width: '50%',
  },
  gridColFull: {
    width: '100%',
  },
  gridLabel: {
    fontSize: 8,
    fontWeight: theme.typography.fontBold,
    textTransform: 'uppercase',
    color: theme.colors.gray500,
    letterSpacing: 1,
    marginBottom: 2,
  },
  gridVal: {
    fontSize: 12,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
  },
  modalActions: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  closeModalBtn: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray100,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
  },
  closeModalText: {
    fontSize: 10,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 2,
    color: theme.colors.gray600,
  },
});
