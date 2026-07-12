import React, { useState } from 'react';
import { View, Text, StyleSheet,  TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context';
import theme from '../../styles/theme';
import { Button, Input } from '../../components';
import { Mail, Lock, ShieldAlert } from 'lucide-react-native';

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login({
      email: email.trim(),
      password: password,
      rememberMe: true
    });

    setLoading(false);

    if (result.success) {
      // Navigate to Home, Admin or Manager Dashboard depending on role
      if (result.user.role === 'admin') {
        navigation.navigate('AdminDashboard');
      } else if (result.user.role === 'gestor') {
        navigation.navigate('ManagerDashboard');
      } else {
        navigation.navigate('Home');
      }
    } else {
      setError(result.error || 'Credenciales inválidas.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>LAIKA CLUB</Text>
          <Text style={styles.subtitle}>Inicia sesión para reservar y administrar tus accesos</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <ShieldAlert size={18} color={theme.colors.error} style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Input
            label="Correo electrónico"
            value={email}
            onChangeText={setEmail}
            placeholder="ejemplo@laikaclub.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={18} color={theme.colors.gray500} />}
          />

          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            icon={<Lock size={18} color={theme.colors.gray500} />}
          />

          <Button
            title="Entrar al Club"
            onPress={handleLogin}
            loading={loading}
            variant="primary"
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Registrarse</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.configLink} 
          onPress={() => navigation.navigate('ServerConfig')}
        >
          <Text style={styles.configText}>Ajustar IP del Servidor</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brand: {
    fontSize: 28,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 4,
    color: theme.colors.black,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.gray500,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.errorLight,
    borderWidth: 1,
    borderColor: theme.colors.error,
    padding: 12,
    borderRadius: theme.radii.base,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    fontWeight: theme.typography.fontMedium,
    flex: 1,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 13,
    color: theme.colors.gray600,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    textDecorationLine: 'underline',
  },
  configLink: {
    marginTop: 32,
    alignItems: 'center',
  },
  configText: {
    fontSize: 11,
    color: theme.colors.gray400,
  },
});

export default LoginScreen;
