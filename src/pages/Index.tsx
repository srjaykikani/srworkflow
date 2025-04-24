
import TimeToRupeeTracker from "@/components/TimeToRupeeTracker";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  // Remove explicit logout button, as it will be handled in TimeToRupeeTracker
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/5 p-4 md:p-6 font-['Inter']">
      <div className="flex-grow flex items-center justify-center">
        <TimeToRupeeTracker />
      </div>
    </div>
  );
};

export default Index;

