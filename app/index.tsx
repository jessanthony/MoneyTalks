import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, Platform, useWindowDimensions, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function SplashScreen() {
  const { width, height } = useWindowDimensions();

  // Responsive scale helpers
  const isSmall = width < 360;
  const fs = {
    logo: isSmall ? 36 : width < 400 ? 42 : 48,
    tagline: isSmall ? 10 : 12,
    feature: isSmall ? 10 : 11,
    button: isSmall ? 14 : 16,
    buttonSecondary: isSmall ? 12 : 14,
  };
  const coinSize = isSmall ? 64 : 80;
  const glowSize = isSmall ? 96 : 120;
  const topPad = height < 700 ? height * 0.08 : height * 0.12;
  const coinMargin = height < 700 ? 20 : 32;
  const featureMargin = height < 700 ? 20 : 40;
  const btnPad = height < 700 ? 14 : 18;

  // Animations
  const blob1Scale = useRef(new Animated.Value(1)).current;
  const blob2Scale = useRef(new Animated.Value(1)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;
  const loadAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Scale, { toValue: 1.2, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(blob1Scale, { toValue: 1, duration: 4000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Scale, { toValue: 1.3, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(blob2Scale, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: -12, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(loadAnim, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: false })
    ).start();
  }, []);

  const handleStart = () => router.replace('/(tabs)');

  const loadWidth = loadAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Background blobs */}
      <Animated.View
        style={[
          styles.blob1,
          {
            top: height * 0.06,
            left: -width * 0.2,
            width: width * 0.8,
            height: width * 0.8,
            borderRadius: width * 0.4,
            transform: [{ scale: blob1Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.blob2,
          {
            bottom: height * 0.15,
            right: -width * 0.3,
            width: width,
            height: width,
            borderRadius: width * 0.5,
            transform: [{ scale: blob2Scale }],
          },
        ]}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad, paddingHorizontal: width * 0.08 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Glowing Coin */}
        <Animated.View style={[styles.coinContainer, { marginBottom: coinMargin, transform: [{ translateY: bobAnim }] }]}>
          <View
            style={[
              styles.coinGlow,
              { width: glowSize, height: glowSize, borderRadius: glowSize / 2 },
            ]}
          />
          <View
            style={[
              styles.coin,
              { width: coinSize, height: coinSize, borderRadius: coinSize / 2 },
            ]}
          >
            <Ionicons name="cash" size={coinSize * 0.5} color="#FFD700" />
          </View>
        </Animated.View>

        {/* Branding */}
        <Text style={[styles.logoText, { fontSize: fs.logo }]}>Money Talks</Text>
        <View style={styles.divider} />
        <Text style={[styles.tagline, { fontSize: fs.tagline, marginBottom: featureMargin }]}>
          YOUR MONEY, YOUR RULES
        </Text>

        {/* Feature Icons */}
        <View style={styles.featuresRow}>
          <FeatureIcon icon="bar-chart-outline" label="Track" color="#48BB78" fs={fs.feature} />
          <FeatureIcon icon="send-outline" label="Send" color="#3182CE" fs={fs.feature} />
          <FeatureIcon icon="wallet-outline" label="Save" color="#ECC94B" fs={fs.feature} />
          <FeatureIcon icon="trending-up-outline" label="Grow" color="#9F7AEA" fs={fs.feature} />
        </View>

        <View style={{ flex: 1, minHeight: 24 }} />

        {/* Loading Bar */}
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { fontSize: fs.tagline }]}>Loading your finances...</Text>
          <View style={styles.loadingTrack}>
            <Animated.View style={[styles.loadingFill, { width: loadWidth }]} />
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={[styles.primaryButton, { paddingVertical: btnPad }]}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryButtonText, { fontSize: fs.button }]}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { paddingVertical: btnPad }]}
          onPress={handleStart}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryButtonText, { fontSize: fs.buttonSecondary }]}>
            I already have an account
          </Text>
        </TouchableOpacity>

        <Text style={styles.version}>v1.0.0 — Money Talks</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const FeatureIcon = ({ icon, label, color, fs }: { icon: any; label: string; color: string; fs: number }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconBox}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={[styles.featureLabel, { fontSize: fs }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2B1D',
    overflow: 'hidden',
  },
  blob1: {
    position: 'absolute',
    backgroundColor: 'rgba(72, 187, 120, 0.15)',
  },
  blob2: {
    position: 'absolute',
    backgroundColor: 'rgba(49, 151, 149, 0.1)',
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  coinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinGlow: {
    position: 'absolute',
    backgroundColor: 'rgba(72, 187, 120, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(72, 187, 120, 0.4)',
  },
  coin: {
    backgroundColor: '#22543D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#48BB78',
    elevation: 10,
    shadowColor: '#48BB78',
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  logoText: {
    color: '#FFF',
    fontStyle: 'italic',
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'sans-serif-medium',
    marginBottom: 10,
  },
  divider: {
    height: 2,
    width: 80,
    backgroundColor: '#48BB78',
    marginBottom: 12,
    borderRadius: 1,
  },
  tagline: {
    color: '#9AE6B4',
    letterSpacing: 2,
    fontWeight: '600',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  featureItem: { alignItems: 'center', flex: 1 },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureLabel: {
    color: '#A0AEC0',
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContainer: { width: '100%', marginBottom: 24 },
  loadingText: {
    color: '#A0AEC0',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingFill: {
    height: '100%',
    backgroundColor: '#48BB78',
    borderRadius: 2,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#276749',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#48BB78',
  },
  primaryButtonText: { color: '#FFF', fontWeight: 'bold' },
  secondaryButton: {
    width: '100%',
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: { color: '#FFF', fontWeight: '600' },
  version: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 10,
    marginBottom: 4,
  },
});
