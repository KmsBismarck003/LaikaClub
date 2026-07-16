import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../styles/theme';
import { useAuth, useCart } from '../context';
import { ShoppingCart, User, Settings, Shield, LayoutDashboard } from 'lucide-react-native';

export const Header = ({ title = 'LAIKA CLUB', showBack = false, onBackPress }) => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();
  const { cartItems } = useCart();

  const handleProfilePress = () => {
    if (isAuthenticated()) {
      navigation.navigate('Perfil');
    } else {
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress || (() => navigation.goBack())}
          >
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.logo}>{title}</Text>
        )}
      </View>

      <View style={styles.rightContainer}>
        {/* Server Config Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('ServerConfig')}
        >
          <Settings size={20} color={theme.colors.black} />
        </TouchableOpacity>

        {/* Cart Icon */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <ShoppingCart size={20} color={theme.colors.black} />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Profile/Login Icon */}
        <TouchableOpacity
          style={[styles.iconButton, styles.profileButton]}
          onPress={handleProfilePress}
        >
          <User size={20} color={theme.colors.black} />
          {isAuthenticated() && (
            <View style={styles.activeUserDot} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: theme.colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray200,
    ...theme.shadows.sm,
  },
  leftContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 16,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 1.5,
    color: theme.colors.black,
  },
  backButton: {
    paddingVertical: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: theme.typography.fontSemibold,
    color: theme.colors.black,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: theme.radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    position: 'relative',
    backgroundColor: theme.colors.gray50,
  },
  profileButton: {
    borderColor: theme.colors.gray200,
    borderWidth: 1,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.black,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: theme.colors.white,
    fontSize: 9,
    fontWeight: theme.typography.fontBold,
  },
  activeUserDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.black,
    borderWidth: 1.5,
    borderColor: theme.colors.white,
  },
});

export default Header;
