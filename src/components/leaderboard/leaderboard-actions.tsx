import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2, Loader2 } from "lucide-react";

interface LeaderboardActionsProps {
  onRefresh: () => void;
  onClear: () => void;
  isLoading: boolean;
  hasData: boolean;
}

export function LeaderboardActions({ onRefresh, onClear, isLoading, hasData }: LeaderboardActionsProps) {
  return (
    <div className="flex justify-center space-x-4 my-6">
      <Button onClick={onRefresh} disabled={isLoading} variant="outline" className="border-accent text-accent hover:bg-accent/10">
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-5 w-5" />
        )}
        Refresh Data
      </Button>
      <Button onClick={onClear} disabled={isLoading || !hasData} variant="destructive" className="bg-secondary hover:bg-secondary/80 text-secondary-foreground">
        <Trash2 className="mr-2 h-5 w-5" />
        Clear Display
      </Button>
    </div>
  );
}
