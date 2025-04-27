import React, { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import HistoryTable from './HistoryTable';
import { toast } from "@/components/ui/sonner";
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useTimer } from '@/hooks/useTimer';
import { useEarnings } from '@/hooks/useEarnings';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { formatTime } from '@/utils/timeFormat';
import TimerControls from './TimerControls';

const TimeToRupeeTracker: React.FC = () => {
  const { user, logout } = useAuth();
  const [hourlyRate, setHourlyRate] = useState<number>(5);
  const { 
    elapsedTime, 
    timerStatus, 
    startTimer, 
    pauseTimer, 
    resetTimer 
  } = useTimer();
  const { earningsINR } = useEarnings(elapsedTime, hourlyRate);
  const {
    entries,
    currentEntryId,
    fetchEntries,
    createEntry,
    updateEntry,
    setCurrentEntryId
  } = useTimeEntries(user?.id);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleStart = async () => {
    const entryId = await createEntry(hourlyRate);
    if (entryId) {
      startTimer();
      toast.success("Timer started", {
        description: `Tracking at $${hourlyRate}/hour`
      });
    }
  };

  const handlePause = async () => {
    pauseTimer();
    if (timerStatus === 'running') {
      toast.info("Timer paused", {
        description: `Current time: ${formatTime(elapsedTime)}`
      });
    } else {
      toast.success("Timer resumed");
    }
  };

  const handleReset = async () => {
    if (currentEntryId) {
      const success = await updateEntry(currentEntryId, earningsINR);
      if (success) {
        toast.success("Session completed", {
          description: `Earned ₹${earningsINR} in ${formatTime(elapsedTime)}`
        });
        await fetchEntries();
      }
    }
    resetTimer();
    setCurrentEntryId(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setHourlyRate(value);
    } else if (e.target.value === '') {
      setHourlyRate(0);
    }
  };

  // Add beforeunload event handler
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (timerStatus === 'running') {
        e.preventDefault();
        e.returnValue = 'You have an active timer running. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [timerStatus]);

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto font-['Inter'] animate-fade-in">
      <div className="w-full bg-card dark:bg-card rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
        <div className="flex justify-between items-center py-6 px-8 bg-gradient-to-r from-background to-secondary/20 dark:from-background dark:to-secondary/5">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SR WorkFlow
          </h1>
          <div className="flex items-center space-x-3">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-1"
            >
              <LogOut size={16} />
              Logout
            </Button>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex justify-center py-10 px-6 bg-gradient-to-b from-transparent to-secondary/10 dark:to-secondary/5">
          <div className="text-6xl font-bold text-foreground font-mono tracking-wider animate-pulse-slow">
            {formatTime(elapsedTime)}
          </div>
        </div>
        
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
        
        <div className="px-8 mb-8">
          <div className="card-gradient rounded-lg p-5 shadow-sm backdrop-blur-sm">
            <h2 className="text-sm text-muted-foreground mb-2 font-medium">Earnings</h2>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-green-600 dark:text-green-400">₹{earningsINR}</span>
              <span className="ml-2 text-sm text-muted-foreground">INR</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              @ ${hourlyRate}/hr = ₹{(hourlyRate * 85).toFixed(2)}/hr
            </div>
          </div>
        </div>

        <TimerControls 
          timerStatus={timerStatus}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
        />
      </div>
      
      <HistoryTable entries={entries} />
    </div>
  );
};

export default TimeToRupeeTracker;
