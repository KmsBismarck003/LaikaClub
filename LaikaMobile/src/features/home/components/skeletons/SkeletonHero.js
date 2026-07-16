import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const SkeletonHero = () => {
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
      <Animated.View style={[styles.skeletonImage, { opacity: pulseAnim }]} />
      <View style={styles.contentOverlay}>
        <Animated.View style={[styles.skeletonBadge, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.skeletonTitle, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.skeletonTitleShort, { opacity: pulseAnim }]} />
        <View style={styles.metaRow}>
          <Animated.View style={[styles.skeletonMeta, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.skeletonMeta, { opacity: pulseAnim }]} />
        </View>
        <Animated.View style={[styles.skeletonButton, { opacity: pulseAnim }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 480,
    backgroundColor: '#111',
    position: 'relative',
    marginBottom: 24,
  },
  skeletonImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  skeletonBadge: {
    width: 100,
    height: 14,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonTitle: {
    width: '90%',
    height: 38,
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonTitleShort: {
    width: '60%',
    height: 38,
    backgroundColor: '#333',
    borderRadius: 8,
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  skeletonMeta: {
    width: 80,
    height: 16,
    backgroundColor: '#333',
    borderRadius: 4,
    marginRight: 16,
  },
  skeletonButton: {
    width: 140,
    height: 44,
    backgroundColor: '#333',
    borderRadius: 22,
  },
});

export default SkeletonHero;
