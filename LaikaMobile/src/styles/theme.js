// Theme definitions for LaikaClub Mobile (Black & White Aesthetic)
export const theme = {
  colors: {
    primary: '#000000',
    primaryDark: '#000000',
    primaryLight: '#333333',
    
    secondary: '#ffffff',
    secondaryDark: '#f5f5f5',
    secondaryLight: '#ffffff',
    
    accent: '#000000',
    accentAlt: '#666666',
    
    // Grays
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
    
    // Semantic
    success: '#000000', // Web success is dark/black
    successLight: 'rgba(0, 0, 0, 0.05)',
    error: '#ef4444',
    errorLight: 'rgba(239, 68, 68, 0.1)',
    warning: '#000000',
    warningLight: 'rgba(0, 0, 0, 0.05)',
    info: '#000000',
    infoLight: 'rgba(0, 0, 0, 0.05)',
    
    border: '#e5e5e5',
    borderSubtle: '#f5f5f5',
    borderEmphasis: '#d4d4d4',
  },
  
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

export default theme;
