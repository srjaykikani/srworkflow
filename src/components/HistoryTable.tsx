
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { format, isSameDay, parseISO } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";

interface TimeEntry {
  id: string;
  start_time: string;
  end_time: string | null;
  hourly_rate: number;
  earnings_inr: number | null;
}

interface HistoryTableProps {
  entries: TimeEntry[];
}

const HistoryTable = ({ entries }: HistoryTableProps) => {
  const [sortBy, setSortBy] = useState<'date' | 'earnings'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Show loading state when entries are being fetched
    setIsLoading(entries.length === 0);
  }, [entries]);

  const formatTime = (date: string) => {
    try {
      return format(new Date(date), 'HH:mm:ss');
    } catch (error) {
      console.error("Error formatting time:", error);
      return "Invalid date";
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Group entries by date
  const groupedEntries = entries.reduce((acc, entry) => {
    try {
      const date = format(new Date(entry.start_time), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
    } catch (error) {
      console.error("Error grouping entry:", error);
      toast.error("Failed to process an entry due to invalid date format");
    }
    return acc;
  }, {} as Record<string, TimeEntry[]>);

  // Sort dates based on current sort settings
  const sortedDates = Object.keys(groupedEntries).sort((a, b) => {
    if (sortOrder === 'desc') {
      return b.localeCompare(a);
    }
    return a.localeCompare(b);
  });

  // Calculate daily totals
  const calculateDailyTotal = (entries: TimeEntry[]) => {
    return entries.reduce(
      (acc, entry) => {
        const duration = entry.end_time
          ? new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()
          : 0;
        return {
          duration: acc.duration + duration,
          earnings: acc.earnings + (entry.earnings_inr ?? 0),
        };
      },
      { duration: 0, earnings: 0 }
    );
  };

  const formatDuration = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleSortOrderChange = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    toast.info(`Sorted by date ${newOrder === 'desc' ? 'newest first' : 'oldest first'}`);
  };

  return (
    <div className="w-full mt-8 font-['Inter']">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">History</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSortOrderChange}
            className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
      
      <div className="border rounded-lg dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <p className="text-gray-500 dark:text-gray-400">Loading history...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-2">No time entries yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Start the timer to begin tracking</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[600px] rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead className="w-[180px]">Date</TableHead>
                  <TableHead>Session Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Rate (USD)</TableHead>
                  <TableHead>Earnings (INR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDates.map((date) => {
                  const dayEntries = groupedEntries[date];
                  const { duration, earnings } = calculateDailyTotal(dayEntries);
                  
                  return (
                    <TableRow key={date} className="group">
                      <TableCell className="font-medium border-b dark:border-gray-700">
                        {formatDate(date)}
                      </TableCell>
                      <TableCell colSpan={4} className="p-0">
                        <div className="border-b dark:border-gray-700 px-4 py-2 bg-gray-50/50 dark:bg-gray-800/50">
                          <span className="font-medium">
                            Total: {formatDuration(duration)} | ₹{earnings.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          {dayEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="grid grid-cols-4 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                            >
                              <div>
                                {entry.start_time ? formatTime(entry.start_time) : '??:??:??'} - {entry.end_time ? formatTime(entry.end_time) : 'In Progress'}
                              </div>
                              <div>
                                {entry.end_time && entry.start_time
                                  ? formatDuration(
                                      new Date(entry.end_time).getTime() -
                                        new Date(entry.start_time).getTime()
                                    )
                                  : 'In Progress'}
                              </div>
                              <div>${entry.hourly_rate}</div>
                              <div>
                                {entry.earnings_inr !== null 
                                  ? `₹${entry.earnings_inr.toFixed(2)}` 
                                  : '-'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default HistoryTable;
