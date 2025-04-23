
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { format } from "date-fns";

interface TimeEntry {
  id: string;
  start_time: string;
  end_time: string | null;
  hourly_rate: number;
  earnings_inr: number;
}

interface HistoryTableProps {
  entries: TimeEntry[];
}

const HistoryTable = ({ entries }: HistoryTableProps) => {
  const formatTime = (date: string) => {
    return format(new Date(date), 'MMM d, yyyy HH:mm:ss');
  };

  return (
    <div className="w-full mt-8 overflow-hidden border rounded-lg dark:border-gray-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Rate (USD)</TableHead>
            <TableHead>Earnings (INR)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const duration = entry.end_time
              ? new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()
              : 0;
            const hours = Math.floor(duration / (1000 * 60 * 60));
            const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((duration % (1000 * 60)) / 1000);

            return (
              <TableRow key={entry.id}>
                <TableCell>{formatTime(entry.start_time)}</TableCell>
                <TableCell>
                  {entry.end_time ? `${hours}h ${minutes}m ${seconds}s` : 'In Progress'}
                </TableCell>
                <TableCell>${entry.hourly_rate}</TableCell>
                <TableCell>₹{entry.earnings_inr.toFixed(2)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default HistoryTable;
