import React from 'react';
import { StyleSheet, View } from 'react-native';
import QuizLoader from '../animation/QuizLoader';
import QuizBoardContent from '../components/quizboard/QuizBoardContent';
import QuizBoardEmptyState from '../components/quizboard/QuizBoardEmptyState';
import NetworkIssueOverlay from '../components/NetworkIssueOverlay';
import { useQuizBoard } from '../hooks/useQuizBoard';
import { MATH_QUIZZ } from '../util/constants';

const MathQuizz = ({ navigation }) => {
  const quizBoard = useQuizBoard({
    navigation,
    collectionName: MATH_QUIZZ,
    quizType: 'math',
    quizLabel: 'Math Quiz',
  });

  if (quizBoard.quizLoading) {
    return <QuizLoader isLoading />;
  }

  if (quizBoard.quizError) {
    const isOffline = String(quizBoard.quizError?.message ?? '')
      .toLowerCase()
      .includes('no internet connection');
    const message = isOffline
      ? 'You are offline right now. Please reconnect to continue.'
      : 'The math quiz is taking too long to load. Please try again.';

    return (
      <View style={styles.loadingShell}>
        <NetworkIssueOverlay
          visible
          title="Unable to load math quiz"
          message={message}
          actionLabel="Try Again"
          onRetry={quizBoard.requestRetry}
        />
      </View>
    );
  }

  if (!quizBoard.totalQuestions) {
    return <QuizBoardEmptyState selectedLanguage={quizBoard.selectedLanguage} />;
  }

  return (
    <QuizBoardContent
      navigation={navigation}
      welcomeTitle="Welcome to Math Quiz"
      showEnglishPill={false}
      showBanner
      compactControls
      isLastQuestion={quizBoard.isLastQuestion}
      handleNext={quizBoard.handleNext}
      handlePrevious={quizBoard.handlePrevious}
      {...quizBoard}
    />
  );
};

const styles = StyleSheet.create({
  loadingShell: {
    flex: 1,
    backgroundColor: '#04020A',
  },
});

export default MathQuizz;
