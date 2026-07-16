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
    backgroundColor: '#111111', // Deep dark card background
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    marginHorizontal: 16,
  },
  imageContainer: {
    height: 180,
    backgroundColor: '#222',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: theme.typography.fontBlack,
    letterSpacing: 2,
  },
  placeholderSub: {
    color: '#888',
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 1,
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 6,
  },
  iconSpacing: {
    marginLeft: 16,
  },
  detailText: {
    fontSize: 12,
    color: '#a3a3a3',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  priceLabel: {
    fontSize: 11,
    color: '#737373',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default EventCard;
