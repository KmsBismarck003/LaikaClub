import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const SkeletonEventCard = ({ pulseAnim }) => (
  <View style={styles.card}>
    <Animated.View style={[styles.imageContainer, { opacity: pulseAnim }]} />
    <View style={styles.infoContainer}>
      <Animated.View style={[styles.titleLine, { opacity: pulseAnim }]} />
      <View style={styles.detailRow}>
        <Animated.View style={[styles.iconLine, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.iconLine, { opacity: pulseAnim }]} />
      </View>
      <Animated.View style={[styles.locationLine, { opacity: pulseAnim }]} />
      <View style={styles.footer}>
        <Animated.View style={[styles.priceLine, { opacity: pulseAnim }]} />
      </View>
    </View>
  </View>
);

const SkeletonEventGrid = ({ count = 4 }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonEventCard key={`skel-card-${index}`} pulseAnim={pulseAnim} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    marginHorizontal: 16,
  },
  imageContainer: {
    height: 180,
    backgroundColor: '#222',
  },
  infoContainer: {
    padding: 16,
  },
  titleLine: {
    width: '80%',
    height: 20,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  iconLine: {
    width: 60,
    height: 12,
    backgroundColor: '#333',
    borderRadius: 4,
    marginRight: 20,
  },
  locationLine: {
    width: '60%',
    height: 12,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 12,
  },
  priceLine: {
    width: 80,
    height: 16,
    backgroundColor: '#333',
    borderRadius: 4,
  },
});

export default SkeletonEventGrid;
