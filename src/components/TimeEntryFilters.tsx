
import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface TimeEntryFilters {
  dateFrom: Date | null;
  dateTo: Date | null;
  minEarnings: number | null;
  maxEarnings: number | null;
}

interface TimeEntryFiltersProps {
  filters: TimeEntryFilters;
  onFiltersChange: (filters: TimeEntryFilters) => void;
  onClearFilters: () => void;
}

export function TimeEntryFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters 
}: TimeEntryFiltersProps) {
  const handleEarningsChange = (
    type: 'min' | 'max',
    value: string
  ) => {
    const numValue = value === '' ? null : Number(value);
    onFiltersChange({
      ...filters,
      [type === 'min' ? 'minEarnings' : 'maxEarnings']: numValue,
    });
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-[200px]",
                  !filters.dateFrom && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {filters.dateFrom ? (
                  format(filters.dateFrom, "MMM d, yyyy")
                ) : (
                  "From date"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={filters.dateFrom ?? undefined}
                onSelect={(date) => 
                  onFiltersChange({ ...filters, dateFrom: date })
                }
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-[200px]",
                  !filters.dateTo && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {filters.dateTo ? (
                  format(filters.dateTo, "MMM d, yyyy")
                ) : (
                  "To date"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={filters.dateTo ?? undefined}
                onSelect={(date) => 
                  onFiltersChange({ ...filters, dateTo: date })
                }
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min earnings (₹)"
            value={filters.minEarnings ?? ''}
            onChange={(e) => handleEarningsChange('min', e.target.value)}
            className="w-[150px]"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="number"
            placeholder="Max earnings (₹)"
            value={filters.maxEarnings ?? ''}
            onChange={(e) => handleEarningsChange('max', e.target.value)}
            className="w-[150px]"
          />
        </div>

        <Button 
          variant="outline" 
          onClick={onClearFilters}
          className="ml-auto"
        >
          Clear filters
        </Button>
      </div>
    </div>
  );
}
