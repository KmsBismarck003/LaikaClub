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

  // Lock Banner
  lockBanner: {
    backgroundColor: theme.colors.gray50,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.gray400,
    borderRadius: theme.radii.base,
    padding: 24,
    alignItems: 'center',
  },
  lockTitle: {
    fontSize: 15,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 2,
    color: theme.colors.black,
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  lockSub: {
    fontSize: 12,
    color: theme.colors.gray500,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },

  // Compact Hero Card
  heroCard: {
    backgroundColor: theme.colors.black,
    borderRadius: theme.radii.base,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    ...theme.shadows.base,
  },
  heroLeft: {
    flex: 1,
  },
  heroBrand: {
    fontSize: 16,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.white,
    letterSpacing: 2,
  },
  heroStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  heroStatusLabel: {
    fontSize: 10,
    color: theme.colors.gray400,
  },
  heroStatusVal: {
    fontSize: 10,
    fontWeight: theme.typography.fontBold,
  },
  heroRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroTextRight: {
    alignItems: 'flex-end',
  },
  heroXp: {
    fontSize: 13,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.white,
  },
  heroNextXp: {
    fontSize: 8,
    color: theme.colors.gray400,
  },
  heroIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },

  // Phase Section
  phaseSection: {
    marginBottom: 20,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
    paddingBottom: 6,
    marginBottom: 12,
  },
  phaseTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phaseNum: {
    fontSize: 14,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.gray300,
  },
  phaseTitle: {
    fontSize: 13,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
    letterSpacing: 1,
  },
  phaseProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phaseProgressText: {
    fontSize: 10,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
  },
  phaseProgressBarBg: {
    width: 60,
    height: 5,
    backgroundColor: theme.colors.gray100,
    borderRadius: 99,
    overflow: 'hidden',
  },
  phaseProgressBarFg: {
    height: '100%',
    backgroundColor: theme.colors.black,
    borderRadius: 99,
  },

  // Achievement cards grid
  achCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderRadius: theme.radii.base,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
    ...theme.shadows.sm,
  },
  achIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 12,
  },
  achCardLeft: {
    alignItems: 'center',
    minWidth: 60,
    marginRight: 12,
  },
  achLevelText: {
    fontSize: 8,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1,
    marginTop: 4,
  },
  achCardMiddle: {
    flex: 1,
  },
  achTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achTitle: {
    fontSize: 13,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
  },
  achPercent: {
    fontSize: 10,
    fontWeight: theme.typography.fontBlack,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.colors.gray50,
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFg: {
    height: '100%',
    borderRadius: 99,
  },
  achDesc: {
    fontSize: 10,
    color: theme.colors.gray500,
    lineHeight: 14,
  },
  achCardRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  unlockedText: {
    fontSize: 8,
    fontWeight: theme.typography.fontBlack,
    marginLeft: 4,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: 0.25,
  },
  lockedText: {
    fontSize: 8,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginLeft: 4,
  },

  // Benefits Section
  benefitsSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
    letterSpacing: 1,
    marginBottom: 12,
  },
  couponGrid: {
    gap: 12,
  },
  couponCard: {
    borderWidth: 2,
    borderRadius: theme.radii.base,
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  couponMain: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  couponHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  couponHeaderLabel: {
    fontSize: 8,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1,
  },
  couponTitle: {
    fontSize: 13,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
  },
  couponDesc: {
    fontSize: 10,
    color: theme.colors.gray500,
    marginTop: 2,
  },
  couponFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  couponFooterLeft: {
    fontSize: 9,
    fontWeight: theme.typography.fontBold,
  },
  couponFooterRight: {
    fontSize: 8,
    fontWeight: theme.typography.fontBlack,
    backgroundColor: theme.colors.black,
    color: theme.colors.white,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },

  // Promo Code Card
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  codeVal: {
    fontSize: 18,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.black,
    letterSpacing: 2,
  },
  copyBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: theme.colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // No benefits state
  noBenefitsCard: {
    backgroundColor: theme.colors.gray50,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.gray300,
    borderRadius: theme.radii.base,
    padding: 24,
    alignItems: 'center',
  },
  noBenefitsTitle: {
    fontSize: 12,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginTop: 8,
    marginBottom: 2,
  },
  noBenefitsSub: {
    fontSize: 10,
    color: theme.colors.gray500,
    textAlign: 'center',
  },
});
