
import type { LeaderboardEntry } from '@/types/leaderboard';

// Cache variables
let cachedData: LeaderboardEntry[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION_MS = 20 * 60 * 1000; // 20 minutes

interface RainbetAffiliate {
  username: string;
  id: string;
  wagered_amount: string; // API returns this as a string
}

interface RainbetApiResponse {
  affiliates: RainbetAffiliate[];
  cache_updated_at: string;
}

function getWeekDates(): { start_at: string; end_at: string } {
  const today = new Date();
  
  // end_at is today
  const end_at = today.toISOString().split('T')[0];

  // Calculate start_at (most recent Monday)
  const startAtDate = new Date(today); // Create a new Date object for startAtDate
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  
  let daysToSubtract = dayOfWeek - 1; // For Monday (1), subtract 0 days.
  if (dayOfWeek === 0) { // If Sunday (0), Monday was 6 days ago.
    daysToSubtract = 6;
  }
  startAtDate.setDate(today.getDate() - daysToSubtract);
  const start_at = startAtDate.toISOString().split('T')[0];

  return { start_at, end_at };
}

export async function fetchLeaderboardData(): Promise<LeaderboardEntry[]> {
  // Check cache
  const now = Date.now();
  if (cachedData && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION_MS)) {
    console.log("Returning cached leaderboard data");
    return cachedData;
  }

  console.log("Fetching fresh leaderboard data from Rainbet API");

  const apiKey = process.env.RAINBET_API_KEY;
  if (!apiKey) {
    console.error("Rainbet API key is not configured.");
    throw new Error("Rainbet API key is missing. Please set RAINBET_API_KEY in your environment variables.");
  }

  const { start_at, end_at } = getWeekDates();
  const apiUrl = `https://services.rainbet.com/v1/external/affiliates?key=${apiKey}&start_at=${start_at}&end_at=${end_at}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Rainbet API request failed with status ${response.status}: ${errorBody}`);
      throw new Error(`Failed to fetch leaderboard data from Rainbet API: ${response.statusText} - ${errorBody}`);
    }

    const apiResponse = (await response.json()) as RainbetApiResponse;

    const transformedData: LeaderboardEntry[] = apiResponse.affiliates.map(affiliate => ({
      id: affiliate.id,
      username: affiliate.username,
      wagerAmount: parseFloat(affiliate.wagered_amount) || 0, // Ensure it's a number, default to 0 if parsing fails
      avatar: `https://placehold.co/40x40.png?text=${affiliate.username.substring(0, 2).toUpperCase()}`
    }));

    // Sort by wagerAmount descending as API might not guarantee order
    transformedData.sort((a, b) => b.wagerAmount - a.wagerAmount);
    
    // Update cache
    cachedData = transformedData;
    cacheTimestamp = now;

    return transformedData;

  } catch (error) {
    console.error("Error fetching or processing leaderboard data from Rainbet API:", error);
    if (error instanceof Error) {
        // Re-throw specific, actionable errors
        if (error.message.startsWith("Rainbet API key is missing") || error.message.startsWith("Failed to fetch leaderboard data from Rainbet API")) {
            throw error;
        }
        // For other errors, provide a more generic message to the client
        throw new Error(`An error occurred while fetching leaderboard data. Please try again later.`);
    }
    throw new Error("An unknown error occurred while fetching leaderboard data.");
  }
}
