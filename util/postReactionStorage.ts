import { createMMKV } from 'react-native-mmkv';
import { PostReactionValue } from './postsApi';

const STORAGE_ID = 'dailyQuizz.postReactions';

const normalizeReactionValue = (value: unknown): PostReactionValue =>
  value === 'like' || value === 'dislike' ? value : null;

const createFallbackStorage = () => {
  let memory: Record<string, string> = {};

  return {
    getString: (key: string) =>
      Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : undefined,
    set: (key: string, value: string) => {
      memory[key] = value;
    },
  };
};

const getStorage = () => {
  try {
    return createMMKV({ id: STORAGE_ID });
  } catch (error) {
    console.warn('MMKV unavailable, falling back to in-memory post reaction storage:', error);
    return createFallbackStorage();
  }
};

const STORAGE = getStorage();

const buildActorReactionKey = (actorId: string) => `postReactions:${actorId.trim().toLowerCase()}`;

export type StoredPostReactionMap = Record<string, PostReactionValue>;

export const readStoredPostReactions = (actorId: string): StoredPostReactionMap => {
  try {
    const rawValue = STORAGE.getString(buildActorReactionKey(actorId));

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);

    if (!parsedValue || typeof parsedValue !== 'object') {
      return {};
    }

    return Object.entries(parsedValue).reduce<StoredPostReactionMap>((result, [postId, reaction]) => {
      const normalizedReaction = normalizeReactionValue(reaction);

      if (normalizedReaction) {
        result[postId] = normalizedReaction;
      }

      return result;
    }, {});
  } catch (error) {
    console.warn('Failed to read stored post reactions:', error);
    return {};
  }
};

export const writeStoredPostReaction = (
  actorId: string,
  postId: string,
  reaction: PostReactionValue
) => {
  try {
    const currentReactions = readStoredPostReactions(actorId);

    if (reaction) {
      currentReactions[postId] = reaction;
    } else {
      delete currentReactions[postId];
    }

    STORAGE.set(buildActorReactionKey(actorId), JSON.stringify(currentReactions));
  } catch (error) {
    console.warn('Failed to write stored post reaction:', error);
  }
};
