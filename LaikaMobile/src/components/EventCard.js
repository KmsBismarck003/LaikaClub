import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../styles/theme';
import Badge from './Badge';
import { formatDate, formatTime, formatCurrency } from '../utils/format';
import { Calendar, MapPin, Clock } from 'lucide-react-native';

const CATEGORIES_MAP = {
  concert: 'Concierto',
  sport: 'Deporte',
  theater: 'Teatro',
  festival: 'Festival',
  family: 'Familiar',
  other: 'Otro',
};

const BADGE_VARIANTS = {
  concert: 'primary',
  sport: 'success',
  theater: 'error',
  festival: 'warning',
  other: 'secondary',
};

export const EventCard = ({ event, onPress, customBaseUrl = '' }) => {
  const {
    name,
    category,
    venue,
    location,
    date,
    time,
    price_base,
    image_url,
    price,
    event_date,
    event_time,
  } = event;

  const displayDate = date || event_date;
  const displayTime = time || event_time;
  const displayPrice = price_base !== undefined && price_base !== null ? price_base : price;

  // Resolve image URI
  let imageSource = null;
  if (image_url) {
    if (image_url.startsWith('http')) {
      imageSource = { uri: image_url };
    } else {
      // Relative path from backend
      const cleanUrl = image_url.startsWith('/') ? image_url : `/${image_url}`;
      imageSource = { uri: `${customBaseUrl}${cleanUrl}` };
    }
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.imageContainer}>
        {imageSource ? (
          <Image source={imageSource} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>LAIKA CLUB</Text>
            <Text style={styles.placeholderSub}>Espectáculo Premium</Text>
          </View>
        )}
        <View style={styles.badgeContainer}>
          <Badge
            text={CATEGORIES_MAP[category] || category || 'Otro'}
            variant={BADGE_VARIANTS[category] || 'primary'}
          />
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{name}</Text>
        
        <View style={styles.detailRow}>
          <Calendar size={13} color={theme.colors.gray500} style={styles.icon} />
          <Text style={styles.detailText}>{formatDate(displayDate)}</Text>
          <Clock size={13} color={theme.colors.gray500} style={[styles.icon, styles.iconSpacing]} />
          <Text style={styles.detailText}>{formatTime(displayTime)}</Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin size={13} color={theme.colors.gray500} style={styles.icon} />
          <Text style={styles.detailText} numberOfLines={1}>
            {venue ? `${venue}, ` : ''}{location}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.priceLabel}>Boleto desde</Text>
          <Text style={styles.price}>{formatCurrency(displayPrice || 0)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.base,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    marginBottom: 16,
    ...theme.shadows.sm,
  },
  imageContainer: {
    height: 160,
    backgroundColor: theme.colors.gray100,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: theme.colors.white,
    fontSize: 18,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 2,
  },
  placeholderSub: {
    color: theme.colors.gray400,
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 1,
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 4,
  },
  iconSpacing: {
    marginLeft: 12,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.gray600,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray100,
  },
  priceLabel: {
    fontSize: 11,
    color: theme.colors.gray500,
  },
  price: {
    fontSize: 15,
    fontWeight: theme.typography.fontBold,
    color: theme.colors.black,
  },
});

export default EventCard;
