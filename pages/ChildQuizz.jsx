import React from 'react';
import { StyleSheet, View } from 'react-native';
import QuizLoader from '../animation/QuizLoader';
import NetworkIssueOverlay from '../components/NetworkIssueOverlay';
import QuizBoardEmptyState from '../components/quizboard/QuizBoardEmptyState';
import ChildQuizz from '../components/childquiz/ChildQuizz';
import { useQuizBoard } from '../hooks/useQuizBoard';
import { CHILDQUIZZCOLLECTION } from '../util/constants';

const ChildQuizzPage = ({ navigation }) => {
  const quizBoard = useQuizBoard({
    navigation,
    collectionName: CHILDQUIZZCOLLECTION,
    quizType: 'child',
    quizLabel: 'Child Quizz',
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
      : 'The child quiz is taking too long to load. Please try again.';

    return (
      <View style={styles.loadingShell}>
        <NetworkIssueOverlay
          visible
          title="Unable to load child quiz"
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

  return <ChildQuizz navigation={navigation} {...quizBoard} />;
};

const styles = StyleSheet.create({
  loadingShell: {
    flex: 1,
    backgroundColor: '#11081F',
  },
});

export default ChildQuizzPage;
