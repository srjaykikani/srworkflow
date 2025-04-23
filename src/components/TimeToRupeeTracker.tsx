import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, StopCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ThemeToggle from './ThemeToggle';
import HistoryTable from './HistoryTable';

const TimeToRupeeTracker: React.FC = () => {
  const [hourlyRate, setHourlyRate] = useState<number>(5);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState<number>(0);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);
  const [entries, setEntries] = useState<any[]>([]);

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

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .order('start_time', { ascending: false });
    
    if (error) {
      console.error('Error fetching entries:', error);
      return;
    }
    
    setEntries(data || []);
  };

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

  const handleStart = async () => {
    setTimerStatus('running');
    const now = Date.now();
    setStartTime(now);

    const { data, error } = await supabase
      .from('time_entries')
      .insert({
        start_time: new Date(now).toISOString(),
        hourly_rate: hourlyRate,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating entry:', error);
      return;
    }

    setCurrentEntryId(data.id);
  };
  
  const handlePause = async () => {
    if (timerStatus === 'running') {
      setTimerStatus('paused');
      setPausedTime(elapsedTime);
      setStartTime(null);
    } else if (timerStatus === 'paused') {
      setTimerStatus('running');
      setStartTime(Date.now());
    }
  };
  
  const handleReset = async () => {
    if (currentEntryId) {
      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString(),
          earnings_inr: parseFloat(earningsINR),
        })
        .eq('id', currentEntryId);

      if (error) {
        console.error('Error updating entry:', error);
        return;
      }

      await fetchEntries();
    }

    setTimerStatus('idle');
    setElapsedTime(0);
    setPausedTime(0);
    setStartTime(null);
    setCurrentEntryId(null);
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
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="w-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
        <div className="flex justify-between items-center py-6 px-8 bg-white bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center font-['Poppins']">
            Time to Rupee Tracker
          </h1>
          <ThemeToggle />
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
      
      <HistoryTable entries={entries} />
      
      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-300 font-medium italic font-['Poppins']">
          "Time is your most valuable asset. Track it wisely!"
        </p>
      </div>
    </div>
  );
};

export default TimeToRupeeTracker;
