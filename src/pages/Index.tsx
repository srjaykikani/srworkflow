
import TimeToRupeeTracker from "@/components/TimeToRupeeTracker";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/5 pt-20 p-4 md:p-6 font-['Inter']">
      <div className="flex-grow flex items-center justify-center">
        <TimeToRupeeTracker />
      </div>
    </div>
  );
};

export default Index;
