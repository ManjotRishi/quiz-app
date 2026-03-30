import { Platform } from 'react-native';
import Tts from 'react-native-tts';

const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_RATE = 0.52;
const DEFAULT_PITCH = 0.9;
const MALE_PITCH = 0.82;
const DEFAULT_APP_LANGUAGE = 'English';
const LANGUAGE_CANDIDATES = {
  English: ['en-IN', 'en-US', 'en-GB'],
  Hindi: ['hi-IN', 'hi'],
};
const MALE_KEYWORDS = ['male', 'man', 'david', 'mark', 'adam', 'daniel', 'james', 'ravi', 'rahul'];
const FEMALE_KEYWORDS = ['female', 'woman', 'zira', 'hazel', 'susan', 'samantha', 'victoria', 'karen'];
const LANGUAGE_VOICE_HINTS = {
  English: ['en-male', 'en-us', 'en-gb'],
  Hindi: ['hi', 'hindi'],
};
const PREFERRED_MALE_VOICE_IDS = {
  English: [
    'en-us-x-sfg#male_1-local',
    'en-us-x-sfg#male_2-local',
    'en-gb-x-gbd#male_1-local',
    'en-in-x-ene#male_1-local',
  ],
  Hindi: [
    'hi-in-x-hia#male_1-local',
    'hi-in-x-hia#male_2-local',
  ],
};

let initPromise = null;
let isConfigured = false;
let activeVoiceCode = DEFAULT_LANGUAGE;
let activeAppLanguage = DEFAULT_APP_LANGUAGE;
let activeVoiceId = null;

const cleanText = (value) =>
  String(value ?? '')
    ?.replace(/\s+/g, ' ')
    ?.replace(/\s+([.,!?;:])/g, '$1')
    ?.trim();

const safelyInvoke = async (fn, label) => {
  try {
    return await fn();
  } catch (error) {
    console.warn(`[quizTts] ${label} failed:`, error);
    return null;
  }
};

const normalizeAppLanguage = (value) => {
  const raw = String(value ?? '').trim().toLowerCase();

  if (!raw) {
    return DEFAULT_APP_LANGUAGE;
  }

  if (raw.startsWith('hi')) {
    return 'Hindi';
  }

  if (raw.startsWith('pa') || raw.includes('punjabi')) {
    // Punjabi content uses Hindi voice fallback for smoother playback.
    return 'Hindi';
  }

  return 'English';
};

const resolveLanguageCandidates = (appLanguage) => {
  const normalized = normalizeAppLanguage(appLanguage);
  return LANGUAGE_CANDIDATES[normalized] ?? LANGUAGE_CANDIDATES[DEFAULT_APP_LANGUAGE];
};

const resolveVoiceScore = (voice, normalizedLanguage) => {
  const blob = `${voice?.id ?? ''} ${voice?.name ?? ''}`.toLowerCase();
  let score = 0;

  if (!voice?.networkConnectionRequired) {
    score += 20;
  }

  if (voice?.quality && Number(voice.quality) >= 300) {
    score += 8;
  }

  if (MALE_KEYWORDS.some((word) => blob.includes(word))) {
    score += 120;
  }

  if (FEMALE_KEYWORDS.some((word) => blob.includes(word))) {
    score -= 120;
  }

  const languageHints = LANGUAGE_VOICE_HINTS[normalizedLanguage] ?? [];
  if (languageHints.some((word) => blob.includes(word))) {
    score += 18;
  }

  return score;
};

const isMaleLikeVoice = (voice) => {
  const blob = `${voice?.id ?? ''} ${voice?.name ?? ''}`.toLowerCase();
  return MALE_KEYWORDS.some((word) => blob.includes(word));
};

const matchesLanguage = (voice, languageCode) => {
  const voiceLang = String(voice?.language ?? '').toLowerCase();
  const target = String(languageCode ?? '').toLowerCase();
  const targetBase = target.split('-')[0];

  return voiceLang === target || voiceLang.startsWith(`${targetBase}-`) || voiceLang === targetBase;
};

const setPreferredVoice = async (normalizedLanguage, languageCode) => {
  const voices = await safelyInvoke(() => Tts.voices(), 'voices');

  if (!Array.isArray(voices) || !voices.length) {
    return false;
  }

  const installedLanguageVoices = voices
    .filter((voice) => !voice?.notInstalled)
    .filter((voice) => matchesLanguage(voice, languageCode));

  if (!installedLanguageVoices.length) {
    return false;
  }

  const preferredVoiceIds = PREFERRED_MALE_VOICE_IDS[normalizedLanguage] ?? [];
  const preferredVoice = installedLanguageVoices.find((voice) =>
    preferredVoiceIds.includes(String(voice?.id ?? ''))
  );
  const maleTaggedVoice = installedLanguageVoices
    .filter((voice) => isMaleLikeVoice(voice))
    .map((voice) => ({ voice, score: resolveVoiceScore(voice, normalizedLanguage) }))
    .sort((a, b) => b.score - a.score)[0]?.voice;
  const bestScoredVoice = installedLanguageVoices
    .map((voice) => ({ voice, score: resolveVoiceScore(voice, normalizedLanguage) }))
    .sort((a, b) => b.score - a.score)[0]?.voice;
  const bestVoice = preferredVoice ?? maleTaggedVoice ?? bestScoredVoice;

  if (!bestVoice?.id) {
    return false;
  }

  if (bestVoice.id === activeVoiceId) {
    return true;
  }

  const result = await safelyInvoke(() => Tts.setDefaultVoice(bestVoice.id), `setDefaultVoice:${bestVoice.id}`);

  if (result !== null) {
    activeVoiceId = bestVoice.id;
    const targetPitch = isMaleLikeVoice(bestVoice) ? MALE_PITCH : DEFAULT_PITCH;
    await safelyInvoke(() => Tts.setDefaultPitch(targetPitch), `setDefaultPitch:${targetPitch}`);
    return true;
  }

  return false;
};

const setVoiceLanguage = async (appLanguage, options = {}) => {
  const { force = false } = options;
  const normalized = normalizeAppLanguage(appLanguage);

  if (!force && normalized === activeAppLanguage) {
    return true;
  }

  const candidates = resolveLanguageCandidates(normalized);

  for (const code of candidates) {
    const result = await safelyInvoke(() => Tts.setDefaultLanguage(code), `setDefaultLanguage:${code}`);

    if (result !== null) {
      activeVoiceCode = code;
      activeAppLanguage = normalized;
      await setPreferredVoice(normalized, code);
      return true;
    }
  }

  console.warn(`[quizTts] No supported TTS language for ${normalized}. Keeping ${activeVoiceCode}.`);
  return false;
};

const configureTts = async () => {
  if (isConfigured) {
    return true;
  }

  try {
    await Tts.getInitStatus();
  } catch (error) {
    console.warn('[quizTts] getInitStatus failed:', error);

    if (error?.code === 'no_engine') {
      await safelyInvoke(() => Tts.requestInstallEngine(), 'requestInstallEngine');
    }

    return false;
  }

  await setVoiceLanguage(DEFAULT_APP_LANGUAGE, { force: true });

  await safelyInvoke(() => Tts.setDefaultRate(DEFAULT_RATE), 'setDefaultRate');
  await safelyInvoke(() => Tts.setDefaultPitch(DEFAULT_PITCH), 'setDefaultPitch');
  await safelyInvoke(() => Tts.setDucking(true), 'setDucking');

  if (Platform.OS === 'ios') {
    await safelyInvoke(() => Tts.setIgnoreSilentSwitch('ignore'), 'setIgnoreSilentSwitch');
  }

  isConfigured = true;
  return true;
};

export const ensureQuizVoiceReady = async (appLanguage = DEFAULT_APP_LANGUAGE) => {
  if (!initPromise) {
    initPromise = configureTts().catch((error) => {
      isConfigured = false;
      initPromise = null;
      throw error;
    });
  }

  const ready = await initPromise;

  if (!ready) {
    return false;
  }

  await setVoiceLanguage(appLanguage);
  return true;
};

export const stopQuizVoice = async () => {
  await safelyInvoke(() => Tts.stop(), 'stop');
};

export const speakQuizText = async (text, options = {}) => {
  const { interrupt = true, appLanguage = DEFAULT_APP_LANGUAGE } = options;
  const message = cleanText(text);

  if (!message) {
    return false;
  }

  try {
    const ready = await ensureQuizVoiceReady(appLanguage);

    if (!ready) {
      console.warn('[quizTts] TTS engine is not ready yet.');
      return false;
    }

    if (interrupt) {
      await stopQuizVoice();
    }

    Tts.speak(message);
    return true;
  } catch (error) {
    console.warn('[quizTts] speak failed:', error);
    return false;
  }
};

export const buildQuestionSpeech = (questionNumber, questionText, appLanguage = DEFAULT_APP_LANGUAGE) => {
  const language = normalizeAppLanguage(appLanguage);
  const labels = {
    English: 'Question',
    Hindi: 'प्रश्न',
  };
  const questionLabel = labels[language] ?? labels.English;
  const prefix = typeof questionNumber === 'number' && questionNumber > 0
    ? `${questionLabel} ${questionNumber}. `
    : '';

  return `${prefix}${cleanText(questionText)}`;
};

export const buildFeedbackSpeech = ({
  correctAnswer,
  appLanguage = DEFAULT_APP_LANGUAGE,
}) => {
  const language = normalizeAppLanguage(appLanguage);
  const answer = cleanText(correctAnswer);
  const optionMatch = answer.match(/^\s*([A-D])[\)\].:\-\s]/i);
  const optionLabel = optionMatch?.[1]?.toUpperCase?.() ?? '';

  if (language === 'Hindi') {
    if (optionLabel) {
      return `सही उत्तर है विकल्प ${optionLabel}.`;
    }

    if (answer) {
      return `सही उत्तर है ${answer}.`;
    }

    return 'सही उत्तर दिखाया नहीं जा सका।';
  }

  if (optionLabel) {
    return `${optionLabel} is the right answer.`;
  }

  if (answer) {
    return `The right answer is ${answer}.`;
  }

  return 'The right answer is not available.';
};

export const resetQuizVoice = async () => {
  await stopQuizVoice();
};

export const testQuizVoice = async (text = 'Voice test. This is Quizzy speaking.') => {
  const ready = await ensureQuizVoiceReady(DEFAULT_APP_LANGUAGE);

  if (!ready) {
    console.warn('[quizTts] TTS engine did not initialize.');
    return false;
  }

  return speakQuizText(text, { interrupt: true, appLanguage: DEFAULT_APP_LANGUAGE });
};
