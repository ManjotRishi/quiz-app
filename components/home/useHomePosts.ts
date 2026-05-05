import { useEffect, useState } from 'react';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { POST_COLLECTION } from '../../util/constants';
import { mapDocToSpotlightPost, sortSpotlightPosts } from './homeUtils';
import { SpotlightPost } from './homeTypes';

const HOME_POST_LIMIT = 10;

export const useHomePosts = () => {
  const [homePosts, setHomePosts] = useState<SpotlightPost[]>([]);
  const [isHomePostsLoading, setIsHomePostsLoading] = useState(true);
  const [selectedHomePost, setSelectedHomePost] = useState<SpotlightPost | null>(null);

  useEffect(() => {
    const applySnapshot = (
      snapshot: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>
    ) => {
      const nextPosts = sortSpotlightPosts(
        snapshot.docs
          .map((doc) => mapDocToSpotlightPost(doc))
          .filter((post): post is SpotlightPost => Boolean(post))
      ).slice(0, HOME_POST_LIMIT);

      setHomePosts(nextPosts);
      setIsHomePostsLoading(false);
    };

    const fallbackQuery = () =>
      firestore()
        .collection(POST_COLLECTION)
        .orderBy('likeCount', 'desc')
        .limit(HOME_POST_LIMIT * 3)
        .onSnapshot(
          (snapshot) => {
            applySnapshot(snapshot);
          },
          (error) => {
            console.warn('Failed to load fallback home posts:', error);
            setHomePosts([]);
            setIsHomePostsLoading(false);
          }
        );

    let fallbackUnsubscribe: (() => void) | null = null;

    const unsubscribe = firestore()
      .collection(POST_COLLECTION)
      .orderBy('likeCount', 'desc')
      .orderBy('createdAt', 'desc')
      .limit(HOME_POST_LIMIT)
      .onSnapshot(
        (snapshot) => {
          applySnapshot(snapshot);
        },
        (error) => {
          console.warn('Failed to load ranked home posts, switching to fallback query:', error);
          fallbackUnsubscribe = fallbackQuery();
        }
      );

    return () => {
      unsubscribe();
      fallbackUnsubscribe?.();
    };
  }, []);

  return {
    homePosts,
    isHomePostsLoading,
    selectedHomePost,
    openSpotlightModal: (post: SpotlightPost) => {
      setSelectedHomePost(post);
    },
    closeSpotlightModal: () => {
      setSelectedHomePost(null);
    },
    clearSelectedHomePost: () => {
      setSelectedHomePost(null);
    },
  };
};
