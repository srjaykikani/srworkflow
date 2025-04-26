
import { useState, useEffect } from 'react';

type TimerStatus = 'idle' | 'running' | 'paused';

export const useTimer = () => {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>('idle');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState<number>(0);

  useEffect(() => {
    let intervalId: number | undefined;
    
    if (timerStatus === 'running') {
      intervalId = window.setInterval(() => {
        if (startTime) {
          const currentTime = Date.now();
          const newElapsedSeconds = pausedTime + (currentTime - startTime) / 1000;
          setElapsedTime(newElapsedSeconds);
        }
      }, 100);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timerStatus, startTime, pausedTime]);

  const startTimer = () => {
    setTimerStatus('running');
    setStartTime(Date.now());
  };

  const pauseTimer = () => {
    if (timerStatus === 'running') {
      setTimerStatus('paused');
      setPausedTime(elapsedTime);
      setStartTime(null);
    } else if (timerStatus === 'paused') {
      setTimerStatus('running');
      setStartTime(Date.now());
    }
  };

  const resetTimer = () => {
    setTimerStatus('idle');
    setElapsedTime(0);
    setPausedTime(0);
    setStartTime(null);
  };

  return {
    elapsedTime,
    timerStatus,
    startTimer,
    pauseTimer,
    resetTimer
  };
};
