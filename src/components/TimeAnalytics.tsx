
"use client"

import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { CalendarIcon, Clock, IndianRupee } from "lucide-react";
import { DateRange } from "react-day-picker";

interface TimeEntry {
  id: string;
  start_time: string;
  end_time: string | null;
  hourly_rate: number;
  earnings_inr: number | null;
}

interface ChartData {
  date: string;
  displayDate: string;
  hours: number;
  earnings: number;
}

interface TimeAnalyticsProps {
  entries: TimeEntry[];
}

const chartConfig = {
  hours: {
    label: "Hours",
    theme: {
      light: "hsl(220 13% 35%)",
      dark: "hsl(220 13% 65%)",
    }
  },
  earnings: {
    label: "Earnings",
    theme: {
      light: "hsl(220 13% 55%)", 
      dark: "hsl(220 13% 45%)",
    }
  }
} satisfies ChartConfig;

export default function TimeAnalytics({ entries }: TimeAnalyticsProps) {
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  // Process entries to get data for charts
  const chartData = useMemo(() => {
    if (!dateRange.from || !dateRange.to || !entries.length) {
      return [];
    }

    // Generate array of dates based on the date range
    const dates = eachDayOfInterval({
      start: dateRange.from,
      end: dateRange.to,
    });

    // Initialize data for each date
    const dataByDate = dates.reduce<Record<string, ChartData>>((acc, date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'MMM dd');
      
      acc[dateStr] = {
        date: dateStr,
        displayDate,
        hours: 0,
        earnings: 0,
      };
      return acc;
    }, {});

    // Group entries by date
    entries.forEach(entry => {
      if (!entry.start_time) return;
      
      const entryDate = new Date(entry.start_time);
      const dateStr = format(entryDate, 'yyyy-MM-dd');
      
      // Check if entry is within selected date range
      if (dateRange.from && dateRange.to && isWithinInterval(entryDate, {
        start: dateRange.from,
        end: dateRange.to
      })) {
        // Calculate duration in hours
        const duration = entry.end_time 
          ? (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / (1000 * 60 * 60)
          : 0;
          
        // Add to existing data
        if (dataByDate[dateStr]) {
          dataByDate[dateStr].hours += duration;
          dataByDate[dateStr].earnings += entry.earnings_inr || 0;
        }
      }
    });

    // Aggregate data based on view (day, week, month)
    if (view === 'day') {
      // For daily view, return data as is
      return Object.values(dataByDate);
    } else if (view === 'week' || view === 'month') {
      // For weekly or monthly view, group by week or month
      const groupedData: Record<string, ChartData> = {};
      
      Object.values(dataByDate).forEach(dayData => {
        let key: string;
        let displayKey: string;
        const date = parseISO(dayData.date);
        
        if (view === 'week') {
          // Group by week
          const weekStart = startOfWeek(date);
          const weekEnd = endOfWeek(date);
          key = `${format(weekStart, 'MMM dd')}-${format(weekEnd, 'MMM dd')}`;
          displayKey = key;
        } else {
          // Group by month
          key = format(date, 'MMM yyyy');
          displayKey = key;
        }
        
        if (!groupedData[key]) {
          groupedData[key] = {
            date: key,
            displayDate: displayKey,
            hours: 0,
            earnings: 0,
          };
        }
        
        groupedData[key].hours += dayData.hours;
        groupedData[key].earnings += dayData.earnings;
      });
      
      return Object.values(groupedData);
    }
    
    return Object.values(dataByDate);
  }, [entries, dateRange, view]);

  // Create a handler that will safely update the dateRange state
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className="w-full mt-10 font-['Inter'] animate-fade-in space-y-6">
      <div className="mb-5 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          Analytics
        </h2>
        <div className="flex gap-2">
          <DateRangePicker 
            value={dateRange} 
            onValueChange={handleDateRangeChange} 
            align="end"
          />
        </div>
      </div>

      <div className="flex justify-center pb-4">
        <Tabs defaultValue="day" onValueChange={(v) => setView(v as 'day' | 'week' | 'month')}>
          <TabsList className="grid w-[400px] grid-cols-3">
            <TabsTrigger value="day">Daily</TabsTrigger>
            <TabsTrigger value="week">Weekly</TabsTrigger>
            <TabsTrigger value="month">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Tracked
            </CardTitle>
            <CardDescription>Hours worked over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis 
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toFixed(1)}h`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar 
                  dataKey="hours" 
                  fill="var(--color-hours)" 
                  radius={4} 
                  name="Hours"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Earnings
            </CardTitle>
            <CardDescription>Earnings in INR over time</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <LineChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis 
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value.toFixed(0)}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  type="monotone"
                  dataKey="earnings"
                  stroke="var(--color-earnings)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Earnings (INR)"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
