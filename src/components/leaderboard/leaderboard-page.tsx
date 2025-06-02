"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { LeaderboardEntry } from '@/types/leaderboard';
import { fetchLeaderboardData } from '@/lib/api';
import { LeaderboardHeader } from './leaderboard-header';
import { LeaderboardActions } from './leaderboard-actions';
import { LeaderboardTable } from './leaderboard-table';

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboardData();
      setLeaderboardData(data);
      toast({
        title: "Leaderboard Updated",
        description: "Fresh data has been loaded!",
        variant: "default",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Error Loading Data",
        description: errorMessage,
        variant: "destructive",
      });
      setLeaderboardData([]); // Clear data on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData();
  };

  const handleClear = () => {
    setLeaderboardData([]);
    setError(null); // Clear any existing errors
    toast({
      title: "Display Cleared",
      description: "Leaderboard display has been cleared. Refresh to load new data.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen flex flex-col items-center justify-start">
      <Card className="w-full max-w-3xl shadow-2xl border-2 border-primary/30 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <LeaderboardHeader />
        </CardHeader>
        <CardContent>
          <LeaderboardActions 
            onRefresh={handleRefresh} 
            onClear={handleClear} 
            isLoading={isLoading}
            hasData={leaderboardData.length > 0}
          />
          <LeaderboardTable data={leaderboardData} isLoading={isLoading} error={error} />
        </CardContent>
      </Card>
    </div>
  );
}
