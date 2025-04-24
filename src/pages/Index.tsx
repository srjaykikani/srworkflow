
import TimeToRupeeTracker from "@/components/TimeToRupeeTracker";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/5 p-4 md:p-6 font-['Inter']">
      <div className="absolute top-4 right-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={logout}
          className="flex items-center gap-1"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
      
      <div className="flex-grow flex items-center justify-center">
        <TimeToRupeeTracker />
      </div>
    </div>
  );
};

export default Index;
