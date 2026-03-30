import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const StartQuizOverlay = ({
  visible,
  title,
  subtitle,
  onStart,
  accentLabel = 'Knowledge always wins',
}) => {
  if (!visible) {
    return null;
  }

  return (
    <Modal transparent statusBarTranslucent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.shell}>
          <View style={styles.borderOuter}>
            <LinearGradient
              colors={['rgba(20,58,146,0.95)', 'rgba(123,67,214,0.95)', 'rgba(232,77,156,0.95)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.border}
            />
          </View>

          <LinearGradient
            colors={['rgba(16,20,42,0.98)', 'rgba(10,14,28,0.99)', 'rgba(20,12,38,0.99)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.topSpacing} />

            <LinearGradient
              colors={['rgba(139,92,246,0.95)', 'rgba(37,99,235,0.90)', 'rgba(244,114,182,0.82)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badge}
            >
              <Text style={styles.badgeText}>{accentLabel}</Text>
            </LinearGradient>

            <View style={styles.heroBlock}>
              <Text style={styles.heroPrefix}>One Chapter Closer to Success</Text>
              <Text style={styles.heroSubcopy}>
                Pick your answer, move with confidence, and let the game begin.
              </Text>
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <TouchableOpacity activeOpacity={0.86} onPress={onStart} style={styles.startButton}>
              <LinearGradient
                colors={['#8B5CF6', '#60A5FA', '#2B115A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startGradient}
              >
                <Text style={styles.startText}>Start Quiz</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.bottomSpacing} />
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5,8,18,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  shell: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 34,
  },
  borderOuter: {
    position: 'absolute',
    left: -10,
    right: -10,
    top: -10,
    bottom: -10,
    borderRadius: 44,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  border: {
    flex: 1,
    borderRadius: 40,
  },
  card: {
    borderRadius: 33,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.34,
    shadowRadius: 28,
    elevation: 12,
  },
  topSpacing: {
    height: 16,
  },
  bottomSpacing: {
    height: 18,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 14,
  },
  badgeText: {
    color: '#F8F4FF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  heroBlock: {
    width: '100%',
    minHeight: 120,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  heroPrefix: {
    color: '#F4F7FF',
    fontSize: 23,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  heroSubcopy: {
    marginTop: 8,
    color: 'rgba(244,247,255,0.72)',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  title: {
    marginTop: 6,
    color: '#F7F3FF',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 10,
    color: 'rgba(244,247,255,0.74)',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  startButton: {
    width: '100%',
    marginTop: 18,
    borderRadius: 18,
    overflow: 'hidden',
  },
  startGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    color: '#F8F4FF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});

export default StartQuizOverlay;
