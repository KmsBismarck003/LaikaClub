import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import theme from '../styles/theme';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  size = 'medium',    // 'small' | 'medium' | 'large'
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getButtonStyle = () => {
    const stylesList = [styles.btn];
    
    // Variant
    if (variant === 'primary') stylesList.push(styles.btnPrimary);
    else if (variant === 'secondary') stylesList.push(styles.btnSecondary);
    else if (variant === 'outline') stylesList.push(styles.btnOutline);
    else if (variant === 'danger') stylesList.push(styles.btnDanger);
    
    // Size
    if (size === 'small') stylesList.push(styles.btnSmall);
    else if (size === 'large') stylesList.push(styles.btnLarge);
    
    // Disabled/Loading
    if (disabled || loading) stylesList.push(styles.btnDisabled);
    
    if (style) stylesList.push(style);
    
    return stylesList;
  };

  const getTextStyle = () => {
    const stylesList = [styles.text];
    
    if (variant === 'primary') stylesList.push(styles.textPrimary);
    else if (variant === 'secondary') stylesList.push(styles.textSecondary);
    else if (variant === 'outline') stylesList.push(styles.textOutline);
    else if (variant === 'danger') stylesList.push(styles.textDanger);
    
    if (size === 'small') stylesList.push(styles.textSmall);
    else if (size === 'large') stylesList.push(styles.textLarge);
    
    if (textStyle) stylesList.push(textStyle);
    
    return stylesList;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={getButtonStyle()}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#fff' : '#000'}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    borderRadius: theme.radii.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 48,
  },
  btnPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  btnSecondary: {
    backgroundColor: theme.colors.gray100,
    borderColor: theme.colors.gray100,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
  },
  btnDanger: {
    backgroundColor: theme.colors.error,
    borderColor: theme.colors.error,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  btnLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  text: {
    fontFamily: 'System',
    fontWeight: theme.typography.fontSemibold,
    textAlign: 'center',
  },
  textPrimary: {
    color: theme.colors.white,
  },
  textSecondary: {
    color: theme.colors.primary,
  },
  textOutline: {
    color: theme.colors.primary,
  },
  textDanger: {
    color: theme.colors.white,
  },
  textSmall: {
    fontSize: 12,
  },
  textLarge: {
    fontSize: 16,
  },
});

export default Button;
