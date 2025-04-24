import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { format, isSameDay, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { TimeEntryFilters } from "./TimeEntryFilters";
import type { TimeEntryFilters as Filters } from "./TimeEntryFilters";

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
  const [filters, setFilters] = useState<Filters>({
    dateFrom: null,
    dateTo: null,
    minEarnings: null,
    maxEarnings: null,
  });

  useEffect(() => {
    setIsLoading(entries.length === 0);
  }, [entries]);

  // Filter entries based on the current filters
  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.start_time);
    const earnings = entry.earnings_inr ?? 0;

    // Date range filter
    if (filters.dateFrom && filters.dateTo) {
      const isInRange = isWithinInterval(entryDate, {
        start: startOfDay(filters.dateFrom),
        end: endOfDay(filters.dateTo)
      });
      if (!isInRange) return false;
    } else if (filters.dateFrom) {
      if (entryDate < startOfDay(filters.dateFrom)) return false;
    } else if (filters.dateTo) {
      if (entryDate > endOfDay(filters.dateTo)) return false;
    }

    // Earnings range filter
    if (filters.minEarnings !== null && earnings < filters.minEarnings) return false;
    if (filters.maxEarnings !== null && earnings > filters.maxEarnings) return false;

    return true;
  });

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
  const groupedEntries = filteredEntries.reduce((acc, entry) => {
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

  const handleClearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      minEarnings: null,
      maxEarnings: null,
    });
    toast.info("Filters cleared");
  };

  return (
    <div className="w-full mt-10 font-['Inter'] animate-fade-in">
      <div className="mb-5 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-primary" />
          History
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleSortOrderChange}
            className="px-3 py-1.5 rounded-md bg-secondary dark:bg-muted hover:bg-secondary/80 dark:hover:bg-muted/80 transition-colors flex items-center gap-1.5 text-sm font-medium"
            title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {sortOrder === 'asc' ? (
              <>Oldest first <ArrowUp className="h-3.5 w-3.5" /></>
            ) : (
              <>Newest first <ArrowDown className="h-3.5 w-3.5" /></>
            )}
          </button>
        </div>
      </div>

      <TimeEntryFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={handleClearFilters}
      />
      
      <div className="border rounded-lg dark:border-muted overflow-hidden bg-card dark:bg-card shadow-sm">
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm rounded-md text-primary dark:text-primary animate-pulse">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading history...
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-muted-foreground mb-2">No time entries yet</p>
              <p className="text-sm text-muted-foreground">Start the timer to begin tracking</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[600px] rounded-md">
            <Table>
              <TableHeader className="sticky top-0 bg-secondary/70 dark:bg-muted/80 backdrop-blur-sm">
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
                      <TableCell className="font-medium border-b dark:border-muted">
                        {formatDate(date)}
                      </TableCell>
                      <TableCell colSpan={4} className="p-0">
                        <div className="border-b dark:border-muted px-4 py-2 bg-secondary/20 dark:bg-muted/20">
                          <span className="font-medium">
                            Total: {formatDuration(duration)} | ₹{earnings.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          {dayEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="grid grid-cols-4 px-4 py-3 hover:bg-secondary/10 dark:hover:bg-muted/10 transition-colors"
                            >
                              <div>
                                {entry.start_time ? formatTime(entry.start_time) : '??:??:??'} - {entry.end_time ? formatTime(entry.end_time) : 
                                <span className="text-primary dark:text-primary animate-pulse">In Progress</span>}
                              </div>
                              <div>
                                {entry.end_time && entry.start_time
                                  ? formatDuration(
                                      new Date(entry.end_time).getTime() -
                                        new Date(entry.start_time).getTime()
                                    )
                                  : 'In Progress'}
                              </div>
                              <div>${entry.hourly_rate.toFixed(2)}</div>
                              <div className="font-medium">
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
