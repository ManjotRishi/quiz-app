import { createMMKV } from 'react-native-mmkv';

const STORAGE_ID = 'dailyQuizz.postOwnership';

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
    console.warn('MMKV unavailable, falling back to in-memory post ownership storage:', error);
    return createFallbackStorage();
  }
};

const STORAGE = getStorage();

const buildActorOwnershipKey = (actorId: string) => `postOwnership:${actorId.trim().toLowerCase()}`;

export type StoredOwnedPostMap = Record<string, true>;

export const readStoredOwnedPosts = (actorId: string): StoredOwnedPostMap => {
  try {
    const rawValue = STORAGE.getString(buildActorOwnershipKey(actorId));

    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);

    if (!parsedValue || typeof parsedValue !== 'object') {
      return {};
    }

    return Object.keys(parsedValue).reduce<StoredOwnedPostMap>((result, postId) => {
      if (postId.trim()) {
        result[postId] = true;
      }

      return result;
    }, {});
  } catch (error) {
    console.warn('Failed to read stored post ownership:', error);
    return {};
  }
};

export const writeStoredOwnedPost = (actorId: string, postId: string, isOwned: boolean) => {
  try {
    const currentOwnedPosts = readStoredOwnedPosts(actorId);

    if (isOwned) {
      currentOwnedPosts[postId] = true;
    } else {
      delete currentOwnedPosts[postId];
    }

    STORAGE.set(buildActorOwnershipKey(actorId), JSON.stringify(currentOwnedPosts));
  } catch (error) {
    console.warn('Failed to write stored post ownership:', error);
  }
};
