import { useCallback, useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import { LISTINGDOC } from '../util/constants';

type ReadingContent = {
  badge: string;
  titleByLanguage: {
    English: string;
    Hindi: string;
  };
  subtitle: string;
  textByLanguage: {
    English: string;
    Hindi: string;
  };
};

type UseReadingContentOptions = {
  collectionName: string;
  fallbackContent: ReadingContent;
  title: string;
  bodyField: 'story' | 'poem';
  subtitle: string;
  badge: string;
};

export const useReadingContent = ({
  collectionName,
  fallbackContent,
  title,
  bodyField,
  subtitle,
  badge,
}: UseReadingContentOptions) => {
  const [content, setContent] = useState<ReadingContent>(fallbackContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const docSnap = await firestore().collection(collectionName).doc(LISTINGDOC).get();

      if (!docSnap?.exists) {
        setContent(fallbackContent);
        return;
      }

      const data = docSnap.data?.() ?? {};
      const liveContent = data?.content ?? {};
      const english = liveContent?.English ?? {};
      const hindi = liveContent?.Hindi ?? {};
      const englishText = typeof english?.[bodyField] === 'string' ? english[bodyField].trim() : '';
      const hindiText = typeof hindi?.[bodyField] === 'string' ? hindi[bodyField].trim() : '';

      if (!englishText || !hindiText) {
        setContent(fallbackContent);
        return;
      }

      setContent({
        badge,
        titleByLanguage: {
          English:
            typeof english?.title === 'string' && english.title.trim()
              ? english.title.trim()
              : fallbackContent.titleByLanguage.English,
          Hindi:
            typeof hindi?.title === 'string' && hindi.title.trim()
              ? hindi.title.trim()
              : fallbackContent.titleByLanguage.Hindi,
        },
        subtitle,
        textByLanguage: {
          English: englishText,
          Hindi: hindiText,
        },
      });
    } catch (loadError) {
      console.error(`Failed to load ${title}:`, loadError);
      setError(loadError instanceof Error ? loadError : new Error(`Unable to load ${title}`));
      setContent(fallbackContent);
    } finally {
      setLoading(false);
    }
  }, [badge, bodyField, collectionName, fallbackContent, subtitle, title]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return {
    content,
    loading,
    error,
    reload: loadContent,
  };
};
