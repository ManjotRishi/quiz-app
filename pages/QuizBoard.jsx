import React from 'react';
import { View, StyleSheet } from 'react-native';
import QuizLoader from '../animation/QuizLoader';
import QuizBoardContent from '../components/quizboard/QuizBoardContent';
import QuizBoardEmptyState from '../components/quizboard/QuizBoardEmptyState';
import NetworkIssueOverlay from '../components/NetworkIssueOverlay';
import { useQuizBoard } from '../hooks/useQuizBoard';
import { GKCOLLECTION } from '../util/constants';

const QuizBoard = ({ navigation }) => {
  const quizBoard = useQuizBoard({
    navigation,
    collectionName: GKCOLLECTION,
    quizType: 'gk',
    quizLabel: 'GK',
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
      : 'The quiz is taking too long to load. Please try again.';

    return (
      <View style={styles.loadingShell}>
        <NetworkIssueOverlay
          visible
          title="Unable to load quiz"
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
      welcomeTitle="Welcome to GK Quiz"
      showEnglishPill={false}
      compactControls
      isLastQuestion={quizBoard.isLastQuestion}
      handleNext={quizBoard.handleNext}
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

export default QuizBoard;
