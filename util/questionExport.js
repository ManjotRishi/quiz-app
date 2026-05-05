import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { Dirs, FileSystem } from 'react-native-file-access';
import { showExportSuccessModal } from './exportFeedback';

const EXPORT_DIRECTORY_NAME = 'DailyQuizzExports';

const sanitizeFileName = (value = 'quiz-question') => {
  const cleaned = String(value)
    .trim()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return cleaned || 'quiz-question';
};

const ensureAndroidLegacyStoragePermission = async () => {
  if (Platform.OS !== 'android' || Platform.Version >= 29) {
    return;
  }

  const permission = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    {
      title: 'Storage Permission',
      message: 'Quiz exports need storage access to save screenshots and notes.',
      buttonPositive: 'OK',
      buttonNegative: 'Cancel',
    }
  );

  if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
    throw new Error('Storage permission was not granted.');
  }
};

const ensureInternalExportDirectory = async () => {
  const exportDirectory = `${Dirs.DocumentDir}/${EXPORT_DIRECTORY_NAME}`;
  const exists = await FileSystem.exists(exportDirectory);

  if (!exists) {
    await FileSystem.mkdir(exportDirectory);
  }

  return exportDirectory;
};

const getVisibleSuccessPath = (fileName) =>
  Platform.OS === 'android'
    ? `Downloads/${EXPORT_DIRECTORY_NAME}/${fileName}`
    : `${Dirs.DocumentDir}/${EXPORT_DIRECTORY_NAME}/${fileName}`;

const persistExportFile = async (sourcePath, fileName) => {
  if (Platform.OS === 'android') {
    await ensureAndroidLegacyStoragePermission();
    await FileSystem.cpExternal(sourcePath, `${EXPORT_DIRECTORY_NAME}/${fileName}`, 'downloads');
    return getVisibleSuccessPath(fileName);
  }

  const exportDirectory = await ensureInternalExportDirectory();
  const destinationPath = `${exportDirectory}/${fileName}`;
  await FileSystem.cp(sourcePath, destinationPath);
  return destinationPath;
};

const buildQuestionText = ({
  quizTitle,
  questionNumber,
  totalQuestions,
  questionText,
  options,
  correctAnswer,
}) => {
  const optionLines = (options ?? [])
    .map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`)
    .join('\n');

  return [
    quizTitle || 'Quiz Question',
    `Question ${questionNumber}${totalQuestions ? ` of ${totalQuestions}` : ''}`,
    '',
    questionText || '',
    '',
    'Options:',
    optionLines,
    '',
    `Correct Answer: ${correctAnswer || 'Not available'}`,
  ].join('\n');
};

const showSuccessAlert = (title, path) => {
  showExportSuccessModal({ title, path });
};

const showFailureAlert = (title, error) => {
  Alert.alert(title, error instanceof Error ? error.message : 'Please try again.');
};

export const exportQuestionTextFile = async ({
  quizTitle,
  questionNumber,
  totalQuestions,
  questionText,
  options,
  correctAnswer,
}) => {
  try {
    const fileStem = sanitizeFileName(`${quizTitle || 'quiz'}-question-${questionNumber}`);
    const fileName = `${fileStem}.txt`;
    const internalDirectory = await ensureInternalExportDirectory();
    const tempPath = `${internalDirectory}/${fileName}`;
    const fileContents = buildQuestionText({
      quizTitle,
      questionNumber,
      totalQuestions,
      questionText,
      options,
      correctAnswer,
    });

    await FileSystem.writeFile(tempPath, fileContents, 'utf8');
    const savedPath = await persistExportFile(tempPath, fileName);
    if (tempPath !== savedPath) {
      await FileSystem.unlink(tempPath).catch(() => {});
    }
    showSuccessAlert('Question file saved', savedPath);
    return savedPath;
  } catch (error) {
    showFailureAlert('Unable to save question file', error);
    return null;
  }
};
