import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BottomBanner from '../components/BottomBanner';
import TopBanner from '../components/TopBanner';
import { ROUTES } from '../navigation/routes';
import { RootStackParamList } from '../navigation/types';
import { fontScale, radiusScale, spaceScale } from '../style/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const WelcomeChooser = ({ navigation }: Props) => {
  const enter = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const orbit = useRef(new Animated.Value(0)).current;
  const childFloat = useRef(new Animated.Value(0)).current;
  const elderFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enter, { toValue: 1, speed: 10, bounciness: 6, useNativeDriver: true }).start();
  }, [enter]);

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    const orbitLoop = Animated.loop(
      Animated.timing(orbit, { toValue: 1, duration: 12000, easing: Easing.linear, useNativeDriver: true })
    );
    const childLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(childFloat, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(childFloat, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    const elderLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(elderFloat, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(elderFloat, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );

    pulseLoop.start();
    orbitLoop.start();
    childLoop.start();
    elderLoop.start();

    return () => {
      pulseLoop.stop();
      orbitLoop.stop();
      childLoop.stop();
      elderLoop.stop();
    };
  }, [pulse, orbit, childFloat, elderFloat]);

  const enterStyle = {
    opacity: enter,
    transform: [
      { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) },
      { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
    ],
  };

  const pulseStyle = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }),
    transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
  };

  const orbitStyle = {
    transform: [{ rotate: orbit.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#05020D', '#1A0B33', '#0E1B34', '#060B16']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
        <View style={styles.glowPink} />
        <View style={styles.glowBlue} />
        <View style={styles.glowPurple} />
        <TopBanner />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <Animated.View style={[styles.content, enterStyle]}>
            <Text style={styles.kicker}>Welcome</Text>
            <Text style={styles.title}>Choose your quiz world</Text>
            <Text style={styles.subtitle}>Tap the child side for fun learning or the elder side for the classic quiz board.</Text>

            <TouchableOpacity activeOpacity={0.92} onPress={() => navigation.navigate(ROUTES.ChildSection)} style={styles.choiceTouch}>
              <LinearGradient colors={['rgba(251,191,36,0.22)', 'rgba(244,114,182,0.18)', 'rgba(255,255,255,0.08)']} style={styles.choiceCard}>
                <Animated.View
                  style={[
                    styles.avatarWrap,
                    {
                      transform: [
                        { translateY: childFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
                        { rotate: childFloat.interpolate({ inputRange: [0, 1], outputRange: ['-5deg', '3deg'] }) },
                      ],
                    },
                  ]}
                >
                  <LinearGradient colors={['#FDE047', '#FB7185', '#8B5CF6']} style={styles.avatarRing}>
                    <View style={styles.avatarInner}>
                      <Text style={styles.avatarEmoji}>🧒</Text>
                    </View>
                  </LinearGradient>
                  <View style={styles.tagBubble}><Text style={styles.tagText}>ABC</Text></View>
                </Animated.View>
                <Text style={styles.choiceTitle}>Child Quiz</Text>
                <Text style={styles.choiceText}>Classes 1 to 5 with colorful questions, happy visuals, and easy taps.</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.centerStage}>
              <Animated.View style={[styles.halo, pulseStyle]} />
              <Animated.View style={[styles.orbit, orbitStyle]}>
                <View style={[styles.dot, styles.dotTop]} />
                <View style={[styles.dot, styles.dotRight]} />
                <View style={[styles.dot, styles.dotBottom]} />
                <View style={[styles.dot, styles.dotLeft]} />
              </Animated.View>
              <Animated.View style={[styles.coreWrap, pulseStyle]}>
                <LinearGradient colors={['#1E293B', '#312E81', '#0F172A']} style={styles.core}>
                  <Text style={styles.coreEmoji}>💡</Text>
                  <Text style={styles.coreTitle}>Knowledge</Text>
                  <Text style={styles.coreText}>Read. Think. Learn.</Text>
                </LinearGradient>
              </Animated.View>
            </View>

            <TouchableOpacity activeOpacity={0.92} onPress={() => navigation.navigate(ROUTES.QuizBoard)} style={styles.choiceTouch}>
              <LinearGradient colors={['rgba(96,165,250,0.22)', 'rgba(139,92,246,0.18)', 'rgba(255,255,255,0.08)']} style={styles.choiceCard}>
                <Animated.View
                  style={[
                    styles.avatarWrap,
                    {
                      transform: [
                        { translateY: elderFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
                        { rotate: elderFloat.interpolate({ inputRange: [0, 1], outputRange: ['4deg', '-3deg'] }) },
                      ],
                    },
                  ]}
                >
                  <LinearGradient colors={['#60A5FA', '#8B5CF6', '#22D3EE']} style={styles.avatarRing}>
                    <View style={styles.avatarInner}>
                      <Text style={styles.avatarEmoji}>🧓</Text>
                    </View>
                  </LinearGradient>
                  <View style={[styles.tagBubble, styles.tagBubbleBlue]}><Text style={styles.tagText}>GK</Text></View>
                </Animated.View>
                <Text style={styles.choiceTitle}>Elder Quiz</Text>
                <Text style={styles.choiceText}>Continue to the working quiz board exactly like before.</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
        <BottomBanner />
      </LinearGradient>
    </SafeAreaView>
  );
};

export default WelcomeChooser;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#05020D' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: spaceScale(18), paddingTop: spaceScale(24), paddingBottom: spaceScale(36) },
  glowPink: { position: 'absolute', top: -70, left: -90, width: 240, height: 240, borderRadius: 240, backgroundColor: 'rgba(244,114,182,0.16)' },
  glowBlue: { position: 'absolute', top: 180, right: -100, width: 280, height: 280, borderRadius: 280, backgroundColor: 'rgba(96,165,250,0.14)' },
  glowPurple: { position: 'absolute', bottom: -120, left: '12%', width: 320, height: 320, borderRadius: 320, backgroundColor: 'rgba(168,85,247,0.12)' },
  content: { alignItems: 'center' },
  kicker: { color: 'rgba(255,243,191,0.9)', textTransform: 'uppercase', letterSpacing: 3, fontSize: fontScale(11), fontWeight: '900' },
  title: { marginTop: spaceScale(10), color: '#FFFFFF', fontSize: fontScale(32), lineHeight: fontScale(38), fontWeight: '900', textAlign: 'center' },
  subtitle: { marginTop: spaceScale(12), maxWidth: 360, color: 'rgba(241,245,249,0.78)', fontSize: fontScale(15), lineHeight: fontScale(22), textAlign: 'center' },
  choiceTouch: { width: '100%' },
  choiceCard: { marginTop: spaceScale(18), width: '100%', paddingHorizontal: 20, paddingVertical: 22, borderRadius: radiusScale(30), borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center' },
  avatarWrap: { position: 'relative', marginBottom: 18 },
  avatarRing: { width: 132, height: 132, borderRadius: 132, padding: 5 },
  avatarInner: { flex: 1, borderRadius: 999, backgroundColor: 'rgba(9,12,24,0.9)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  avatarEmoji: { fontSize: 52 },
  tagBubble: { position: 'absolute', right: -10, top: 8, minWidth: 46, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFFFFF', alignItems: 'center' },
  tagBubbleBlue: { backgroundColor: '#E0F2FE' },
  tagText: { color: '#0F172A', fontSize: fontScale(11), fontWeight: '900', letterSpacing: 0.4 },
  choiceTitle: { color: '#FFFFFF', fontSize: fontScale(24), lineHeight: fontScale(30), fontWeight: '900', textAlign: 'center' },
  choiceText: { marginTop: 10, maxWidth: 320, color: 'rgba(241,245,249,0.78)', fontSize: fontScale(14), lineHeight: fontScale(21), textAlign: 'center' },
  centerStage: { width: '100%', minHeight: 250, alignItems: 'center', justifyContent: 'center', marginVertical: spaceScale(16) },
  halo: { position: 'absolute', width: 220, height: 220, borderRadius: 220, backgroundColor: 'rgba(96,165,250,0.16)' },
  orbit: { position: 'absolute', width: 240, height: 240, borderRadius: 240, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  dot: { position: 'absolute', width: 16, height: 16, borderRadius: 16, backgroundColor: '#FDE68A' },
  dotTop: { top: -8, left: '50%', marginLeft: -8 },
  dotRight: { right: -8, top: '50%', marginTop: -8, backgroundColor: '#93C5FD' },
  dotBottom: { bottom: -8, left: '50%', marginLeft: -8, backgroundColor: '#F9A8D4' },
  dotLeft: { left: -8, top: '50%', marginTop: -8, backgroundColor: '#C4B5FD' },
  coreWrap: { width: 184, height: 184, borderRadius: 184, overflow: 'hidden' },
  core: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  coreEmoji: { fontSize: 42 },
  coreTitle: { marginTop: 8, color: '#FFFFFF', fontSize: fontScale(20), fontWeight: '900' },
  coreText: { marginTop: 6, color: 'rgba(255,255,255,0.72)', fontSize: fontScale(12), fontWeight: '700' },
});
