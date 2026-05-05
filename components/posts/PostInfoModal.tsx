import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { fontScale, radiusScale, spaceScale } from '../../style/responsive';
import { CloseIcon } from '../icons/AppShellIcons';

type SupportedLanguage = 'English' | 'Hindi' | 'Punjabi';

type PostInfoModalProps = {
  visible: boolean;
  preferredLanguage?: string;
  onClose: () => void;
};

const BUTTON_LABELS: Record<SupportedLanguage, string> = {
  English: 'Got it',
  Hindi: 'समझ गया',
  Punjabi: 'ਠੀਕ ਹੈ',
};

const INFO_SECTIONS: Array<{
  language: SupportedLanguage;
  title: string;
  description: string;
}> = [
  {
    language: 'English',
    title: 'Welcome to Posts',
    description:
      'Discover thoughts, ideas, and knowledge shared daily by professors, teachers, senior technical people, agricultural experts, and artists.',
  },
  {
    language: 'Hindi',
    title: 'पोस्ट में आपका स्वागत है',
    description:
      'यहाँ प्रोफेसर, शिक्षक, वरिष्ठ तकनीकी लोग, कृषि विशेषज्ञ और कलाकार रोज़ अपने विचार, ज्ञान और अनुभव पोस्ट के माध्यम से साझा करते हैं।',
  },
  {
    language: 'Punjabi',
    title: 'ਪੋਸਟਾਂ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ',
    description:
      'ਇੱਥੇ ਪ੍ਰੋਫੈਸਰ, ਅਧਿਆਪਕ, ਸੀਨੀਅਰ ਤਕਨੀਕੀ ਲੋਕ, ਖੇਤੀਬਾੜੀ ਮਾਹਿਰ ਅਤੇ ਕਲਾਕਾਰ ਰੋਜ਼ਾਨਾ ਆਪਣੇ ਵਿਚਾਰ, ਗਿਆਨ ਅਤੇ ਤਜਰਬੇ ਪੋਸਟਾਂ ਰਾਹੀਂ ਸਾਂਝੇ ਕਰਦੇ ਹਨ।',
  },
];

const resolveButtonLabel = (preferredLanguage?: string) => {
  if (preferredLanguage === 'Hindi' || preferredLanguage === 'Punjabi') {
    return BUTTON_LABELS[preferredLanguage];
  }

  return BUTTON_LABELS.English;
};

const PostInfoModal = ({ visible, preferredLanguage, onClose }: PostInfoModalProps) => (
  <Modal
    animationType="fade"
    transparent
    statusBarTranslucent
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.overlay}>
      <TouchableOpacity activeOpacity={1} style={styles.backdrop} onPress={onClose} />

      <View style={styles.shell}>
        <LinearGradient
          colors={['rgba(8,22,34,0.98)', 'rgba(12,31,45,0.98)', 'rgba(17,44,61,0.98)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <View style={styles.kickerPill}>
                <Text style={styles.kickerText}>Community Voices</Text>
              </View>
              <Text style={styles.heading}>Inside Posts</Text>
              <Text style={styles.subheading}>
                Learn who shares helpful ideas, knowledge, and real-world experience here every day.
              </Text>
            </View>

            <TouchableOpacity activeOpacity={0.88} onPress={onClose} style={styles.closeButton}>
              <CloseIcon color="#E2E8F0" size={18} />
            </TouchableOpacity>
          </View>

          <ScrollView
            bounces={false}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {INFO_SECTIONS.map((section, index) => (
              <View
                key={section.language}
                style={[
                  styles.languageCard,
                  index === 0 ? styles.languageCardPrimary : null,
                ]}
              >
                <Text style={styles.languageLabel}>{section.language}</Text>
                <Text style={styles.languageTitle}>{section.title}</Text>
                <Text style={styles.languageDescription}>{section.description}</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity activeOpacity={0.92} onPress={onClose} style={styles.buttonTouch}>
            <LinearGradient
              colors={['#14B8A6', '#38BDF8', '#F59E0B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>{resolveButtonLabel(preferredLanguage)}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spaceScale(18),
    backgroundColor: 'rgba(3, 9, 16, 0.76)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  shell: {
    width: '100%',
  },
  card: {
    maxHeight: '84%',
    borderRadius: radiusScale(30),
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    paddingHorizontal: spaceScale(20),
    paddingTop: spaceScale(20),
    paddingBottom: spaceScale(18),
    shadowColor: '#021018',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spaceScale(12),
  },
  headerCopy: {
    flex: 1,
  },
  kickerPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spaceScale(10),
    paddingVertical: spaceScale(6),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(20,184,166,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.18)',
  },
  kickerText: {
    color: '#9FE7DC',
    fontSize: fontScale(11),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heading: {
    marginTop: spaceScale(10),
    color: '#F8FBFF',
    fontSize: fontScale(24),
    fontWeight: '900',
  },
  subheading: {
    marginTop: spaceScale(8),
    color: 'rgba(226,232,240,0.8)',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    fontWeight: '600',
  },
  closeButton: {
    width: spaceScale(38),
    height: spaceScale(38),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingTop: spaceScale(18),
    gap: spaceScale(10),
  },
  languageCard: {
    borderRadius: radiusScale(22),
    paddingHorizontal: spaceScale(14),
    paddingVertical: spaceScale(14),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  languageCardPrimary: {
    backgroundColor: 'rgba(20,184,166,0.08)',
    borderColor: 'rgba(56,189,248,0.14)',
  },
  languageLabel: {
    color: '#7DD3FC',
    fontSize: fontScale(10),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  languageTitle: {
    marginTop: spaceScale(8),
    color: '#F8FAFC',
    fontSize: fontScale(15),
    lineHeight: fontScale(20),
    fontWeight: '800',
  },
  languageDescription: {
    marginTop: spaceScale(6),
    color: 'rgba(226,232,240,0.84)',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    fontWeight: '500',
  },
  buttonTouch: {
    marginTop: spaceScale(18),
  },
  button: {
    minHeight: spaceScale(50),
    borderRadius: radiusScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spaceScale(14),
  },
  buttonText: {
    color: '#082032',
    fontSize: fontScale(14),
    fontWeight: '900',
  },
});

export default PostInfoModal;
