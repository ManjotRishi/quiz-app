import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackIcon, BookmarkOutlineIcon } from '../components/icons';
import TopBanner from '../components/TopBanner';
import { ROUTES } from '../navigation/routes';
import { RootStackParamList } from '../navigation/types';
import { colors } from '../style/colors';
import { fontScale, radiusScale, spaceScale } from '../style/responsive';
import {
  FavouriteQuestionRecord,
  NoteRecord,
  deleteFavouriteQuestion,
  deleteNote,
  getWeeklyFavouriteQuestions,
  getWeeklyNotes,
  saveNote,
} from '../util/savedContent';
import { showToast } from '../util/toastFeedback';

type RootNav = NativeStackNavigationProp<RootStackParamList>;
type SavedTabKey = 'questions' | 'notes';

const BookmarksScreen = () => {
  const navigation = useNavigation<RootNav>();
  const [activeTab, setActiveTab] = useState<SavedTabKey>('questions');
  const [favouriteQuestions, setFavouriteQuestions] = useState<FavouriteQuestionRecord[]>([]);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const loadSavedContent = useCallback(async () => {
    try {
      setIsLoading(true);
      const [questionResult, noteResult] = await Promise.allSettled([
        getWeeklyFavouriteQuestions(),
        getWeeklyNotes(),
      ]);

      if (questionResult.status === 'fulfilled') {
        setFavouriteQuestions(questionResult.value);
      } else {
        console.warn('Failed to load favourite questions:', questionResult.reason);
        setFavouriteQuestions([]);
      }

      if (noteResult.status === 'fulfilled') {
        setNotes(noteResult.value);
      } else {
        console.warn('Failed to load notes:', noteResult.reason);
        setNotes([]);
      }

      if (questionResult.status === 'rejected' && noteResult.status === 'rejected') {
        showToast({
          title: 'Unable to load saved items',
          message: 'Saved content is taking too long to load. Please try again.',
          type: 'error',
        });
      }
    } catch (error) {
      console.warn('Failed to load saved content:', error);
      showToast({
        title: 'Unable to load saved items',
        message: error instanceof Error ? error.message : 'Please try again.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedContent();
    }, [loadSavedContent])
  );

  const handleCloseNoteModal = useCallback(() => {
    if (isSavingNote) {
      return;
    }

    setNoteModalVisible(false);
    setNoteDraft('');
  }, [isSavingNote]);

  const handleSaveNote = useCallback(async () => {
    const trimmedNote = noteDraft.trim();

    if (!trimmedNote) {
      showToast({
        title: 'Note is empty',
        message: 'Write something before saving your note.',
        type: 'error',
      });
      return;
    }

    setIsSavingNote(true);

    try {
      const result = await saveNote(trimmedNote);

      if (result.status === 'limit') {
        showToast({
          title: 'Weekly limit reached',
          message: 'You can keep up to 10 notes each week.',
          type: 'error',
        });
        return;
      }

      setNotes(result.items);
      setNoteDraft('');
      setNoteModalVisible(false);
      showToast({
        title: 'Note saved',
        message: 'Your note is now available in Saved > Notes.',
        type: 'success',
      });
    } catch (error) {
      console.warn('Failed to save note:', error);
      showToast({
        title: 'Unable to save note',
        message: error instanceof Error ? error.message : 'Please try again.',
        type: 'error',
      });
    } finally {
      setIsSavingNote(false);
    }
  }, [noteDraft]);

  const handleDeleteNote = useCallback(async (noteId: string) => {
    try {
      setDeletingNoteId(noteId);
      const nextNotes = await deleteNote(noteId);
      setNotes(nextNotes);
      showToast({
        title: 'Note deleted',
        message: 'The note was removed from your saved list.',
        type: 'info',
      });
    } catch (error) {
      console.warn('Failed to delete note:', error);
      showToast({
        title: 'Unable to delete note',
        message: error instanceof Error ? error.message : 'Please try again.',
        type: 'error',
      });
    } finally {
      setDeletingNoteId(null);
    }
  }, []);

  const handleDeleteFavouriteQuestion = useCallback(async (questionId: string) => {
    try {
      setDeletingQuestionId(questionId);
      const nextQuestions = await deleteFavouriteQuestion(questionId);
      setFavouriteQuestions(nextQuestions);
      showToast({
        title: 'Question deleted',
        message: 'The question was removed from your saved list.',
        type: 'info',
      });
    } catch (error) {
      console.warn('Failed to delete favourite question:', error);
      showToast({
        title: 'Unable to delete question',
        message: error instanceof Error ? error.message : 'Please try again.',
        type: 'error',
      });
    } finally {
      setDeletingQuestionId(null);
    }
  }, []);

  const renderQuestionsTab = () => {
    if (isLoading) {
      return (
        <View style={styles.loaderCard}>
          <ActivityIndicator color="#0E8FA1" size="large" />
          <Text style={styles.loaderText}>Loading favourite questions...</Text>
        </View>
      );
    }

    if (!favouriteQuestions.length) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No favourite questions yet</Text>
          <Text style={styles.emptyText}>
            Tap the favourite icon on any MCQ screen and it will appear here for this week.
          </Text>
        </View>
      );
    }

    return favouriteQuestions.map((item) => (
      <View key={item.id} style={styles.savedCard}>
        <View style={styles.savedCardHeader}>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{item.quizTitle}</Text>
          </View>
          <Text style={styles.savedMeta}>
            Q{item.questionNumber ?? 1}
            {item.totalQuestions ? `/${item.totalQuestions}` : ''}
          </Text>
        </View>

        <Text style={styles.savedQuestion}>{item.questionText}</Text>

        {item.options?.length ? (
          <View style={styles.optionsBlock}>
            {item.options.map((option, index) => (
              <Text key={`${item.id}-${option}`} style={styles.optionLine}>
                {String.fromCharCode(65 + index)}. {option}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.answerCard}>
          <Text style={styles.answerLabel}>Answer</Text>
          <Text style={styles.answerValue}>{item.answerText}</Text>
        </View>

        <View style={styles.savedCardFooter}>
          <Text style={styles.savedSourceText}>{item.source}</Text>
          <TouchableOpacity
            activeOpacity={0.86}
            disabled={deletingQuestionId === item.id}
            onPress={() => handleDeleteFavouriteQuestion(item.id)}
            style={styles.questionDeleteButton}
          >
            {deletingQuestionId === item.id ? (
              <ActivityIndicator color="#DC2626" size="small" />
            ) : (
              <Text style={styles.questionDeleteText}>Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  const renderNotesTab = () => {
    if (isLoading) {
      return (
        <View style={styles.loaderCard}>
          <ActivityIndicator color="#0E8FA1" size="large" />
          <Text style={styles.loaderText}>Loading notes...</Text>
        </View>
      );
    }

    return (
      <>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setNoteModalVisible(true)}
          style={styles.noteButtonTouch}
        >
          <LinearGradient
            colors={['#0E8FA1', '#73C4C0', '#F4B36F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.noteButton}
          >
            <Text style={styles.noteButtonText}>Add Note</Text>
          </LinearGradient>
        </TouchableOpacity>

        {!notes.length ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No notes this week</Text>
            <Text style={styles.emptyText}>
              Use Add Note to save quick reminders, revision points, or ideas for later.
            </Text>
          </View>
        ) : (
          notes.map((item, index) => (
            <View key={item.id} style={styles.noteCard}>
              <View style={styles.noteIndexWrap}>
                <Text style={styles.noteIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.noteContent}>
                <Text style={styles.noteText}>{item.note}</Text>
                <TouchableOpacity
                  activeOpacity={0.86}
                  disabled={deletingNoteId === item.id}
                  onPress={() => handleDeleteNote(item.id)}
                  style={styles.noteDeleteButton}
                >
                  {deletingNoteId === item.id ? (
                    <ActivityIndicator color="#DC2626" size="small" />
                  ) : (
                    <Text style={styles.noteDeleteText}>Delete</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#061722', '#0D2433', '#14384A']} style={styles.container}>
        <TopBanner />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate(ROUTES.Home)}
              style={styles.backButton}
            >
              <BackIcon color="#F8FBFF" size={16} style={undefined} />
            </TouchableOpacity>

            <View style={styles.headerCopy}>
              <Text style={styles.kicker}>Saved</Text>
              <Text style={styles.title}>Questions and notes</Text>
              <Text style={styles.subtitle}>
                Weekly space: {favouriteQuestions.length}/10 questions and {notes.length}/10 notes.
              </Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroBadge}>
              <BookmarkOutlineIcon color="#F8FBFF" size={18} filled />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Fresh every 7 days</Text>
              <Text style={styles.heroText}>
                Old favourites and notes are cleaned automatically, so this section always shows the current week.
              </Text>
            </View>
          </View>

          <View style={styles.segmentWrap}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setActiveTab('questions')}
              style={[styles.segmentPill, activeTab === 'questions' && styles.segmentPillActive]}
            >
              <Text style={activeTab === 'questions' ? styles.segmentTextActive : styles.segmentText}>
                Questions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setActiveTab('notes')}
              style={[styles.segmentPill, activeTab === 'notes' && styles.segmentPillActive]}
            >
              <Text style={activeTab === 'notes' ? styles.segmentTextActive : styles.segmentText}>
                Notes
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'questions' ? renderQuestionsTab() : renderNotesTab()}
        </ScrollView>

        <Modal animationType="fade" transparent visible={noteModalVisible} onRequestClose={handleCloseNoteModal}>
          <View style={styles.modalOverlay}>
            <TouchableOpacity activeOpacity={1} style={styles.modalBackdrop} onPress={handleCloseNoteModal} />
            <View style={styles.modalShell}>
              <LinearGradient
                colors={['rgba(10,19,32,0.98)', 'rgba(19,40,56,0.98)', 'rgba(14,29,43,0.98)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalCard}
              >
                <Text style={styles.modalTitle}>Add Note</Text>
                <Text style={styles.modalSubtitle}>You can save up to 10 notes each week.</Text>

                <TextInput
                  multiline
                  maxLength={240}
                  editable={!isSavingNote}
                  placeholder="Type your note here"
                  placeholderTextColor="rgba(203,213,225,0.52)"
                  style={styles.modalInput}
                  value={noteDraft}
                  onChangeText={setNoteDraft}
                />

                <Text style={styles.characterCount}>{noteDraft.trim().length}/240</Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    disabled={isSavingNote}
                    onPress={handleCloseNoteModal}
                    style={styles.modalGhostButton}
                  >
                    <Text style={styles.modalGhostText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    disabled={isSavingNote}
                    onPress={handleSaveNote}
                    style={styles.modalSaveTouch}
                  >
                    <LinearGradient
                      colors={['#0E8FA1', '#73C4C0', '#F4B36F']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.modalSaveButton}
                    >
                      {isSavingNote ? (
                        <ActivityIndicator color="#082032" size="small" />
                      ) : (
                        <Text style={styles.modalSaveText}>Save Note</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spaceScale(18),
    paddingTop: spaceScale(18),
    paddingBottom: spaceScale(120),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spaceScale(12),
  },
  headerCopy: {
    flex: 1,
  },
  backButton: {
    width: spaceScale(40),
    height: spaceScale(40),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    color: 'rgba(214,235,242,0.72)',
    fontSize: fontScale(11),
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: spaceScale(8),
    color: '#F8FBFF',
    fontSize: fontScale(26),
    fontWeight: '900',
  },
  subtitle: {
    marginTop: spaceScale(8),
    color: 'rgba(214,235,242,0.76)',
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
    fontWeight: '600',
  },
  heroCard: {
    marginTop: spaceScale(18),
    padding: spaceScale(18),
    borderRadius: radiusScale(24),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.14)',
    flexDirection: 'row',
    gap: spaceScale(14),
  },
  heroBadge: {
    width: spaceScale(40),
    height: spaceScale(40),
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14,143,161,0.88)',
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    color: '#F8FBFF',
    fontSize: fontScale(16),
    fontWeight: '900',
  },
  heroText: {
    marginTop: spaceScale(6),
    color: 'rgba(214,235,242,0.76)',
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
    fontWeight: '600',
  },
  segmentWrap: {
    flexDirection: 'row',
    gap: spaceScale(10),
    marginTop: spaceScale(20),
    marginBottom: spaceScale(18),
    padding: spaceScale(6),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  segmentPill: {
    flex: 1,
    minHeight: spaceScale(42),
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentPillActive: {
    backgroundColor: 'rgba(20,184,166,0.92)',
  },
  segmentText: {
    color: 'rgba(214,235,242,0.68)',
    fontSize: fontScale(13),
    fontWeight: '700',
  },
  segmentTextActive: {
    color: '#F8FBFF',
    fontSize: fontScale(13),
    fontWeight: '800',
  },
  loaderCard: {
    marginTop: spaceScale(12),
    padding: spaceScale(24),
    borderRadius: radiusScale(24),
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: spaceScale(12),
    color: '#6F8794',
    fontSize: fontScale(13),
    fontWeight: '700',
  },
  savedCard: {
    marginBottom: spaceScale(12),
    padding: spaceScale(18),
    borderRadius: radiusScale(24),
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  savedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceScale(10),
  },
  categoryChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spaceScale(12),
    paddingVertical: spaceScale(7),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(14,143,161,0.12)',
  },
  categoryChipText: {
    color: '#0E8FA1',
    fontSize: fontScale(12),
    fontWeight: '900',
  },
  savedMeta: {
    color: '#6F8794',
    fontSize: fontScale(11),
    fontWeight: '800',
  },
  savedQuestion: {
    marginTop: spaceScale(12),
    color: '#163042',
    fontSize: fontScale(15),
    lineHeight: fontScale(22),
    fontWeight: '800',
  },
  optionsBlock: {
    marginTop: spaceScale(12),
    borderRadius: radiusScale(18),
    backgroundColor: '#F4F8FA',
    paddingHorizontal: spaceScale(14),
    paddingVertical: spaceScale(12),
    gap: spaceScale(6),
  },
  optionLine: {
    color: '#416173',
    fontSize: fontScale(13),
    lineHeight: fontScale(19),
    fontWeight: '600',
  },
  answerCard: {
    marginTop: spaceScale(14),
    borderRadius: radiusScale(18),
    paddingHorizontal: spaceScale(14),
    paddingVertical: spaceScale(12),
    backgroundColor: 'rgba(20,184,166,0.08)',
  },
  answerLabel: {
    color: '#0E8FA1',
    fontSize: fontScale(11),
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  answerValue: {
    marginTop: spaceScale(6),
    color: '#163042',
    fontSize: fontScale(14),
    lineHeight: fontScale(20),
    fontWeight: '800',
  },
  savedCardFooter: {
    marginTop: spaceScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceScale(12),
  },
  savedSourceText: {
    flex: 1,
    color: '#6F8794',
    fontSize: fontScale(12),
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  questionDeleteButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: spaceScale(10),
    paddingVertical: spaceScale(6),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(220,38,38,0.10)',
  },
  questionDeleteText: {
    color: '#DC2626',
    fontSize: fontScale(12),
    fontWeight: '800',
  },
  noteButtonTouch: {
    marginBottom: spaceScale(14),
  },
  noteButton: {
    minHeight: spaceScale(50),
    borderRadius: radiusScale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteButtonText: {
    color: '#082032',
    fontSize: fontScale(14),
    fontWeight: '900',
  },
  noteCard: {
    marginBottom: spaceScale(12),
    padding: spaceScale(18),
    borderRadius: radiusScale(24),
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spaceScale(14),
  },
  noteIndexWrap: {
    width: spaceScale(30),
    height: spaceScale(30),
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14,143,161,0.12)',
  },
  noteIndexText: {
    color: '#0E8FA1',
    fontSize: fontScale(12),
    fontWeight: '900',
  },
  noteContent: {
    flex: 1,
  },
  noteText: {
    flex: 1,
    color: '#163042',
    fontSize: fontScale(14),
    lineHeight: fontScale(21),
    fontWeight: '700',
  },
  noteDeleteButton: {
    alignSelf: 'flex-end',
    marginTop: spaceScale(12),
    paddingHorizontal: spaceScale(10),
    paddingVertical: spaceScale(6),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(220,38,38,0.10)',
  },
  noteDeleteText: {
    color: '#DC2626',
    fontSize: fontScale(12),
    fontWeight: '800',
  },
  emptyCard: {
    marginTop: spaceScale(12),
    padding: spaceScale(24),
    borderRadius: radiusScale(26),
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#163042',
    fontSize: fontScale(18),
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: spaceScale(10),
    color: '#6F8794',
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
    textAlign: 'center',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 8, 14, 0.62)',
    justifyContent: 'center',
    paddingHorizontal: spaceScale(18),
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalShell: {
    width: '100%',
  },
  modalCard: {
    borderRadius: radiusScale(28),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: spaceScale(22),
    paddingTop: spaceScale(22),
    paddingBottom: spaceScale(20),
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: fontScale(22),
    fontWeight: '900',
    textAlign: 'center',
  },
  modalSubtitle: {
    marginTop: spaceScale(8),
    color: 'rgba(226,232,240,0.78)',
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
    textAlign: 'center',
  },
  modalInput: {
    minHeight: spaceScale(124),
    marginTop: spaceScale(18),
    borderRadius: radiusScale(20),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: spaceScale(14),
    paddingVertical: spaceScale(14),
    color: '#F8FAFC',
    fontSize: fontScale(14),
    lineHeight: fontScale(21),
    textAlignVertical: 'top',
  },
  characterCount: {
    marginTop: spaceScale(8),
    color: 'rgba(148,163,184,0.88)',
    fontSize: fontScale(11),
    fontWeight: '800',
    textAlign: 'right',
  },
  modalActions: {
    marginTop: spaceScale(18),
    flexDirection: 'row',
    gap: spaceScale(10),
  },
  modalGhostButton: {
    flex: 1,
    minHeight: spaceScale(48),
    borderRadius: radiusScale(18),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  modalGhostText: {
    color: '#E2E8F0',
    fontSize: fontScale(14),
    fontWeight: '800',
  },
  modalSaveTouch: {
    flex: 1,
  },
  modalSaveButton: {
    minHeight: spaceScale(48),
    borderRadius: radiusScale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveText: {
    color: '#082032',
    fontSize: fontScale(14),
    fontWeight: '900',
  },
});

export default BookmarksScreen;
