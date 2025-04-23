
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, StopCircle } from 'lucide-react';

/**
 * TimeToRupeeTracker Component
 * A stopwatch that tracks time and calculates earnings in real-time
 * based on an hourly rate (USD) and converts to INR
 */
const TimeToRupeeTracker: React.FC = () => {
  // State for hourly rate in USD
  const [hourlyRate, setHourlyRate] = useState<number>(20);
  
  // State for elapsed time in seconds
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  // Timer state: 'idle', 'running', 'paused'
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  
  // Reference to track the timer interval
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState<number>(0);

  // USD to INR conversion rate
  const USD_TO_INR_RATE = 85;

  // Format the elapsed time to HH:MM:SS
  const formattedTime = useMemo(() => {
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = Math.floor(elapsedTime % 60);
    
    // Add leading zeros if needed
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }, [elapsedTime]);

  // Calculate earnings in INR
  const earningsINR = useMemo(() => {
    const hourlyRateINR = hourlyRate * USD_TO_INR_RATE;
    const hours = elapsedTime / 3600;
    return (hours * hourlyRateINR).toFixed(2);
  }, [elapsedTime, hourlyRate]);
  
  // Handle timer tick - update elapsed time
  useEffect(() => {
    let intervalId: number | undefined;
    
    if (timerStatus === 'running') {
      intervalId = window.setInterval(() => {
        if (startTime) {
          const currentTime = Date.now();
          const newElapsedSeconds = pausedTime + (currentTime - startTime) / 1000;
          setElapsedTime(newElapsedSeconds);
        }
      }, 100); // Update more frequently for smoother display
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timerStatus, startTime, pausedTime]);

  // Start the timer
  const handleStart = () => {
    setTimerStatus('running');
    setStartTime(Date.now());
  };
  
  // Pause the timer
  const handlePause = () => {
    if (timerStatus === 'running') {
      setTimerStatus('paused');
      setPausedTime(elapsedTime);
      setStartTime(null);
    } else if (timerStatus === 'paused') {
      // Resume
      setTimerStatus('running');
      setStartTime(Date.now());
    }
  };
  
  // Reset the timer
  const handleReset = () => {
    setTimerStatus('idle');
    setElapsedTime(0);
    setPausedTime(0);
    setStartTime(null);
  };
  
  // Handle hourly rate input change
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setHourlyRate(value);
    } else if (e.target.value === '') {
      setHourlyRate(0);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      <div className="w-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
        
        {/* Header */}
        <div className="py-6 px-8 bg-white bg-opacity-70 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 text-center font-['Poppins']">
            Time to Rupee Tracker
          </h1>
          <p className="text-center text-gray-600 text-sm mt-2 font-['Poppins']">
            Track your time and see your earnings in real-time
          </p>
        </div>
        
        {/* Timer Display */}
        <div className="flex justify-center py-8 px-6">
          <div className="text-5xl font-bold text-gray-800 font-mono tracking-wider">
            {formattedTime}
          </div>
        </div>
        
        {/* Rate Input */}
        <div className="px-8 mb-6">
          <label htmlFor="hourlyRate" className="block text-sm text-gray-600 mb-2 font-medium font-['Poppins']">
            Hourly Rate (USD)
          </label>
          <input
            id="hourlyRate"
            type="number"
            min="0"
            step="0.01"
            value={hourlyRate}
            onChange={handleRateChange}
            className="w-full px-4 py-3 rounded-lg border border-pink-200 focus:border-pink-400 focus:ring focus:ring-pink-200 focus:ring-opacity-50 transition duration-200 text-gray-700 font-['Poppins']"
          />
        </div>
        
        {/* Earnings Display */}
        <div className="px-8 mb-6">
          <div className={`bg-white rounded-lg p-5 shadow-sm ${timerStatus === 'running' ? 'animate-pulse-slow' : ''}`}>
            <h2 className="text-sm text-gray-600 mb-2 font-medium font-['Poppins']">Earnings</h2>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-green-600 font-['Poppins']">₹{earningsINR}</span>
              <span className="ml-2 text-sm text-gray-500 font-['Poppins']">INR</span>
            </div>
            <div className="mt-2 text-xs text-gray-500 font-['Poppins']">
              @ ${hourlyRate}/hr = ₹{(hourlyRate * USD_TO_INR_RATE).toFixed(2)}/hr
            </div>
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-evenly p-6 bg-white bg-opacity-70 gap-4">
          {timerStatus === 'idle' && (
            <button 
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-['Poppins']"
            >
              <Play size={18} />
              Start
            </button>
          )}
          
          {timerStatus === 'running' && (
            <button 
              onClick={handlePause}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-['Poppins']"
            >
              <Pause size={18} />
              Pause
            </button>
          )}
          
          {timerStatus === 'paused' && (
            <button 
              onClick={handlePause}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-gradient-to-r from-blue-400 to-sky-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-['Poppins']"
            >
              <Play size={18} />
              Resume
            </button>
          )}
          
          {timerStatus !== 'idle' && (
            <button 
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-gradient-to-r from-red-400 to-pink-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] font-['Poppins']"
            >
              <StopCircle size={18} />
              Reset
            </button>
          )}
        </div>
      </div>
      
      {/* Motivational message */}
      <div className="mt-6 text-center">
        <p className="text-gray-600 font-medium italic font-['Poppins']">
          "Time is your most valuable asset. Track it wisely!"
        </p>
      </div>
    </div>
  );
};

export default TimeToRupeeTracker;
