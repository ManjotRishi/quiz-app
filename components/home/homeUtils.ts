import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { fontScale } from '../../style/responsive';
import { HomeQuickGridMetrics, SpotlightPost } from './homeTypes';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const buildAvatarInitials = (authorName: string) => {
  const words = authorName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!words.length) {
    return 'P';
  }

  return words.map((word) => word[0]?.toUpperCase() ?? '').join('');
};

export const buildFallbackTitle = (body: string) =>
  body
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .slice(0, 6)
    .join(' ')
    .trim();

export const formatPostDate = (createdAtMs: number) => {
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

  return `${relativeLabel} - ${dateLabel}`;
};

export const mapDocToSpotlightPost = (
  doc: FirebaseFirestoreTypes.QueryDocumentSnapshot | undefined
): SpotlightPost | null => {
  if (!doc) {
    return null;
  }

  const data = doc.data() ?? {};
  const body = typeof data.body === 'string' ? data.body.trim() : '';

  if (!body) {
    return null;
  }

  const title =
    typeof data.title === 'string' && data.title.trim()
      ? data.title.trim()
      : buildFallbackTitle(body) || 'Helpful Post';
  const authorName =
    typeof data.authorName === 'string' && data.authorName.trim()
      ? data.authorName.trim()
      : 'Learner';
  const likeCount =
    typeof data.likeCount === 'number' && Number.isFinite(data.likeCount) ? data.likeCount : 0;
  const createdAtMs = typeof data.createdAt?.toMillis === 'function' ? data.createdAt.toMillis() : 0;

  return {
    id: doc.id,
    authorName,
    title,
    body,
    likeCount,
    createdAtMs,
    createdAtLabel: formatPostDate(createdAtMs),
  };
};

export const sortSpotlightPosts = (posts: SpotlightPost[]) =>
  [...posts].sort((left, right) => {
    if (right.likeCount !== left.likeCount) {
      return right.likeCount - left.likeCount;
    }

    return right.createdAtMs - left.createdAtMs;
  });

export const getHomeQuickGridMetrics = (width: number): HomeQuickGridMetrics => {
  const compact = width < 350;
  const spacious = width >= 430;
  const contentPadding = compact ? 16 : 18;
  const quickGap = compact ? 8 : spacious ? 12 : 10;
  const quickCardPaddingHorizontal = compact ? 12 : spacious ? 15 : 14;
  const quickCardPaddingVertical = compact ? 11 : spacious ? 13 : 12;
  const quickCardMinHeight = compact ? 106 : spacious ? 118 : 112;
  const quickIconShellSize = compact ? 34 : spacious ? 40 : 38;
  const quickIconSize = compact ? 18 : 20;
  const availableWidth = Math.max(width - contentPadding * 2, 0);
  const quickCardWidth = clamp(Math.floor((availableWidth - quickGap) / 2), 0, availableWidth);

  return {
    contentPadding,
    quickGap,
    quickCardWidth,
    quickCardPaddingHorizontal,
    quickCardPaddingVertical,
    quickCardMinHeight,
    quickIconShellSize,
    quickIconSize,
    quickEyebrowFontSize: fontScale(compact ? 9 : 10),
    quickTitleFontSize: fontScale(compact ? 12 : spacious ? 15 : 14),
    quickTitleLineHeight: fontScale(compact ? 15 : spacious ? 18 : 17),
    quickMetaFontSize: fontScale(compact ? 9 : 10),
    quickMetaLineHeight: fontScale(compact ? 12 : 14),
  };
};
