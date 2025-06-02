
import type { LeaderboardEntry } from '@/types/leaderboard';

export async function fetchLeaderboardData(forceRefresh = false): Promise<LeaderboardEntry[]> {
  let apiUrl = '/api/leaderboard';
  if (forceRefresh) {
    apiUrl += '?force=true';
    console.log("Attempting to fetch leaderboard data from internal API route with force refresh: /api/leaderboard?force=true");
  } else {
    console.log("Attempting to fetch leaderboard data from internal API route: /api/leaderboard");
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', 
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { error: `Failed to parse error response. Status: ${response.statusText}` };
      }
      console.error(`Failed to fetch leaderboard data from internal API. Status: ${response.status}`, errorData);
      throw new Error(errorData.error || `Failed to fetch leaderboard data: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) { 
      console.error("Internal API route returned an error:", data.error);
      throw new Error(data.error);
    }
    return data as LeaderboardEntry[];

  } catch (error) {
    console.error(`Error in fetchLeaderboardData (calling ${apiUrl}):`, error);
    if (error instanceof Error) {
        throw new Error(`Could not retrieve leaderboard: ${error.message}`);
    }
    throw new Error("An unknown error occurred while trying to retrieve the leaderboard.");
  }
}
