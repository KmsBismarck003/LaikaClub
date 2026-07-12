import { StyleSheet } from 'react-native';
import theme from '../../theme';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1.5,
    marginBottom: 20,
    color: theme.colors.black,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.gray700,
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: theme.colors.black,
    borderRadius: theme.radii.base,
    backgroundColor: theme.colors.gray50,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  categorySelect: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    marginTop: 4,
  },
  catOpt: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.white,
  },
  catOptSelected: {
    backgroundColor: theme.colors.black,
    borderColor: theme.colors.black,
  },
  catOptText: {
    fontSize: 12,
    color: theme.colors.gray700,
    fontWeight: theme.typography.fontMedium,
  },
  catOptTextSelected: {
    color: theme.colors.white,
    fontWeight: theme.typography.fontBold,
  },
  formButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  btn: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
});
