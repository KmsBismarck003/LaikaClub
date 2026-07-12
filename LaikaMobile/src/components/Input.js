import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../styles/theme';
import { Eye, EyeOff } from 'lucide-react-native';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  icon,
  style,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getContainerStyle = () => {
    const list = [styles.inputContainer];
    if (isFocused) list.push(styles.inputFocused);
    if (error) list.push(styles.inputError);
    return list;
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={getContainerStyle()}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <TextInput
          style={[styles.input, inputStyle]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.gray400}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            {showPassword ? (
              <EyeOff size={20} color={theme.colors.gray500} />
            ) : (
              <Eye size={20} color={theme.colors.gray500} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: theme.typography.fontMedium,
    color: theme.colors.gray700,
    marginBottom: 6,
    paddingLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    backgroundColor: theme.colors.gray50,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  inputFocused: {
    borderColor: theme.colors.black,
    backgroundColor: theme.colors.white,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  iconWrapper: {
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: theme.colors.black,
    fontSize: 14,
    paddingVertical: 10,
  },
  eyeButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 11,
    marginTop: 4,
    paddingLeft: 2,
  },
});

export default Input;
