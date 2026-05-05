import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReadingScreen from '../components/reading/ReadingScreen';
import ReadingErrorState from '../components/reading/ReadingErrorState';
import { RootStackParamList } from '../navigation/types';
import { STORY_CONTENT } from '../util/readingContent';
import { KIDS_STORY } from '../util/constants';
import { useReadingContent } from '../hooks/useReadingContent';
import QuizLoader from '../animation/QuizLoader';

type Props = NativeStackScreenProps<RootStackParamList, 'StoryScreen'>;

const StoryScreen = ({ navigation }: Props) => {
  const { content, loading, error, reload } = useReadingContent({
    collectionName: KIDS_STORY,
    fallbackContent: STORY_CONTENT,
    title: 'Story',
    bodyField: 'story',
    subtitle: 'Listen and follow the words as they light up on the screen.',
    badge: 'Story Time',
  });

  if (loading) {
    return <QuizLoader isLoading />;
  }

  if (error) {
    return (
      <ReadingErrorState
        navigation={navigation}
        title="Unable to load story"
        message="We could not load the latest story right now. Please try again."
        onRetry={reload}
      />
    );
  }

  return (
    <ReadingScreen
      navigation={navigation}
      content={content}
      entryRewardPlacement="child_story_entry_reward"
    />
  );
};

export default StoryScreen;
