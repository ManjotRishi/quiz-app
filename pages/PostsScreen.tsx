import React, { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AppBannerAd from '../components/AppBannerAd';
import ExpandablePostText from '../components/posts/ExpandablePostText';
import PostInfoModal from '../components/posts/PostInfoModal';
import PostCardWaves from '../components/posts/PostCardWaves';
import PostReactionBar, { UserReaction } from '../components/posts/PostReactionBar';
import {
  CloseIcon,
  GlobeIcon,
  PlusIcon,
  TrashIcon,
  VerifiedBadgeIcon,
} from '../components/icons/AppShellIcons';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../style/colors';
import { fontScale, radiusScale, spaceScale } from '../style/responsive';
import { POST_COLLECTION } from '../util/constants';
import { getDeviceScopeKey } from '../util/deviceIdentity';
import {
  PostReactionValue,
  updatePostReactionWithBackend,
} from '../util/postsApi';
import { useAdManager } from '../hooks/useAdManager';
import { getMainTabBarMetrics } from '../util/tabBarLayout';
import {
  hasSeenPostInfoModalInSession,
  markPostInfoModalShownInSession,
} from '../util/postInfoSession';
import { readStoredOwnedPosts, StoredOwnedPostMap, writeStoredOwnedPost } from '../util/postOwnershipStorage';
import { showToast } from '../util/toastFeedback';

type PostItem = {
  id: string;
  authorName: string;
  authorId: string;
  title: string;
  body: string;
  createdAtLabel: string;
  createdAtMs: number;
  likeCount: number;
  dislikeCount: number;
  reaction: UserReaction;
};

type PendingDeletePost = {
  id: string;
  preview: string;
};

const MAX_POST_LENGTH = 360;
const REACTION_DEBOUNCE_MS = 450;
const LOADING_POST_SKELETON_COUNT = 3;
const LEGACY_POST_OWNERSHIP_GRACE_MS = 30 * 60 * 1000;
const DAILY_POST_LIMIT_MESSAGE = 'You can publish only one post per day. Please try again tomorrow.';

const buildPostsQuery = () =>
  firestore().collection(POST_COLLECTION).orderBy('createdAt', 'desc').limit(40);

const getLocalDayWindow = (date = new Date()) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  const nextDayStart = new Date(dayStart);
  nextDayStart.setDate(nextDayStart.getDate() + 1);

  return {
    dayStart,
    nextDayStart,
  };
};

const isTimestampWithinToday = (createdAtMs: number, dayStartMs: number, nextDayStartMs: number) =>
  createdAtMs >= dayStartMs && createdAtMs < nextDayStartMs;

const normalizeAuthorIdentity = (value: string) => value.trim().toLowerCase();

const canDeletePost = (
  post: Pick<PostItem, 'id' | 'authorId' | 'authorName' | 'createdAtMs'>,
  actorId: string,
  displayName: string,
  ownedPostIds: StoredOwnedPostMap
) => {
  if (post.authorId && actorId && post.authorId === actorId) {
    return true;
  }

  if (ownedPostIds[post.id]) {
    return true;
  }

  const isRecentLegacyPost =
    !post.authorId &&
    Boolean(post.createdAtMs) &&
    Date.now() - post.createdAtMs <= LEGACY_POST_OWNERSHIP_GRACE_MS;

  return Boolean(
    isRecentLegacyPost &&
      normalizeAuthorIdentity(post.authorName) &&
      normalizeAuthorIdentity(post.authorName) === normalizeAuthorIdentity(displayName)
  );
};

const formatPostDate = (createdAtMs: number) => {
  if (!createdAtMs) {
    return 'Just now';
  }

  const date = new Date(createdAtMs);
  const relativeMinutes = Math.max(0, Math.floor((Date.now() - createdAtMs) / 60000));
  const relativeLabel =
    relativeMinutes < 1
      ? 'Just now'
      : relativeMinutes < 60
        ? `${relativeMinutes}m ago`
        : relativeMinutes < 1440
          ? `${Math.floor(relativeMinutes / 60)}h ago`
          : `${Math.floor(relativeMinutes / 1440)}d ago`;

  const dateLabel = date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${relativeLabel} • ${dateLabel}`;
};

const buildFallbackTitle = (body: string) =>
  body
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .slice(0, 6)
    .join(' ')
    .trim();

const buildAvatarInitials = (authorName: string) => {
  const words = authorName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!words.length) {
    return 'L';
  }

  return words.map((word) => word[0]?.toUpperCase() ?? '').join('');
};

const normalizeReactionCount = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const normalizeApiReaction = (value: unknown): PostReactionValue =>
  value === 'like' || value === 'dislike' ? value : null;

const apiReactionToUserReaction = (reaction: PostReactionValue): UserReaction =>
  reaction === 'like' ? 'liked' : null;

const userReactionToApiReaction = (reaction: UserReaction): PostReactionValue =>
  reaction === 'liked' ? 'like' : null;

const countSnapshotReactions = (
  reactions: unknown
): { likeCount: number; dislikeCount: number } | null => {
  if (!reactions || typeof reactions !== 'object') {
    return null;
  }

  return Object.values(reactions as Record<string, unknown>).reduce<{
    likeCount: number;
    dislikeCount: number;
  }>(
    (result, reactionValue) => {
      const normalizedReaction = normalizeApiReaction(reactionValue);

      if (normalizedReaction === 'like') {
        result.likeCount += 1;
      } else if (normalizedReaction === 'dislike') {
        result.dislikeCount += 1;
      }

      return result;
    },
    {
      likeCount: 0,
      dislikeCount: 0,
    }
  );
};

const readViewerReaction = (
  reactions: unknown,
  actorId: string
): UserReaction => {
  if (!reactions || typeof reactions !== 'object') {
    return null;
  }

  return apiReactionToUserReaction(
    normalizeApiReaction((reactions as Record<string, unknown>)[actorId])
  );
};

const applyReactionDelta = ({
  likeCount,
  currentReaction,
  nextReaction,
}: {
  likeCount: number;
  currentReaction: UserReaction;
  nextReaction: UserReaction;
}) => ({
  likeCount: Math.max(
    0,
    likeCount - (currentReaction === 'liked' ? 1 : 0) + (nextReaction === 'liked' ? 1 : 0)
  ),
});

type ReactionOverrideMap = Record<string, UserReaction | undefined>;

const mergeReactionOverrides = (
  posts: PostItem[],
  overrides: ReactionOverrideMap
) =>
  posts.map((post) => {
    if (!Object.prototype.hasOwnProperty.call(overrides, post.id)) {
      return post;
    }

    const nextReaction = overrides[post.id];

    if (typeof nextReaction === 'undefined') {
      return post;
    }

    const nextCounts = applyReactionDelta({
      likeCount: post.likeCount,
      currentReaction: post.reaction,
      nextReaction,
    });

    return {
      ...post,
      likeCount: nextCounts.likeCount,
      reaction: nextReaction,
    };
  });

const pruneSyncedReactionOverrides = (posts: PostItem[], overrides: ReactionOverrideMap) => {
  if (!Object.keys(overrides).length) {
    return overrides;
  }

  let didChange = false;
  const nextOverrides = { ...overrides };

  posts.forEach((post) => {
    if (
      Object.prototype.hasOwnProperty.call(nextOverrides, post.id) &&
      nextOverrides[post.id] === post.reaction
    ) {
      delete nextOverrides[post.id];
      didChange = true;
    }
  });

  return didChange ? nextOverrides : overrides;
};

const mapSnapshotToPosts = (
  snapshot: FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>,
  fallbackAuthorName: string,
  actorId: string
): PostItem[] =>
  snapshot.docs
    .map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>) => {
      const data = doc.data() ?? {};
      const body = typeof data.body === 'string' ? data.body.trim() : '';
      const title =
        typeof data.title === 'string' && data.title.trim()
          ? data.title.trim()
          : buildFallbackTitle(body) || 'Helpful Post';
      const authorName =
        typeof data.authorName === 'string' && data.authorName.trim()
          ? data.authorName.trim()
          : fallbackAuthorName;
      const authorId = typeof data.authorId === 'string' ? data.authorId.trim() : '';
      const createdAtMs = typeof data.createdAt?.toMillis === 'function' ? data.createdAt.toMillis() : 0;

      if (!body) {
        return null;
      }

      const reactionCountsFromMap = countSnapshotReactions(data.reactions);

      return {
        id: doc.id,
        authorName,
        authorId,
        title,
        body,
        createdAtLabel: formatPostDate(createdAtMs),
        createdAtMs,
        likeCount:
          reactionCountsFromMap?.likeCount ?? normalizeReactionCount(data.likeCount),
        dislikeCount:
          reactionCountsFromMap?.dislikeCount ?? normalizeReactionCount(data.dislikeCount),
        reaction: readViewerReaction(data.reactions, actorId),
      };
    })
    .filter((item: PostItem | null): item is PostItem => Boolean(item))
    .sort((left: PostItem, right: PostItem) => right.createdAtMs - left.createdAtMs);

const PostsFeedLoadingState = () => {
  const shimmerProgress = useRef(new Animated.Value(0)).current;
  const floatProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerProgress, {
        toValue: 1,
        duration: 1700,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatProgress, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatProgress, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    shimmerLoop.start();
    floatLoop.start();

    return () => {
      shimmerLoop.stop();
      floatLoop.stop();
    };
  }, [floatProgress, shimmerProgress]);

  const shimmerTranslateX = shimmerProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-220, 420],
  });

  const heroTranslateY = floatProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -6],
  });

  return (
    <View style={styles.loadingStage}>
      <Animated.View
        style={[
          styles.loadingHeroCard,
          {
            transform: [{ translateY: heroTranslateY }],
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(7,18,28,0.96)', 'rgba(11,31,44,0.96)', 'rgba(18,49,66,0.96)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.loadingHeroGradient}
        >
          <View style={styles.loadingHeroBadge}>
            <View style={styles.loadingHeroDot} />
            <Text style={styles.loadingHeroBadgeText}>Fetching fresh posts</Text>
          </View>
          <Text style={styles.loadingHeroTitle}>Warming up the feed</Text>
          <Text style={styles.loadingHeroText}>
            Pulling in thoughtful posts, reactions, and the latest updates for the community.
          </Text>
          <View style={styles.loadingHeroPulseRow}>
            <View style={styles.loadingHeroPulse} />
            <View style={[styles.loadingHeroPulse, styles.loadingHeroPulseMid]} />
            <View style={styles.loadingHeroPulse} />
          </View>
        </LinearGradient>
      </Animated.View>

      {Array.from({ length: LOADING_POST_SKELETON_COUNT }).map((_, index) => (
        <View key={`loading-post-${index}`} style={styles.loadingPostCardShell}>
          <LinearGradient
            colors={['rgba(6,18,28,0.98)', 'rgba(9,22,34,0.98)', 'rgba(12,28,41,0.98)']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.loadingPostCard}
          >
            <View style={styles.loadingCardGlowLeft} pointerEvents="none" />
            <View style={styles.loadingCardGlowBottom} pointerEvents="none" />

            <View style={styles.loadingTopRow}>
              <View style={styles.loadingProfileRow}>
                <View style={styles.loadingAvatar} />
                <View style={styles.loadingMetaStack}>
                  <View style={[styles.loadingLine, styles.loadingNameLine]} />
                  <View style={[styles.loadingLine, styles.loadingMetaLine]} />
                </View>
              </View>
              <View style={styles.loadingActionPill} />
            </View>

            <View style={[styles.loadingLine, styles.loadingTitleLine]} />
            <View style={[styles.loadingLine, styles.loadingBodyLineLong]} />
            <View style={[styles.loadingLine, styles.loadingBodyLineMedium]} />
            <View style={[styles.loadingLine, styles.loadingBodyLineShort]} />

            <View style={styles.loadingReactionRow}>
              <View style={[styles.loadingReactionChip, styles.loadingReactionChipWide]} />
              <View style={styles.loadingReactionChip} />
              <View style={styles.loadingReactionChip} />
            </View>

            <Animated.View
              pointerEvents="none"
              style={[
                styles.loadingShimmer,
                {
                  transform: [{ translateX: shimmerTranslateX }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(125,211,252,0.18)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.loadingShimmerGradient}
              />
            </Animated.View>
          </LinearGradient>
        </View>
      ))}
    </View>
  );
};

const PostsScreen = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const learnerName = useAppStore((state) => state.learnerName);
  const preferredLanguage = useAppStore((state) => state.preferredLanguage);
  const displayName = learnerName.trim() || 'Learner';
  const tabMetrics = getMainTabBarMetrics(width, insets.bottom);
  const { preloadRewarded, showRewarded } = useAdManager();
  const actorIdRef = useRef(getDeviceScopeKey());
  const reactionDebounceTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const reactionInFlightRef = useRef<Record<string, true>>({});
  const reactionDesiredStateRef = useRef<Record<string, UserReaction>>({});
  const [serverPosts, setServerPosts] = useState<PostItem[]>([]);
  const [reactionOverrides, setReactionOverrides] = useState<ReactionOverrideMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [isComposerVisible, setIsComposerVisible] = useState(false);
  const [isPostInfoVisible, setIsPostInfoVisible] = useState(false);
  const [draft, setDraft] = useState('');
  const [composerError, setComposerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [pendingDeletePost, setPendingDeletePost] = useState<PendingDeletePost | null>(null);
  const [ownedPostIds, setOwnedPostIds] = useState<StoredOwnedPostMap>(() =>
    readStoredOwnedPosts(actorIdRef.current)
  );
  const posts = mergeReactionOverrides(serverPosts, reactionOverrides);

  useEffect(
    () => () => {
      Object.values(reactionDebounceTimersRef.current).forEach((timerId) => clearTimeout(timerId));
    },
    []
  );

  useEffect(() => {
    preloadRewarded();
  }, [preloadRewarded]);

  useFocusEffect(
    useCallback(() => {
      if (hasSeenPostInfoModalInSession()) {
        return undefined;
      }

      markPostInfoModalShownInSession();
      setIsPostInfoVisible(true);

      return undefined;
    }, [])
  );

  useEffect(() => {
    const unsubscribe = buildPostsQuery().onSnapshot(
      (snapshot) => {
        const nextPosts = mapSnapshotToPosts(snapshot, displayName, actorIdRef.current);

        startTransition(() => {
          setServerPosts(nextPosts);
        });
        setReactionOverrides((currentOverrides) =>
          pruneSyncedReactionOverrides(nextPosts, currentOverrides)
        );

        setLoadError('');
        setIsLoading(false);
        setIsRefreshing(false);
      },
      (error) => {
        console.warn('Failed to load posts:', error);
        setLoadError('Unable to load posts right now. Pull to refresh and try again.');
        setIsLoading(false);
        setIsRefreshing(false);
      }
    );

    return unsubscribe;
  }, [displayName]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      const snapshot = await buildPostsQuery().get();
      const nextPosts = mapSnapshotToPosts(snapshot, displayName, actorIdRef.current);

      startTransition(() => {
        setServerPosts(nextPosts);
      });
      setReactionOverrides((currentOverrides) =>
        pruneSyncedReactionOverrides(nextPosts, currentOverrides)
      );

      setLoadError('');
    } catch (error) {
      console.warn('Failed to refresh posts:', error);
      setLoadError('Unable to refresh posts right now. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenComposer = () => {
    setComposerError('');
    setIsComposerVisible(true);
  };

  const handleClosePostInfoModal = () => {
    setIsPostInfoVisible(false);
  };

  const handleCloseComposer = () => {
    if (isSubmitting) {
      return;
    }

    setIsComposerVisible(false);
    setComposerError('');
  };

  const handleSubmitPost = async () => {
    const trimmedDraft = draft.trim();
    const authorName = learnerName.trim() || 'Learner';
    const { dayStart, nextDayStart } = getLocalDayWindow();
    const dayStartMs = dayStart.getTime();
    const nextDayStartMs = nextDayStart.getTime();

    console.log('[PostsScreen] Submit requested', {
      draftLength: trimmedDraft.length,
      authorName,
      isSubmitting,
    });

    if (!trimmedDraft) {
      setComposerError('Write something positive, useful, or educational before posting.');
      return;
    }

    setIsSubmitting(true);
    setComposerError('');

    try {
      if (!actorIdRef.current) {
        throw new Error('Unable to identify your device right now. Please try again.');
      }

      const alreadyPostedTodayInFeed = posts.some(
        (post) =>
          post.authorId === actorIdRef.current &&
          isTimestampWithinToday(post.createdAtMs, dayStartMs, nextDayStartMs)
      );

      if (alreadyPostedTodayInFeed) {
        setComposerError(DAILY_POST_LIMIT_MESSAGE);
        return;
      }

      const existingPostSnapshot = await firestore()
        .collection(POST_COLLECTION)
        .where('authorId', '==', actorIdRef.current)
        .get();

      const alreadyPostedTodayInFirestore = existingPostSnapshot.docs.some((doc) => {
        const createdAtMs = typeof doc.data()?.createdAt?.toMillis === 'function'
          ? doc.data().createdAt.toMillis()
          : 0;

        return isTimestampWithinToday(createdAtMs, dayStartMs, nextDayStartMs);
      });

      if (alreadyPostedTodayInFirestore) {
        setComposerError(DAILY_POST_LIMIT_MESSAGE);
        return;
      }

      console.log('[PostsScreen] Publishing post directly to Firestore');
      const postRef = await firestore().collection(POST_COLLECTION).add({
        body: trimmedDraft,
        authorName,
        authorId: actorIdRef.current,
        likeCount: 0,
        dislikeCount: 0,
        reactions: {},
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      console.log('[PostsScreen] Post published', { postId: postRef.id });

      writeStoredOwnedPost(actorIdRef.current, postRef.id, true);
      setOwnedPostIds((currentOwnedPosts) => ({
        ...currentOwnedPosts,
        [postRef.id]: true,
      }));

      setDraft('');
      setIsComposerVisible(false);
      showToast({
        title: 'Post published',
        message: 'Your post is now live in the feed.',
        type: 'success',
      });

      const rewardPlacement = `post_publish_reward_${postRef.id}`;
      const didStartReward = showRewarded({
        placement: rewardPlacement,
        attemptedQuestions: 1,
        force: true,
        onClosed: ({ rewardEarned } = {}) => {
          if (!rewardEarned) {
            showToast({
              title: 'Reward ad closed',
              message: 'You can publish again anytime to trigger another reward.',
              type: 'info',
            });
          }
        },
      });

      if (!didStartReward) {
        preloadRewarded();
      }
    } catch (error) {
      console.warn('Failed to submit post:', error);
      console.log('[PostsScreen] Submit failed', {
        error: error instanceof Error ? error.message : error,
      });
      setComposerError(
        error instanceof Error
          ? error.message
          : 'Unable to publish your post right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const postToDelete = posts.find((post) => post.id === postId);

      if (!postToDelete || !canDeletePost(postToDelete, actorIdRef.current, displayName, ownedPostIds)) {
        showToast({
          title: 'Delete not allowed',
          message: 'Only the person who created this post can delete it.',
          type: 'error',
        });
        return;
      }

      setDeletingPostId(postId);
      await firestore().collection(POST_COLLECTION).doc(postId).delete();
      writeStoredOwnedPost(actorIdRef.current, postId, false);
      setOwnedPostIds((currentOwnedPosts) => {
        if (!currentOwnedPosts[postId]) {
          return currentOwnedPosts;
        }

        const nextOwnedPosts = { ...currentOwnedPosts };
        delete nextOwnedPosts[postId];
        return nextOwnedPosts;
      });
      setPendingDeletePost(null);
      showToast({
        title: 'Post deleted',
        message: 'The post was removed from the feed.',
        type: 'info',
      });
    } catch (error) {
      console.warn('Failed to delete post:', error);
      showToast({
        title: 'Unable to delete post',
        message: error instanceof Error ? error.message : 'Please try again.',
        type: 'error',
      });
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleRequestDeletePost = (post: PostItem) => {
    if (deletingPostId || !canDeletePost(post, actorIdRef.current, displayName, ownedPostIds)) {
      if (!canDeletePost(post, actorIdRef.current, displayName, ownedPostIds)) {
        showToast({
          title: 'Delete not allowed',
          message: 'Only the person who created this post can delete it.',
          type: 'error',
        });
      }
      return;
    }

    setPendingDeletePost({
      id: post.id,
      preview: buildFallbackTitle(post.body) || 'this post',
    });
  };

  const handleCloseDeleteModal = () => {
    if (deletingPostId) {
      return;
    }

    setPendingDeletePost(null);
  };

  const rollbackReactionOverride = (postId: string) => {
    delete reactionDesiredStateRef.current[postId];
    setReactionOverrides((currentOverrides) => {
      if (!Object.prototype.hasOwnProperty.call(currentOverrides, postId)) {
        return currentOverrides;
      }

      const nextOverrides = { ...currentOverrides };
      delete nextOverrides[postId];
      return nextOverrides;
    });
  };

  const flushReactionSync = async (postId: string) => {
    const desiredReaction = reactionDesiredStateRef.current[postId];

    if (reactionInFlightRef.current[postId] || typeof desiredReaction === 'undefined') {
      return;
    }

    reactionInFlightRef.current[postId] = true;

    try {
      console.log('[PostsScreen] Syncing reaction update', {
        postId,
        reaction: desiredReaction,
      });

      const reactionResult = await updatePostReactionWithBackend({
        postId,
        reaction: userReactionToApiReaction(desiredReaction),
        actorId: actorIdRef.current,
      });

      console.log('[PostsScreen] Reaction result', reactionResult);

      if (!reactionResult.success) {
        throw new Error(reactionResult.content);
      }

      setServerPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likeCount: reactionResult.likeCount,
                dislikeCount: reactionResult.dislikeCount,
                reaction: apiReactionToUserReaction(reactionResult.viewerReaction),
              }
            : post
        )
      );

      if (reactionDesiredStateRef.current[postId] === apiReactionToUserReaction(reactionResult.viewerReaction)) {
        rollbackReactionOverride(postId);
      }
    } catch (error) {
      console.warn('Failed to update post reaction:', error);
      if (reactionDesiredStateRef.current[postId] === desiredReaction) {
        rollbackReactionOverride(postId);
        showToast({
          title: 'Unable to update reaction',
          message: error instanceof Error ? error.message : 'Please try again.',
          type: 'error',
        });
      }
    } finally {
      delete reactionInFlightRef.current[postId];

      if (reactionDesiredStateRef.current[postId] !== desiredReaction) {
        void flushReactionSync(postId);
      }
    }
  };

  const scheduleReactionSync = (postId: string) => {
    const existingTimer = reactionDebounceTimersRef.current[postId];

    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    reactionDebounceTimersRef.current[postId] = setTimeout(() => {
      delete reactionDebounceTimersRef.current[postId];
      void flushReactionSync(postId);
    }, REACTION_DEBOUNCE_MS);
  };

  const handleReaction = (postId: string) => {
    const currentPost = posts.find((post) => post.id === postId);

    if (!currentPost) {
      return;
    }

    const nextReaction: UserReaction = currentPost.reaction === 'liked' ? null : 'liked';

    reactionDesiredStateRef.current[postId] = nextReaction;
    setReactionOverrides((currentOverrides) => ({
      ...currentOverrides,
      [postId]: nextReaction,
    }));
    scheduleReactionSync(postId);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#061722', '#0C2331', '#123247']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: tabMetrics.contentBottomInset,
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#E2F6FF"
              colors={['#14B8A6', '#38BDF8']}
            />
          }
          ListHeaderComponent={
            <>
              <AppBannerAd
                placement="posts-feed-top"
                minHeight={spaceScale(64)}
                horizontalInset={spaceScale(18)}
                containerStyle={styles.bannerWrap}
              />

              <LinearGradient
                colors={['rgba(7,18,28,0.95)', 'rgba(13,36,51,0.95)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.feedNoteCard}
              >
                <View style={styles.feedNoteBadge}>
                  <Text style={styles.feedNoteBadgeText}>Feed Note</Text>
                </View>
                <Text style={styles.feedNoteTitle}>Share one useful thought today</Text>
                <Text style={styles.feedNoteText}>
                  {displayName}, keep it short, positive, and meaningful so the feed stays helpful for everyone.
                </Text>
              </LinearGradient>

              {loadError ? (
                <View style={styles.errorCard}>
                  <Text style={styles.errorTitle}>Unable to load feed</Text>
                  <Text style={styles.errorText}>{loadError}</Text>
                </View>
              ) : null}
            </>
          }
          ListEmptyComponent={
            isLoading ? (
              <PostsFeedLoadingState />
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No posts yet</Text>
                <Text style={styles.emptyText}>Tap the plus button to add the first post.</Text>
              </View>
            )
          }
          renderItem={({ item }) => {
            const isDeleting = deletingPostId === item.id;
            const canDelete = canDeletePost(item, actorIdRef.current, displayName, ownedPostIds);
            const avatarInitials = buildAvatarInitials(item.authorName);

            return (
              <View style={styles.postCardShell}>
                <LinearGradient
                  colors={['rgba(6, 18, 28, 0.98)', 'rgba(9, 22, 34, 0.98)', 'rgba(12, 28, 41, 0.98)']}
                  end={{ x: 1, y: 1 }}
                  start={{ x: 0, y: 0 }}
                  style={styles.postCard}
                >
                  <View style={styles.cardGlowLeft} pointerEvents="none" />
                  <View style={styles.cardGlowBottom} pointerEvents="none" />
                  <View style={styles.waveWrap} pointerEvents="none">
                    <PostCardWaves />
                  </View>

                  <View style={styles.cardTopRow}>
                    <View style={styles.profileCluster}>
                      <View style={styles.avatarShell}>
                        <LinearGradient
                          colors={['#0F766E', '#0EA5E9', '#FB923C']}
                          end={{ x: 1, y: 1 }}
                          start={{ x: 0, y: 0 }}
                          style={styles.avatarGradient}
                        >
                          <Text style={styles.avatarInitials}>{avatarInitials}</Text>
                        </LinearGradient>
                        <View style={styles.avatarPresenceDot} />
                      </View>

                      <View style={styles.metaBlock}>
                        <View style={styles.authorPrimaryRow}>
                          <Text numberOfLines={1} style={styles.authorName}>{item.authorName}</Text>
                          <VerifiedBadgeIcon color="#38BDF8" size={17} />
                        </View>

                        <View style={styles.authorMetaRow}>
                          <Text numberOfLines={1} style={styles.postDate}>{item.createdAtLabel}</Text>
                          <View style={styles.metaDot} />
                          <GlobeIcon color="#8B86A8" size={14} />
                        </View>
                      </View>
                    </View>

                    {canDelete ? (
                      <TouchableOpacity
                        activeOpacity={0.88}
                        disabled={isDeleting}
                        onPress={() => handleRequestDeletePost(item)}
                        style={styles.deleteButton}
                      >
                        {isDeleting ? (
                          <ActivityIndicator color="#FB7185" size="small" />
                        ) : (
                          <TrashIcon color="#FB923C" size={20} />
                        )}
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <ExpandablePostText
                    collapsedLines={2}
                    text={item.body}
                    textStyle={styles.postBody}
                    toggleStyle={styles.viewMoreText}
                  />

                  <PostReactionBar
                    likeCount={item.likeCount}
                    onPress={() => handleReaction(item.id)}
                    reaction={item.reaction}
                  />

                  <LinearGradient
                    colors={['rgba(20,184,166,0)', 'rgba(56,189,248,0.92)', 'rgba(251,146,60,0.8)', 'rgba(20,184,166,0)']}
                    end={{ x: 1, y: 0.5 }}
                    start={{ x: 0, y: 0.5 }}
                    style={styles.bottomAccent}
                  />
                </LinearGradient>
              </View>
            );
          }}
        />

        <TouchableOpacity
          activeOpacity={0.92}
          style={[
            styles.fabTouch,
            {
              right: tabMetrics.horizontalInset + spaceScale(8),
              bottom: tabMetrics.fabBottomOffset,
            },
          ]}
          onPress={handleOpenComposer}
        >
          <LinearGradient
            colors={['#14B8A6', '#38BDF8', '#FB923C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <PlusIcon color="#082032" size={26} />
          </LinearGradient>
        </TouchableOpacity>

        <PostInfoModal
          visible={isPostInfoVisible}
          preferredLanguage={preferredLanguage}
          onClose={handleClosePostInfoModal}
        />

        <Modal
          animationType="fade"
          transparent
          visible={Boolean(pendingDeletePost)}
          onRequestClose={handleCloseDeleteModal}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity activeOpacity={1} style={styles.modalBackdrop} onPress={handleCloseDeleteModal} />

            <View style={styles.modalShell}>
              <LinearGradient
                colors={['rgba(32,11,6,0.98)', 'rgba(62,23,8,0.98)', 'rgba(98,39,14,0.98)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalCard}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderCopy}>
                    <View style={styles.deleteModalIconWrap}>
                      <TrashIcon color="#FDBA74" size={20} />
                    </View>
                    <Text style={styles.modalTitle}>Delete Post</Text>
                    <Text style={styles.modalSubtitle}>
                      This will permanently remove "{pendingDeletePost?.preview || 'this post'}" from the feed.
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    disabled={Boolean(deletingPostId)}
                    onPress={handleCloseDeleteModal}
                    style={styles.modalCloseButton}
                  >
                    <CloseIcon color="#E2E8F0" size={18} />
                  </TouchableOpacity>
                </View>

                <View style={styles.deleteWarningCard}>
                  <Text style={styles.deleteWarningText}>
                    This action cannot be undone.
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    disabled={Boolean(deletingPostId)}
                    onPress={handleCloseDeleteModal}
                    style={styles.ghostButton}
                  >
                    <Text style={styles.ghostButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.92}
                    disabled={!pendingDeletePost || Boolean(deletingPostId)}
                    onPress={() => pendingDeletePost && handleDeletePost(pendingDeletePost.id)}
                    style={styles.submitTouch}
                  >
                    <LinearGradient
                      colors={['#F97316', '#FB923C', '#FDBA74']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.deleteConfirmButton}
                    >
                      {deletingPostId ? (
                        <>
                          <ActivityIndicator color="#2A1204" size="small" />
                          <Text style={styles.deleteConfirmText}>Deleting...</Text>
                        </>
                      ) : (
                        <>
                          <TrashIcon color="#2A1204" size={16} />
                          <Text style={styles.deleteConfirmText}>Delete</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent
          visible={isComposerVisible}
          onRequestClose={handleCloseComposer}
        >
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <TouchableOpacity activeOpacity={1} style={styles.modalBackdrop} onPress={handleCloseComposer} />

            <View style={styles.modalShell}>
              <LinearGradient
                colors={['rgba(7,18,28,0.98)', 'rgba(13,36,51,0.98)', 'rgba(20,57,74,0.98)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalCard}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderCopy}>
                    <Text style={styles.modalTitle}>Create Post</Text>
                    <Text style={styles.modalSubtitle}>
                      Posting as {learnerName.trim() || 'Learner'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    disabled={isSubmitting}
                    onPress={handleCloseComposer}
                    style={styles.modalCloseButton}
                  >
                    <CloseIcon color="#E2E8F0" size={18} />
                  </TouchableOpacity>
                </View>

                <TextInput
                  multiline
                  maxLength={MAX_POST_LENGTH}
                  editable={!isSubmitting}
                  placeholder="Write your post..."
                  placeholderTextColor="rgba(203,213,225,0.58)"
                  textAlignVertical="top"
                  style={styles.input}
                  value={draft}
                  onChangeText={(value) => {
                    setDraft(value);
                    if (composerError) {
                      setComposerError('');
                    }
                  }}
                />

                <View style={styles.metaRow}>
                  <Text style={styles.metaCount}>{draft.trim().length}/{MAX_POST_LENGTH}</Text>
                </View>

                {composerError ? (
                  <View style={styles.validationCard}>
                    <Text style={styles.validationText}>{composerError}</Text>
                  </View>
                ) : null}

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    activeOpacity={0.88}
                    disabled={isSubmitting}
                    onPress={handleCloseComposer}
                    style={styles.ghostButton}
                  >
                    <Text style={styles.ghostButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.92}
                    disabled={isSubmitting}
                    onPress={handleSubmitPost}
                    style={styles.submitTouch}
                  >
                    <LinearGradient
                      colors={['#14B8A6', '#38BDF8', '#FB923C']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitButton}
                    >
                      {isSubmitting ? (
                        <>
                          <ActivityIndicator color="#082032" size="small" />
                          <Text style={styles.submitLoadingText}>Validating...</Text>
                        </>
                      ) : (
                        <Text style={styles.submitText}>Post</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
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
  listContent: {
    paddingHorizontal: spaceScale(18),
    paddingTop: spaceScale(14),
    paddingBottom: spaceScale(160),
    gap: spaceScale(8),
  },
  bannerWrap: {
    marginBottom: spaceScale(14),
    borderRadius: radiusScale(20),
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  feedNoteCard: {
    marginBottom: spaceScale(14),
    paddingHorizontal: spaceScale(16),
    paddingVertical: spaceScale(16),
    borderRadius: radiusScale(22),
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.16)',
  },
  feedNoteBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spaceScale(10),
    paddingVertical: spaceScale(6),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(20,184,166,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.18)',
  },
  feedNoteBadgeText: {
    color: '#7DD3FC',
    fontSize: fontScale(11),
    fontWeight: '800',
  },
  feedNoteTitle: {
    marginTop: spaceScale(8),
    color: '#F8FBFF',
    fontSize: fontScale(18),
    fontWeight: '900',
  },
  feedNoteText: {
    marginTop: spaceScale(8),
    color: 'rgba(226,240,248,0.82)',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    fontWeight: '600',
  },
  loaderCard: {
    marginTop: spaceScale(60),
    alignItems: 'center',
    padding: spaceScale(24),
  },
  loaderText: {
    marginTop: spaceScale(12),
    color: '#F8FBFF',
    fontSize: fontScale(15),
    fontWeight: '800',
  },
  emptyCard: {
    marginTop: spaceScale(60),
    padding: spaceScale(24),
    borderRadius: radiusScale(28),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#F8FBFF',
    fontSize: fontScale(18),
    fontWeight: '900',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: spaceScale(8),
    color: 'rgba(214,235,242,0.74)',
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingStage: {
    marginTop: spaceScale(8),
    paddingBottom: spaceScale(10),
  },
  loadingHeroCard: {
    marginBottom: spaceScale(16),
    borderRadius: radiusScale(26),
    overflow: 'hidden',
    shadowColor: '#031018',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  loadingHeroGradient: {
    paddingHorizontal: spaceScale(18),
    paddingVertical: spaceScale(18),
    borderWidth: 1,
    borderColor: 'rgba(125,211,252,0.16)',
  },
  loadingHeroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceScale(8),
    paddingHorizontal: spaceScale(12),
    paddingVertical: spaceScale(7),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(20,184,166,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.2)',
  },
  loadingHeroDot: {
    width: spaceScale(8),
    height: spaceScale(8),
    borderRadius: radiusScale(999),
    backgroundColor: '#5EEAD4',
  },
  loadingHeroBadgeText: {
    color: '#B9F5EA',
    fontSize: fontScale(11),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  loadingHeroTitle: {
    marginTop: spaceScale(12),
    color: '#F8FBFF',
    fontSize: fontScale(22),
    fontWeight: '900',
  },
  loadingHeroText: {
    marginTop: spaceScale(8),
    color: 'rgba(226,240,248,0.78)',
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
    fontWeight: '600',
  },
  loadingHeroPulseRow: {
    marginTop: spaceScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceScale(8),
  },
  loadingHeroPulse: {
    width: spaceScale(28),
    height: spaceScale(8),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(56,189,248,0.28)',
  },
  loadingHeroPulseMid: {
    width: spaceScale(52),
    backgroundColor: 'rgba(251,146,60,0.3)',
  },
  loadingPostCardShell: {
    marginBottom: spaceScale(12),
    borderRadius: radiusScale(28),
    shadowColor: '#05020E',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  loadingPostCard: {
    position: 'relative',
    paddingHorizontal: spaceScale(16),
    paddingTop: spaceScale(16),
    paddingBottom: spaceScale(18),
    borderRadius: radiusScale(28),
    borderWidth: 1,
    borderColor: 'rgba(56,189,248,0.16)',
    overflow: 'hidden',
    minHeight: spaceScale(196),
  },
  loadingCardGlowLeft: {
    position: 'absolute',
    left: -spaceScale(10),
    top: spaceScale(40),
    bottom: spaceScale(72),
    width: spaceScale(12),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(20,184,166,0.26)',
  },
  loadingCardGlowBottom: {
    position: 'absolute',
    bottom: -spaceScale(26),
    left: '32%',
    width: '36%',
    height: spaceScale(54),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(56,189,248,0.14)',
  },
  loadingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spaceScale(12),
  },
  loadingProfileRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceScale(12),
  },
  loadingAvatar: {
    width: spaceScale(46),
    height: spaceScale(46),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(226,240,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  loadingMetaStack: {
    flex: 1,
    gap: spaceScale(8),
  },
  loadingLine: {
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(226,240,248,0.12)',
  },
  loadingNameLine: {
    width: '44%',
    height: spaceScale(12),
  },
  loadingMetaLine: {
    width: '32%',
    height: spaceScale(9),
  },
  loadingActionPill: {
    width: spaceScale(34),
    height: spaceScale(34),
    borderRadius: radiusScale(12),
    backgroundColor: 'rgba(226,240,248,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  loadingTitleLine: {
    marginTop: spaceScale(18),
    width: '58%',
    height: spaceScale(15),
  },
  loadingBodyLineLong: {
    marginTop: spaceScale(16),
    width: '92%',
    height: spaceScale(10),
  },
  loadingBodyLineMedium: {
    marginTop: spaceScale(10),
    width: '78%',
    height: spaceScale(10),
  },
  loadingBodyLineShort: {
    marginTop: spaceScale(10),
    width: '64%',
    height: spaceScale(10),
  },
  loadingReactionRow: {
    marginTop: spaceScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceScale(10),
  },
  loadingReactionChip: {
    width: spaceScale(54),
    height: spaceScale(32),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(226,240,248,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  loadingReactionChipWide: {
    width: spaceScale(76),
  },
  loadingShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: spaceScale(140),
    opacity: 0.95,
  },
  loadingShimmerGradient: {
    flex: 1,
    transform: [{ skewX: '-16deg' }],
  },
  errorCard: {
    marginBottom: spaceScale(14),
    borderRadius: radiusScale(24),
    padding: spaceScale(16),
    backgroundColor: 'rgba(249,115,22,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.24)',
  },
  errorTitle: {
    color: '#FDE68A',
    fontSize: fontScale(14),
    fontWeight: '900',
  },
  errorText: {
    marginTop: spaceScale(6),
    color: '#FFF7ED',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    fontWeight: '600',
  },
  postCardShell: {
    marginBottom: spaceScale(12),
    borderRadius: radiusScale(28),
    shadowColor: '#05020E',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.24,
    shadowRadius: 18,
    elevation: 10,
  },
  postCard: {
    paddingHorizontal: spaceScale(16),
    paddingTop: spaceScale(14),
    paddingBottom: spaceScale(20),
    borderRadius: radiusScale(28),
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    overflow: 'hidden',
    minHeight: spaceScale(196),
  },
  cardGlowLeft: {
    position: 'absolute',
    left: -spaceScale(10),
    top: spaceScale(42),
    bottom: spaceScale(68),
    width: spaceScale(14),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(20, 184, 166, 0.42)',
  },
  cardGlowBottom: {
    position: 'absolute',
    bottom: -spaceScale(28),
    left: '34%',
    width: '32%',
    height: spaceScale(56),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  waveWrap: {
    position: 'absolute',
    top: -spaceScale(4),
    right: -spaceScale(12),
    opacity: 0.7,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spaceScale(12),
    zIndex: 1,
  },
  profileCluster: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spaceScale(10),
  },
  metaBlock: {
    flex: 1,
  },
  avatarShell: {
    position: 'relative',
    marginTop: spaceScale(2),
  },
  avatarGradient: {
    width: spaceScale(46),
    height: spaceScale(46),
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#0EA5E9',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 6,
  },
  avatarInitials: {
    color: '#F8FAFC',
    fontSize: fontScale(14),
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  avatarPresenceDot: {
    position: 'absolute',
    right: -spaceScale(2),
    bottom: -spaceScale(1),
    width: spaceScale(13),
    height: spaceScale(13),
    borderRadius: radiusScale(999),
    backgroundColor: '#2DD4BF',
    borderWidth: 2,
    borderColor: '#081723',
    shadowColor: '#2DD4BF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.65,
    shadowRadius: 8,
    elevation: 6,
  },
  authorPrimaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceScale(6),
  },
  authorName: {
    color: '#F8F7FF',
    fontSize: fontScale(16),
    fontWeight: '900',
    letterSpacing: -0.05,
  },
  authorMetaRow: {
    marginTop: spaceScale(4),
    flexDirection: 'row',
    alignItems: 'center',
    gap: spaceScale(6),
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(164, 155, 197, 0.58)',
  },
  postDate: {
    color: '#9FB8C8',
    fontSize: fontScale(10),
    fontWeight: '500',
  },
  deleteButton: {
    width: spaceScale(44),
    height: spaceScale(44),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(11, 23, 36, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#05020E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 6,
  },
  deleteButtonText: {
    color: '#FDBA74',
    fontSize: fontScale(12),
    fontWeight: '900',
  },
  deleteModalIconWrap: {
    width: spaceScale(42),
    height: spaceScale(42),
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(249,115,22,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.2)',
    marginBottom: spaceScale(10),
  },
  deleteWarningCard: {
    marginTop: spaceScale(16),
    borderRadius: radiusScale(18),
    padding: spaceScale(14),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  deleteWarningText: {
    color: '#FFF7ED',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    fontWeight: '700',
  },
  postBody: {
    marginTop: spaceScale(6),
    width: '84%',
    color: '#F5F3FF',
    fontSize: fontScale(15),
    lineHeight: fontScale(22),
    fontWeight: '400',
    letterSpacing: -0.05,
    zIndex: 1,
  },
  postTitle: {
    marginTop: spaceScale(14),
    width: '82%',
    color: '#FB923C',
    fontSize: fontScale(10),
    lineHeight: fontScale(14),
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    zIndex: 1,
  },
  viewMoreText: {
    marginTop: spaceScale(4),
    color: '#38BDF8',
    fontSize: fontScale(11),
    fontWeight: '700',
    letterSpacing: 0,
  },
  bottomAccent: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: '16%',
    height: spaceScale(2.5),
    borderRadius: radiusScale(999),
  },
  fabTouch: {
    position: 'absolute',
    borderRadius: radiusScale(999),
    overflow: 'hidden',
    shadowColor: '#04131D',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 20,
    elevation: 10,
  },
  fab: {
    width: spaceScale(60),
    height: spaceScale(60),
    borderRadius: radiusScale(999),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spaceScale(18),
    backgroundColor: 'rgba(4, 8, 14, 0.72)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalShell: {
    width: '100%',
  },
  modalCard: {
    borderRadius: radiusScale(30),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spaceScale(22),
    paddingTop: spaceScale(22),
    paddingBottom: spaceScale(20),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spaceScale(14),
  },
  modalHeaderCopy: {
    flex: 1,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: fontScale(24),
    fontWeight: '900',
  },
  modalSubtitle: {
    marginTop: spaceScale(8),
    color: 'rgba(226,232,240,0.78)',
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
    fontWeight: '600',
  },
  modalCloseButton: {
    width: spaceScale(38),
    height: spaceScale(38),
    borderRadius: radiusScale(999),
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    minHeight: spaceScale(150),
    marginTop: spaceScale(18),
    borderRadius: radiusScale(22),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: spaceScale(14),
    paddingVertical: spaceScale(14),
    color: '#F8FAFC',
    fontSize: fontScale(14),
    lineHeight: fontScale(21),
  },
  metaRow: {
    marginTop: spaceScale(10),
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  metaCount: {
    color: 'rgba(226,232,240,0.9)',
    fontSize: fontScale(11),
    fontWeight: '800',
  },
  validationCard: {
    marginTop: spaceScale(14),
    borderRadius: radiusScale(18),
    padding: spaceScale(14),
    backgroundColor: 'rgba(249,115,22,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(251,146,60,0.2)',
  },
  validationText: {
    color: '#FFF7ED',
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    fontWeight: '600',
  },
  modalActions: {
    marginTop: spaceScale(18),
    flexDirection: 'row',
    gap: spaceScale(10),
  },
  ghostButton: {
    flex: 1,
    minHeight: spaceScale(50),
    borderRadius: radiusScale(18),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  ghostButtonText: {
    color: '#E2E8F0',
    fontSize: fontScale(14),
    fontWeight: '800',
  },
  submitTouch: {
    flex: 1.1,
  },
  submitButton: {
    minHeight: spaceScale(50),
    borderRadius: radiusScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spaceScale(8),
    paddingHorizontal: spaceScale(12),
  },
  deleteConfirmButton: {
    minHeight: spaceScale(50),
    borderRadius: radiusScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spaceScale(8),
    paddingHorizontal: spaceScale(12),
  },
  submitText: {
    color: '#082032',
    fontSize: fontScale(14),
    fontWeight: '900',
  },
  deleteConfirmText: {
    color: '#2A1204',
    fontSize: fontScale(14),
    fontWeight: '900',
  },
  submitLoadingText: {
    color: '#082032',
    fontSize: fontScale(13),
    fontWeight: '900',
  },
});

export default PostsScreen;
