
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
    const errMsg = "RAINBET_API_KEY is not configured on the server. Please check Vercel environment variables for your deployment.";
    console.error(errMsg);
    // This error will be caught by the GET handler's try/catch
    throw new Error(errMsg);
  }

  const { start_at, end_at } = getWeekDates();
  const apiUrl = `https://services.rainbet.com/v1/external/affiliates?key=${apiKey}&start_at=${start_at}&end_at=${end_at}`;

  try {
    console.log(`Fetching from Rainbet API: ${apiUrl.replace(apiKey, 'REDACTED_API_KEY')}`);
    const response = await fetch(apiUrl, { next: { revalidate: 0 } }); // Ensure fresh fetch for this server-side operation if not using its own cache logic

    if (!response.ok) {
      let errorBody = 'Could not retrieve error body.';
      try {
        errorBody = await response.text();
      } catch (e) {
        console.error("Failed to parse error body from Rainbet API", e);
      }
      console.error(`Rainbet API request failed with status ${response.status}: ${errorBody}`);
      throw new Error(`Failed to fetch leaderboard data from Rainbet API. Status: ${response.statusText}. Body: ${errorBody.substring(0, 100)}`);
    }

    const apiResponse = (await response.json()) as RainbetApiResponse;

    if (!apiResponse || !Array.isArray(apiResponse.affiliates)) {
      console.error("Unexpected response structure from Rainbet API:", apiResponse);
      throw new Error("Received unexpected data structure from Rainbet API.");
    }

    const transformedData: LeaderboardEntry[] = apiResponse.affiliates.map(affiliate => ({
      id: affiliate.id,
      username: affiliate.username,
      wagerAmount: parseFloat(affiliate.wagered_amount) || 0, 
      avatar: `https://placehold.co/40x40.png?text=${affiliate.username.substring(0, 2).toUpperCase()}`
    }));

    transformedData.sort((a, b) => b.wagerAmount - a.wagerAmount);
    console.log(`Successfully fetched and transformed ${transformedData.length} entries from Rainbet API.`);
    return transformedData;

  } catch (error) {
    console.error("Error fetching or processing leaderboard data from Rainbet API:", error);
    if (error instanceof Error && error.message.startsWith("Failed to fetch leaderboard data from Rainbet API")) {
        throw error; // Re-throw specific Rainbet API errors
    }
    if (error instanceof Error && error.message.startsWith("RAINBET_API_KEY is not configured")) {
        throw error; // Re-throw specific API key configuration errors
    }
    // For other errors, wrap them
    throw new Error(`An unexpected error occurred while fetching or processing data from the external API: ${error instanceof Error ? error.message : String(error)}`);
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
    // Ensure a user-friendly message is sent to the client
    const message = error instanceof Error ? error.message : "An unknown server error occurred while fetching leaderboard data.";
    // Avoid exposing too many details in client-facing error if it's a generic "unknown" error
    const clientErrorMessage = message.includes("RAINBET_API_KEY") || message.includes("Rainbet API") 
        ? message 
        : "A server error occurred while trying to retrieve leaderboard data.";
    return NextResponse.json({ error: clientErrorMessage }, { status: 500 });
  }
}
