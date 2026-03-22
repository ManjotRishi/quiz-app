import { useCallback, useEffect, useRef, useState } from 'react';


export const useCountdown = ({ start, onExpire }) => {
  const [seconds, setSeconds] = useState(start);
  const intervalRef = useRef(null);

  useEffect(() => {
    setSeconds(start);
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          intervalRef.current && clearInterval(intervalRef.current);
          onExpire && onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [start, onExpire]);

  const reset = useCallback(() => {
    setSeconds(start);
  }, [start]);

  return { seconds, reset };
};
