
import { useMemo } from 'react';

const USD_TO_INR_RATE = 85;

export const useEarnings = (elapsedTime: number, hourlyRate: number) => {
  const earningsINR = useMemo(() => {
    const hourlyRateINR = hourlyRate * USD_TO_INR_RATE;
    const hours = elapsedTime / 3600;
    return (hours * hourlyRateINR).toFixed(2);
  }, [elapsedTime, hourlyRate]);

  return { earningsINR };
};
