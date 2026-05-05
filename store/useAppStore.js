import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as MMKVModule from 'react-native-mmkv';

const createMemoryStorage = () => {
  const memory = {};

  return {
    getString: (key) =>
      Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : undefined,
    set: (key, value) => {
      memory[key] = value;
    },
    delete: (key) => {
      delete memory[key];
    },
  };
};

const createSafeStorage = () => {
  try {
    if (typeof MMKVModule.createMMKV === 'function') {
      return MMKVModule.createMMKV({
        id: 'dailyquizz-global-store',
      });
    }

    if (typeof MMKVModule.MMKV === 'function') {
      return new MMKVModule.MMKV({
        id: 'dailyquizz-global-store',
      });
    }

    console.warn('MMKV is unavailable, falling back to in-memory global store.');
    return createMemoryStorage();
  } catch (error) {
    console.warn('Failed to initialize MMKV, falling back to in-memory global store:', error);
    return createMemoryStorage();
  }
};

const mmkv = createSafeStorage();

const zustandMmkvStorage = {
  getItem: (name) => {
    const value = mmkv.getString(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    mmkv.set(name, value);
  },
  removeItem: (name) => {
    mmkv.delete(name);
  },
};

export const useAppStore = create(
  persist(
    (set) => ({
      learnerName: '',
      preferredLanguage: 'English',
      isTickingMuted: false,
      isVoiceMuted: false,
      setLearnerName: (learnerName) => set({ learnerName: learnerName.trim() }),
      setPreferredLanguage: (preferredLanguage) => set({ preferredLanguage }),
      setTickingMuted: (isTickingMuted) => set({ isTickingMuted }),
      setVoiceMuted: (isVoiceMuted) => set({ isVoiceMuted }),
      resetGlobalPreferences: () =>
        set({
          learnerName: '',
          preferredLanguage: 'English',
          isTickingMuted: false,
          isVoiceMuted: false,
        }),
    }),
    {
      name: 'app-global-store',
      storage: createJSONStorage(() => zustandMmkvStorage),
      partialize: (state) => ({
        learnerName: state.learnerName,
        preferredLanguage: state.preferredLanguage,
        isTickingMuted: state.isTickingMuted,
        isVoiceMuted: state.isVoiceMuted,
      }),
    }
  )
);
