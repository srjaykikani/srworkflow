
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

interface TimeEntry {
  id: string;
  start_time: string;
  end_time: string | null;
  hourly_rate: number;
  earnings_inr: number | null;
}

const formatDuration = (ms: number) => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours}h ${minutes}m ${seconds}s`;
};

export const exportToCSV = (entries: TimeEntry[]) => {
  const headers = ['Date', 'Start Time', 'End Time', 'Duration', 'Hourly Rate (USD)', 'Earnings (INR)'];
  const rows = entries.map(entry => {
    const duration = entry.end_time 
      ? new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()
      : 0;

    return [
      format(new Date(entry.start_time), 'MMM d, yyyy'),
      format(new Date(entry.start_time), 'HH:mm:ss'),
      entry.end_time ? format(new Date(entry.end_time), 'HH:mm:ss') : 'In Progress',
      formatDuration(duration),
      `$${entry.hourly_rate.toFixed(2)}`,
      entry.earnings_inr ? `₹${entry.earnings_inr.toFixed(2)}` : '-'
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `time-entries-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (entries: TimeEntry[]) => {
  const doc = new jsPDF();
  
  doc.text('Time Entries Report', 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on ${format(new Date(), 'MMM d, yyyy HH:mm')}`, 14, 22);

  const tableData = entries.map(entry => {
    const duration = entry.end_time 
      ? new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()
      : 0;

    return [
      format(new Date(entry.start_time), 'MMM d, yyyy'),
      format(new Date(entry.start_time), 'HH:mm:ss'),
      entry.end_time ? format(new Date(entry.end_time), 'HH:mm:ss') : 'In Progress',
      formatDuration(duration),
      `$${entry.hourly_rate.toFixed(2)}`,
      entry.earnings_inr ? `₹${entry.earnings_inr.toFixed(2)}` : '-'
    ];
  });

  autoTable(doc, {
    head: [['Date', 'Start Time', 'End Time', 'Duration', 'Hourly Rate (USD)', 'Earnings (INR)']],
    body: tableData,
    startY: 30,
    theme: 'striped',
    headStyles: { fillColor: [128, 128, 128] },
  });

  doc.save(`time-entries-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
