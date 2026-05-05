import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  FavouriteQuestionInput,
  createFavouriteQuestionKey,
  getWeeklyFavouriteQuestions,
  toggleFavouriteQuestion,
} from '../util/savedContent';
import { showToast } from '../util/toastFeedback';

type UseFavouriteQuestionOptions = {
  getPayload: () => FavouriteQuestionInput | null;
};

export const useFavouriteQuestion = ({ getPayload }: UseFavouriteQuestionOptions) => {
  const [savedKeys, setSavedKeys] = useState<string[]>([]);
  const [isSavingFavourite, setIsSavingFavourite] = useState(false);

  const refreshFavouriteKeys = useCallback(async () => {
    try {
      const items = await getWeeklyFavouriteQuestions();
      setSavedKeys(items.map((item) => item.dedupeKey));
    } catch (error) {
      console.warn('Failed to refresh favourite questions:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshFavouriteKeys();
    }, [refreshFavouriteKeys])
  );

  const currentFavouriteKey = useMemo(() => {
    const payload = getPayload();

    if (!payload?.questionText || !payload?.answerText) {
      return '';
    }

    return createFavouriteQuestionKey(payload);
  }, [getPayload]);

  const handleSaveFavourite = useCallback(async () => {
    const payload = getPayload();

    if (!payload?.questionText || !payload?.answerText) {
      showToast({
        title: 'Nothing to save yet',
        message: 'Open a valid question before adding it to favourites.',
        type: 'info',
      });
      return;
    }

    setIsSavingFavourite(true);

    try {
      const result = await toggleFavouriteQuestion(payload);
      setSavedKeys(result.items.map((item) => item.dedupeKey));

      if (result.status === 'saved') {
        showToast({
          title: 'Question saved',
          message: 'This question is now available in Saved > Questions.',
          type: 'success',
        });
        return;
      }

      if (result.status === 'removed') {
        showToast({
          title: 'Question removed',
          message: 'This question was removed from your weekly favourites.',
          type: 'info',
        });
        return;
      }

      showToast({
        title: 'Weekly limit reached',
        message: 'You can keep up to 10 favourite questions each week.',
        type: 'error',
      });
    } catch (error) {
      console.warn('Failed to save favourite question:', error);
      showToast({
        title: 'Unable to save question',
        message: error instanceof Error ? error.message : 'Please try again.',
        type: 'error',
      });
    } finally {
      setIsSavingFavourite(false);
    }
  }, [getPayload]);

  return {
    isFavourite: Boolean(currentFavouriteKey) && savedKeys.includes(currentFavouriteKey),
    isSavingFavourite,
    handleSaveFavourite,
    refreshFavouriteKeys,
  };
};
