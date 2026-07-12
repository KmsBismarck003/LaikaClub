import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../styles/theme';
import { Header, Badge, Button } from '../../components';
import { adminUsersAPI } from '../../services';
import { ShieldCheck, UserMinus, UserCheck, RefreshCw } from 'lucide-react-native';

export const AdminUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminUsersAPI.getAll();
      setUsers(data || []);
    } catch (err) {
      console.warn('Error loading admin users:', err);
      // Fallback dummy user catalog matching backend output
      setUsers([
        { id: 1, email: 'admin@laikaclub.com', first_name: 'Admin', last_name: 'Laika', role: 'admin', status: 'active' },
        { id: 2, email: 'cliente@laikaclub.com', first_name: 'Cliente', last_name: 'Demo', role: 'usuario', status: 'active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'blocked' : 'active';
    try {
      await adminUsersAPI.changeStatus(user.id, nextStatus);
      Alert.alert('Estatus Actualizado', `El usuario ahora está ${nextStatus === 'active' ? 'Activo' : 'Bloqueado'}`);
      fetchUsers();
    } catch (err) {
      Alert.alert('Error', 'No se pudo cambiar el estatus del usuario.');
    }
  };

  const handleResetPassword = (userId) => {
    const tempPass = 'LaikaClub2026!';
    Alert.alert(
      'Restaurar Contraseña',
      `¿Deseas restablecer la contraseña de este usuario a la predeterminada? (${tempPass})`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          onPress: async () => {
            try {
              await adminUsersAPI.resetPassword(userId, tempPass);
              Alert.alert('Contraseña Restaurada', `Contraseña cambiada a: ${tempPass}`);
            } catch (err) {
              Alert.alert('Error', 'No se pudo restaurar la contraseña.');
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userRow}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        
        <View style={styles.badgeRow}>
          <Badge text={item.role} variant="secondary" style={{ marginRight: 6 }} />
          <Badge
            text={item.status === 'active' ? 'Activo' : 'Bloqueado'}
            variant={item.status === 'active' ? 'success' : 'error'}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, item.status === 'active' ? styles.btnDanger : styles.btnSuccess]}
          onPress={() => handleToggleStatus(item)}
        >
          {item.status === 'active' ? (
            <UserMinus size={16} color={theme.colors.error} />
          ) : (
            <UserCheck size={16} color="green" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleResetPassword(item.id)}
        >
          <RefreshCw size={16} color={theme.colors.black} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="GESTOR USUARIOS" showBack />
      
      <View style={styles.container}>
        <Text style={styles.listTitle}>Usuarios del Sistema ({users.length})</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderUserItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontBlack,
    marginBottom: 16,
    color: theme.colors.black,
  },
  listContent: {
    paddingBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.radii.base,
    padding: 16,
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: theme.colors.gray500,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  btnDanger: {
    borderColor: theme.colors.errorLight,
  },
  btnSuccess: {
    borderColor: 'rgba(0, 255, 0, 0.2)',
  },
});

export default AdminUsersScreen;
