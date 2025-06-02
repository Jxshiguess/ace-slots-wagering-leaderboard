
import type { LeaderboardEntry } from '@/types/leaderboard';

// This function will now run on the client-side (or server-side if called from a Server Component)
// and call our internal API route.
export async function fetchLeaderboardData(): Promise<LeaderboardEntry[]> {
  console.log("Attempting to fetch leaderboard data from internal API route: /api/leaderboard");

  try {
    // In a Next.js app, relative URLs for fetch are typically fine for same-origin requests.
    // Vercel handles the base URL automatically.
    const response = await fetch('/api/leaderboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Client-side fetches should usually avoid aggressive caching unless intended.
      // The server-side API route handles its own caching.
      cache: 'no-store', 
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        // If parsing the error JSON fails, use the status text.
        errorData = { error: `Failed to parse error response. Status: ${response.statusText}` };
      }
      console.error(`Failed to fetch leaderboard data from internal API. Status: ${response.status}`, errorData);
      throw new Error(errorData.error || `Failed to fetch leaderboard data: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.error) { // Handle cases where the API route returns a JSON error object
      console.error("Internal API route returned an error:", data.error);
      throw new Error(data.error);
    }
    return data as LeaderboardEntry[];

  } catch (error) {
    console.error("Error in fetchLeaderboardData (calling /api/leaderboard):", error);
    // Re-throw a cleaned-up error message
    if (error instanceof Error) {
        throw new Error(`Could not retrieve leaderboard: ${error.message}`);
    }
    throw new Error("An unknown error occurred while trying to retrieve the leaderboard.");
  }
}
