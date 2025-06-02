import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Loader2, Play } from "lucide-react";

interface LeaderboardActionsProps {
  onRefresh: () => void;
  onClear: () => void;
  isLoading: boolean;
  hasData: boolean;
}

export function LeaderboardActions({ onRefresh, onClear, isLoading, hasData }: LeaderboardActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 my-6">
      <Button 
        onClick={onRefresh} 
        disabled={isLoading} 
        variant="outline" 
        className="border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground focus:ring-accent w-full sm:w-auto py-3 px-6 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out"
        aria-label="Refresh leaderboard data"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-5 w-5" />
        )}
        Refresh Data
      </Button>
      <Button 
        onClick={onClear} 
        disabled={isLoading || !hasData} 
        variant="destructive" 
        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground w-full sm:w-auto py-3 px-6 text-base font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out"
        aria-label="Clear leaderboard display"
      >
        <Trash2 className="mr-2 h-5 w-5" />
        Clear Display
      </Button>
    </div>
  );
}
