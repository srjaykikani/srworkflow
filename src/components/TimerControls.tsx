
import { Play, Pause, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimerControlsProps {
  timerStatus: 'idle' | 'running' | 'paused';
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

const TimerControls = ({ timerStatus, onStart, onPause, onReset }: TimerControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-evenly p-7 bg-secondary/30 dark:bg-muted/10 gap-4">
      {timerStatus === 'idle' && (
        <Button 
          variant="default"
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Play size={18} />
          Start Tracking
        </Button>
      )}
      
      {timerStatus === 'running' && (
        <div className="flex w-full gap-4">
          <Button 
            variant="secondary"
            onClick={onPause}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Pause size={18} />
            Pause
          </Button>
          <Button 
            variant="destructive"
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <StopCircle size={18} />
            Stop
          </Button>
        </div>
      )}
      
      {timerStatus === 'paused' && (
        <div className="flex w-full gap-4">
          <Button 
            variant="default"
            onClick={onPause}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Play size={18} />
            Resume
          </Button>
          <Button 
            variant="destructive"
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2"
          >
            <StopCircle size={18} />
            Stop
          </Button>
        </div>
      )}
    </div>
  );
};

export default TimerControls;
