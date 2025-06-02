
import { type NextRequest, NextResponse } from 'next/server';
import type { LeaderboardEntry } from '@/types/leaderboard';

// Cache variables for the API route
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
  const startAtDate = new Date(today); 
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  
  // Adjust daysToSubtract: if today is Sunday (0), Monday was 6 days ago. Otherwise, it's (dayOfWeek - 1).
  let daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  startAtDate.setDate(today.getDate() - daysToSubtract);
  const start_at = startAtDate.toISOString().split('T')[0];

  return { start_at, end_at };
}

async function fetchFromRainbetAPI(): Promise<LeaderboardEntry[]> {
  const apiKey = process.env.RAINBET_API_KEY;
  if (!apiKey) {
    console.error("RAINBET_API_KEY is not configured on the server.");
    // Do not expose details about the key in the error message to the client
    throw new Error("Server configuration error related to external API access.");
  }

  const { start_at, end_at } = getWeekDates();
  const apiUrl = `https://services.rainbet.com/v1/external/affiliates?key=${apiKey}&start_at=${start_at}&end_at=${end_at}`;

  try {
    const response = await fetch(apiUrl, { next: { revalidate: 0 } }); // Ensure fresh fetch for API route if not using its own cache logic
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Rainbet API request failed with status ${response.status}: ${errorBody}`);
      throw new Error(`Failed to fetch leaderboard data from Rainbet API: ${response.statusText}`);
    }

    const apiResponse = (await response.json()) as RainbetApiResponse;

    const transformedData: LeaderboardEntry[] = apiResponse.affiliates.map(affiliate => ({
      id: affiliate.id,
      username: affiliate.username,
      wagerAmount: parseFloat(affiliate.wagered_amount) || 0, 
      avatar: `https://placehold.co/40x40.png?text=${affiliate.username.substring(0, 2).toUpperCase()}`
    }));

    transformedData.sort((a, b) => b.wagerAmount - a.wagerAmount);
    return transformedData;

  } catch (error) {
    console.error("Error fetching or processing leaderboard data from Rainbet API:", error);
    if (error instanceof Error && error.message.startsWith("Failed to fetch leaderboard data from Rainbet API")) {
        throw error;
    }
    throw new Error("An error occurred while fetching leaderboard data from the external API.");
  }
}

export async function GET(request: NextRequest) {
  const now = Date.now();
  // Check cache
  if (cachedData && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION_MS)) {
    console.log("Returning cached leaderboard data from API route");
    return NextResponse.json(cachedData);
  }

  console.log("Fetching fresh leaderboard data via API route (cache expired or not present)");
  try {
    const data = await fetchFromRainbetAPI();
    // Update cache
    cachedData = data;
    cacheTimestamp = now;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in API route GET handler:", error);
    const message = error instanceof Error ? error.message : "Unknown server error occurred while fetching leaderboard data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
