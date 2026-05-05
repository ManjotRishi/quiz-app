import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ROUTES } from '../../navigation/routes';
import { fontScale, radiusScale, spaceScale } from '../../style/responsive';

type Props = {
  navigation: {
    navigate: (route: string) => void;
  };
  title: string;
  message: string;
  onRetry: () => void;
};

const ReadingErrorState = ({ navigation, title, message, onRetry }: Props) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity activeOpacity={0.9} onPress={onRetry} style={styles.buttonHit}>
            <LinearGradient colors={['#2563EB', '#7C3AED']} style={styles.button}>
              <Text style={styles.buttonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(ROUTES.Home)} style={styles.linkHit}>
            <Text style={styles.linkText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ReadingErrorState;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#04020A',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spaceScale(18),
  },
  card: {
    width: '100%',
    maxWidth: 360,
    paddingHorizontal: spaceScale(20),
    paddingVertical: spaceScale(22),
    borderRadius: radiusScale(24),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: fontScale(22),
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    marginTop: spaceScale(10),
    color: 'rgba(241,245,249,0.78)',
    fontSize: fontScale(14),
    lineHeight: fontScale(21),
    textAlign: 'center',
  },
  buttonHit: {
    marginTop: spaceScale(18),
    borderRadius: radiusScale(999),
    overflow: 'hidden',
  },
  button: {
    minHeight: 48,
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: fontScale(14),
    fontWeight: '900',
  },
  linkHit: {
    marginTop: spaceScale(14),
    alignSelf: 'center',
  },
  linkText: {
    color: '#93C5FD',
    fontSize: fontScale(13),
    fontWeight: '800',
  },
});
