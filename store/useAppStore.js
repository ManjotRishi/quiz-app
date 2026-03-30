import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const mmkv = new MMKV({
  id: 'dailyquizz-global-store',
});

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
      preferredLanguage: 'English',
      isTickingMuted: false,
      isVoiceMuted: false,
      setPreferredLanguage: (preferredLanguage) => set({ preferredLanguage }),
      setTickingMuted: (isTickingMuted) => set({ isTickingMuted }),
      setVoiceMuted: (isVoiceMuted) => set({ isVoiceMuted }),
      resetGlobalPreferences: () =>
        set({
          preferredLanguage: 'English',
          isTickingMuted: false,
          isVoiceMuted: false,
        }),
    }),
    {
      name: 'app-global-store',
      storage: createJSONStorage(() => zustandMmkvStorage),
      partialize: (state) => ({
        preferredLanguage: state.preferredLanguage,
        isTickingMuted: state.isTickingMuted,
        isVoiceMuted: state.isVoiceMuted,
      }),
    }
  )
);

