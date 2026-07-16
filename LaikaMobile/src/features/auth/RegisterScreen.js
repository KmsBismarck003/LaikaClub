import React, { useState } from 'react';
import { View, Text, StyleSheet,  TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context';
import theme from '../../styles/theme';
import { Button, Input } from '../../components';
import { Mail, Lock, User, ShieldAlert } from 'lucide-react-native';

export const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await register({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.trim(),
      password: password,
      role: 'usuario', // default user role
    });

    setLoading(false);

    if (result.success) {
      Alert.alert('Registro exitoso', '¡Tu cuenta ha sido creada y has iniciado sesión!', [
        { text: 'Entendido', style: 'default' }
      ]);
    } else {
      setError(result.error || 'Ocurrió un error en el registro.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>LAIKA CLUB</Text>
          <Text style={styles.subtitle}>Crea tu cuenta de miembro para comprar boletos</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <ShieldAlert size={18} color={theme.colors.error} style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                label="Nombre"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Juan"
                icon={<User size={18} color={theme.colors.gray500} />}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                label="Apellido"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Pérez"
                icon={<User size={18} color={theme.colors.gray500} />}
              />
            </View>
          </View>

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
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            icon={<Lock size={18} color={theme.colors.gray500} />}
          />

          <Button
            title="Registrarse"
            onPress={handleRegister}
            loading={loading}
            variant="primary"
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
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
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
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
  row: {
    flexDirection: 'row',
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
  loginLink: {
    fontSize: 13,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
