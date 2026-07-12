import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context';
import theme from '../../styles/theme';
import { Header, Button, Badge } from '../../components';
import { 
  LogOut, Ticket, Award, CreditCard, LayoutDashboard, 
  ChevronRight, UserCheck, ShieldAlert 
} from 'lucide-react-native';

export const UserProfileScreen = ({ navigation }) => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.navigate('Home');
        },
      },
    ]);
  };

  if (!isAuthenticated()) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header showBack />
        <View style={styles.guestCenter}>
          <Ticket size={64} color={theme.colors.gray400} style={{ marginBottom: 16 }} />
          <Text style={styles.guestTitle}>Área Personal</Text>
          <Text style={styles.guestSubtitle}>
            Inicia sesión para poder acceder a tu cuenta, tus accesos digitales y tus recompensas.
          </Text>
          <Button title="Iniciar Sesión" onPress={() => navigation.navigate('Login')} />
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Mi Panel de Control',
      subtitle: 'Resumen de próximos eventos y actividad',
      icon: LayoutDashboard,
      color: '#3b82f6',
      screen: 'UserDashboard',
    },
    {
      id: 'tickets',
      title: 'Mis Boletos / Accesos',
      subtitle: 'Bóveda digital de códigos QR y transferencias',
      icon: Ticket,
      color: '#22c55e',
      screen: 'UserTickets',
    },
    {
      id: 'history',
      title: 'Historial de Compras',
      subtitle: 'Timeline de compras, gastos y visitas',
      icon: CreditCard,
      color: '#ec4899',
      screen: 'UserHistory',
    },
    {
      id: 'achievements',
      title: 'Logros y Recompensas',
      subtitle: 'Estatus del club, XP y cupones',
      icon: Award,
      color: '#eab308',
      screen: 'Achievements',
    },
  ];

  if (user.role === 'gestor' || user.role === 'admin') {
    menuItems.push({
      id: 'manager_console',
      title: 'Consola de Gestor',
      subtitle: 'Administración de eventos, boletos y ventas',
      icon: LayoutDashboard,
      color: '#a855f7',
      screen: 'ManagerDashboard',
    });
  }

  if (user.role === 'admin') {
    menuItems.push({
      id: 'admin_console',
      title: 'Consola de Administrador',
      subtitle: 'Métricas de servidor y control del sistema',
      icon: UserCheck,
      color: '#000000',
      screen: 'AdminDashboard',
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          
          <View style={styles.roleContainer}>
            <Badge text={`ROL: ${user.role.toUpperCase()}`} variant="secondary" />
          </View>
          
          <View style={styles.pointsBadge}>
            <Award size={16} color={theme.colors.black} style={{ marginRight: 6 }} />
            <Text style={styles.pointsText}>{user.laikaPoints || 0} Puntos Laika</Text>
          </View>
        </View>

        {/* Navigation Options Menu */}
        <Text style={styles.sectionLabel}>MENÚ LAIKA CLUB</Text>
        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => navigation.navigate(item.screen)}
              >
                <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                  <IconComponent size={20} color={item.color} />
                </View>
                
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                </View>
                
                <ChevronRight size={18} color={theme.colors.gray400} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Option */}
        <View style={styles.logoutWrapper}>
          <Button
            title="Cerrar Sesión"
            onPress={handleLogout}
            variant="outline"
            icon={<LogOut size={16} color={theme.colors.black} style={{ marginRight: 8 }} />}
          />
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
  profileCard: {
    backgroundColor: theme.colors.gray50,
    borderWidth: 1.5,
    borderColor: theme.colors.black,
    borderRadius: theme.radii.base,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    ...theme.shadows.base,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  avatarInitials: {
    color: theme.colors.white,
    fontSize: 26,
    fontWeight: theme.typography.fontBlack,
  },
  profileName: {
    fontSize: 20,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 13,
    color: theme.colors.gray500,
    marginBottom: 12,
  },
  roleContainer: {
    marginBottom: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radii.sm,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: theme.typography.fontBlack,
    color: theme.colors.gray500,
    letterSpacing: 2,
    marginBottom: 10,
    paddingLeft: 4,
  },
  menuContainer: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray150 || '#f0f0f0',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 11,
    color: theme.colors.gray500,
  },
  logoutWrapper: {
    marginTop: 10,
  },
});

export default UserProfileScreen;
