
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, StopCircle, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ThemeToggle from './ThemeToggle';
import HistoryTable from './HistoryTable';
import { toast } from "@/components/ui/sonner";

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
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('start_time', { ascending: false });
      
      if (error) {
        console.error('Error fetching entries:', error);
        toast.error("Failed to load your time entries", {
          description: "Please check your connection and try again"
        });
        return;
      }
      
      setEntries(data || []);
    } catch (err) {
      console.error('Error in fetchEntries:', err);
      toast.error("Something went wrong while loading entries");
    }
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
    try {
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
        toast.error("Failed to start timer", {
          description: "Your session couldn't be saved. Please try again."
        });
        return;
      }

      setCurrentEntryId(data.id);
      toast.success("Timer started", {
        description: `Tracking at $${hourlyRate}/hour`
      });
    } catch (err) {
      console.error('Error in handleStart:', err);
      toast.error("Something went wrong when starting the timer");
    }
  };
  
  const handlePause = async () => {
    try {
      if (timerStatus === 'running') {
        setTimerStatus('paused');
        setPausedTime(elapsedTime);
        setStartTime(null);
        toast.info("Timer paused", {
          description: `Current time: ${formattedTime}`
        });
      } else if (timerStatus === 'paused') {
        setTimerStatus('running');
        setStartTime(Date.now());
        toast.success("Timer resumed");
      }
    } catch (err) {
      console.error('Error in handlePause:', err);
      toast.error("Failed to update timer status");
    }
  };
  
  const handleReset = async () => {
    try {
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
          toast.error("Failed to save your session", {
            description: "Please try again or check your connection"
          });
          return;
        }

        toast.success("Session completed", {
          description: `Earned ₹${earningsINR} in ${formattedTime}`
        });
        await fetchEntries();
      }

      setTimerStatus('idle');
      setElapsedTime(0);
      setPausedTime(0);
      setStartTime(null);
      setCurrentEntryId(null);
    } catch (err) {
      console.error('Error in handleReset:', err);
      toast.error("Something went wrong when stopping the timer");
    }
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
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto font-['Inter'] animate-fade-in">
      <div className="w-full bg-card dark:bg-card rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
        {/* Header with improved spacing and alignment */}
        <div className="flex justify-between items-center py-6 px-8 bg-gradient-to-r from-background to-secondary/20 dark:from-background dark:to-secondary/5">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Time to Rupee Tracker
          </h1>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
          </div>
        </div>
        
        {/* Timer Display with enhanced typography */}
        <div className="flex justify-center py-10 px-6 bg-gradient-to-b from-transparent to-secondary/10 dark:to-secondary/5">
          <div className="text-6xl font-bold text-foreground font-mono tracking-wider animate-pulse-slow">
            {formattedTime}
          </div>
        </div>
        
        {/* Rate Input with improved spacing and visual feedback */}
        <div className="px-8 mb-8">
          <label htmlFor="hourlyRate" className="block text-sm text-muted-foreground mb-2 font-medium">
            Hourly Rate (USD)
          </label>
          <input
            id="hourlyRate"
            type="number"
            min="0"
            step="0.01"
            value={hourlyRate}
            onChange={handleRateChange}
            className="w-full px-4 py-3 rounded-lg bg-secondary/50 dark:bg-muted border border-input dark:border-muted focus:border-primary dark:focus:border-accent focus:ring focus:ring-primary/20 dark:focus:ring-accent/20 transition duration-200 text-foreground"
          />
        </div>
        
        {/* Earnings Display with enhanced card styling */}
        <div className="px-8 mb-8">
          <div className="card-gradient rounded-lg p-5 shadow-sm backdrop-blur-sm">
            <h2 className="text-sm text-muted-foreground mb-2 font-medium">Earnings</h2>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-green-600 dark:text-green-400">₹{earningsINR}</span>
              <span className="ml-2 text-sm text-muted-foreground">INR</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              @ ${hourlyRate}/hr = ₹{(hourlyRate * USD_TO_INR_RATE).toFixed(2)}/hr
            </div>
          </div>
        </div>
        
        {/* Controls with improved button styling and spacing */}
        <div className="flex flex-col sm:flex-row justify-evenly p-7 bg-secondary/30 dark:bg-muted/10 gap-4">
          {timerStatus === 'idle' && (
            <button 
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-green-400/40"
            >
              <Play size={18} />
              Start
            </button>
          )}
          
          {timerStatus === 'running' && (
            <button 
              onClick={handlePause}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            >
              <Pause size={18} />
              Pause
            </button>
          )}
          
          {timerStatus === 'paused' && (
            <button 
              onClick={handlePause}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-gradient-to-r from-blue-400 to-sky-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            >
              <Play size={18} />
              Resume
            </button>
          )}
          
          {timerStatus !== 'idle' && (
            <button 
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-lg bg-gradient-to-r from-red-400 to-pink-500 text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-400/40"
            >
              <StopCircle size={18} />
              Reset
            </button>
          )}
        </div>
      </div>
      
      <HistoryTable entries={entries} />
    </div>
  );
};

export default TimeToRupeeTracker;
