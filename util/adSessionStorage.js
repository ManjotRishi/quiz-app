import { createMMKV } from 'react-native-mmkv';

const STORAGE_ID = 'dailyQuizz.adSession';

const createFallbackStorage = () => {
  let memory = {};

  return {
    getNumber: (key) => {
      const value = memory[key];
      return typeof value === 'number' ? value : undefined;
    },
    set: (key, value) => {
      memory[key] = value;
    },
  };
};

const getStorage = () => {
  try {
    return createMMKV({ id: STORAGE_ID });
  } catch (error) {
    console.warn('MMKV unavailable, falling back to in-memory ad session storage:', error);
    return createFallbackStorage();
  }
};

const STORAGE = getStorage();

export const AD_SESSION_KEYS = {
  appOpenLastShownAt: 'appOpenLastShownAt',
};

export const buildPlacementTimestampKey = (placementKey) => `placement:${placementKey}:lastShownAt`;

export const readAdTimestamp = (key) => {
  try {
    return STORAGE.getNumber(key) ?? 0;
  } catch (error) {
    console.warn('Failed to read ad session timestamp:', error);
    return 0;
  }
};

export const writeAdTimestamp = (key, value) => {
  try {
    STORAGE.set(key, Number(value) || 0);
  } catch (error) {
    console.warn('Failed to write ad session timestamp:', error);
  }
};
