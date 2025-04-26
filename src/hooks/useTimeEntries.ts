
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/sonner";

export const useTimeEntries = (userId: string | undefined) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
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
  }, []);

  const createEntry = async (hourlyRate: number) => {
    try {
      const now = Date.now();
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          start_time: new Date(now).toISOString(),
          hourly_rate: hourlyRate,
          user_id: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating entry:', error);
        toast.error("Failed to start timer", {
          description: "Your session couldn't be saved. Please try again."
        });
        return null;
      }

      setCurrentEntryId(data.id);
      return data.id;
    } catch (err) {
      console.error('Error in createEntry:', err);
      toast.error("Something went wrong when starting the timer");
      return null;
    }
  };

  const updateEntry = async (entryId: string, earningsINR: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString(),
          earnings_inr: parseFloat(earningsINR),
        })
        .eq('id', entryId);

      if (error) {
        console.error('Error updating entry:', error);
        toast.error("Failed to save your session", {
          description: "Please try again or check your connection"
        });
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error in updateEntry:', err);
      toast.error("Something went wrong when stopping the timer");
      return false;
    }
  };

  return {
    entries,
    currentEntryId,
    fetchEntries,
    createEntry,
    updateEntry,
    setCurrentEntryId
  };
};
