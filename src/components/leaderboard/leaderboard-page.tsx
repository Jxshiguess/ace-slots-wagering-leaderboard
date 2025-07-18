
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

  const loadData = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboardData(forceRefresh);
      setLeaderboardData(data);
      if (data.length > 0) {
        toast({
          title: forceRefresh ? "Leaderboard Refreshed!" : "Leaderboard Loaded!",
          description: "The latest high rollers are here.",
          variant: "default",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        title: "Error Loading Data",
        description: errorMessage,
        variant: "destructive",
      });
      setLeaderboardData([]); 
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    loadData(true); // Pass true to force refresh
  };

  const handleClear = () => {
    setLeaderboardData([]);
    setError(null); 
    toast({
      title: "Display Cleared",
      description: "Leaderboard display has been cleared. Refresh to load new data.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen flex flex-col items-center justify-start">
      <Card className="w-full max-w-3xl shadow-2xl border-4 border-primary/60 bg-card/90 backdrop-blur-md rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-b from-primary/30 to-primary/10 p-0">
          <LeaderboardHeader />
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
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
