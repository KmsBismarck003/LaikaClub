import { useColorScheme } from 'react-native';

const baseTheme = {
  radii: {
    sm: 8,
    base: 13,
    lg: 13,
    xl: 13,
    round: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.1,
      shadowRadius: 25,
      elevation: 10,
    },
  },
  typography: {
    fontLight: '300',
    fontNormal: '400',
    fontMedium: '500',
    fontSemibold: '600',
    fontBold: '700',
    fontExtrabold: '800',
    fontBlack: '900',
  }
};

const lightColors = {
  primary: '#000000',
  primaryDark: '#000000',
  primaryLight: '#333333',
  secondary: '#ffffff',
  secondaryDark: '#f5f5f5',
  secondaryLight: '#ffffff',
  accent: '#000000',
  accentAlt: '#666666',
  gray50: '#fafafa',
  gray100: '#f5f5f5',
  gray200: '#e5e5e5',
  gray300: '#d4d4d4',
  gray400: '#a3a3a3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',
  white: '#ffffff',
  black: '#000000',
  pureBlack: '#000000',
  success: '#000000',
  successLight: 'rgba(0, 0, 0, 0.05)',
  error: '#ef4444',
  errorLight: 'rgba(239, 68, 68, 0.1)',
  warning: '#ca8a04',
  warningLight: 'rgba(202, 138, 4, 0.1)',
  info: '#0ea5e9',
  infoLight: 'rgba(14, 165, 233, 0.1)',
  border: '#e5e5e5',
  borderSubtle: '#f5f5f5',
  borderEmphasis: '#d4d4d4',
};

const darkColors = {
  primary: '#ffffff',
  primaryDark: '#f5f5f5',
  primaryLight: '#e5e5e5',
  secondary: '#171717',
  secondaryDark: '#000000',
  secondaryLight: '#262626',
  accent: '#ffffff',
  accentAlt: '#a3a3a3',
  gray50: '#171717',
  gray100: '#262626',
  gray200: '#404040',
  gray300: '#525252',
  gray400: '#737373',
  gray500: '#a3a3a3',
  gray600: '#d4d4d4',
  gray700: '#e5e5e5',
  gray800: '#f5f5f5',
  gray900: '#fafafa',
  white: '#000000', // Inverted for dynamic background
  black: '#ffffff', // Inverted for dynamic text
  pureBlack: '#000000', // Real black never changes
  success: '#10b981',
  successLight: 'rgba(16, 185, 129, 0.1)',
  error: '#f87171',
  errorLight: 'rgba(248, 113, 113, 0.1)',
  warning: '#facc15',
  warningLight: 'rgba(250, 204, 21, 0.1)',
  info: '#38bdf8',
  infoLight: 'rgba(56, 189, 248, 0.1)',
  border: '#404040',
  borderSubtle: '#262626',
  borderEmphasis: '#525252',
};

export const lightTheme = {
  ...baseTheme,
  colors: lightColors,
  isDark: false,
};

export const darkTheme = {
  ...baseTheme,
  colors: darkColors,
  isDark: true,
};

// Default export is fallback for non-hook usage (not recommended for dynamic switching)
export const theme = lightTheme;

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};

export default theme;

