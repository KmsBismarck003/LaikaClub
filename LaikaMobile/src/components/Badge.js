import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../styles/theme';

export const Badge = ({
  text,
  variant = 'primary', // 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  style,
  textStyle,
}) => {
  const getBadgeStyle = () => {
    const list = [styles.badge];
    if (variant === 'primary') list.push(styles.primary);
    else if (variant === 'secondary') list.push(styles.secondary);
    else if (variant === 'success') list.push(styles.success);
    else if (variant === 'error') list.push(styles.error);
    else if (variant === 'warning') list.push(styles.warning);
    else if (variant === 'info') list.push(styles.info);
    
    if (style) list.push(style);
    return list;
  };

  const getTextStyle = () => {
    const list = [styles.text];
    if (variant === 'primary') list.push(styles.textPrimary);
    else if (variant === 'secondary') list.push(styles.textSecondary);
    else if (variant === 'success') list.push(styles.textSuccess);
    else if (variant === 'error') list.push(styles.textError);
    else if (variant === 'warning') list.push(styles.textWarning);
    else if (variant === 'info') list.push(styles.textInfo);
    
    if (textStyle) list.push(textStyle);
    return list;
  };

  return (
    <View style={getBadgeStyle()}>
      <Text style={getTextStyle()}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.gray100,
    borderColor: theme.colors.gray200,
  },
  success: {
    backgroundColor: theme.colors.gray800, // Success in Laika is premium dark
  },
  error: {
    backgroundColor: theme.colors.errorLight,
    borderColor: theme.colors.error,
  },
  warning: {
    backgroundColor: theme.colors.gray200,
    borderColor: theme.colors.gray300,
  },
  info: {
    backgroundColor: theme.colors.gray100,
    borderColor: theme.colors.gray200,
  },
  text: {
    fontSize: 10,
    fontWeight: theme.typography.fontSemibold,
    textTransform: 'uppercase',
  },
  textPrimary: {
    color: theme.colors.white,
  },
  textSecondary: {
    color: theme.colors.primary,
  },
  textSuccess: {
    color: theme.colors.white,
  },
  textError: {
    color: theme.colors.error,
  },
  textWarning: {
    color: theme.colors.primary,
  },
  textInfo: {
    color: theme.colors.primary,
  },
});

export default Badge;
