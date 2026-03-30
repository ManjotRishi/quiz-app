import { AppState } from 'react-native';
import { useEffect, useRef } from 'react';
import Sound from 'react-native-sound';

export const useTickingSound = ({
  seconds,
  active = true,
  muted = false,
  resetKey,
  startAfterElapsedSeconds = 0,
}) => {
  const soundRef = useRef(null);
  const previousSecondsRef = useRef(seconds);
  const appStateRef = useRef(AppState.currentState);
  const startSecondsRef = useRef(seconds);

  useEffect(() => {
    startSecondsRef.current = seconds;
  }, [resetKey]);

  useEffect(() => {
    const releaseSound = () => {
      const sound = soundRef.current;
      if (!sound) return;

      soundRef.current = null;
      sound.stop(() => {
        sound.release();
      });
    };

    if (!active) {
      releaseSound();
      previousSecondsRef.current = seconds;
      return undefined;
    }

    if (!soundRef.current && typeof Sound.setCategory === 'function') {
      Sound.setCategory('Playback');
    }

    if (!soundRef.current) {
      const sound = new Sound('tick.wav', Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('Failed to load tick sound:', error);
          return;
        }
      });

      soundRef.current = sound;
    }

    return () => {
      releaseSound();
    };
  }, [active]);

  useEffect(() => {
    const sound = soundRef.current;
    const previousSeconds = previousSecondsRef.current;

    previousSecondsRef.current = seconds;

    if (!active || muted || !sound) {
      if ((muted || appStateRef.current !== 'active') && sound) {
        sound.stop(() => {});
      }
      return;
    }

    if (seconds > previousSeconds) {
      startSecondsRef.current = seconds;
    }

    if (seconds <= 0) {
      sound.stop(() => {});
      return;
    }

    if (startAfterElapsedSeconds > 0) {
      const triggerSecond = Math.max(0, startSecondsRef.current - startAfterElapsedSeconds);

      if (seconds > triggerSecond) {
        sound.stop(() => {});
        return;
      }
    }

    if (seconds < previousSeconds) {
      sound.stop(() => {
        sound.play();
      });
    }
  }, [seconds, active, muted, startAfterElapsedSeconds]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const sound = soundRef.current;
      appStateRef.current = nextAppState;

      if (!sound) {
        return;
      }

      if (nextAppState !== 'active') {
        sound.stop(() => {});
      }
    });

    return () => subscription.remove();
  }, []);
};
