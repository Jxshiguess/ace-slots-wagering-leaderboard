import type { LeaderboardEntry } from '@/types/leaderboard';

// Mock fetch function
export async function fetchLeaderboardData(): Promise<LeaderboardEntry[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Simulate potential API error
  // if (Math.random() > 0.8) {
  //   throw new Error("Failed to fetch leaderboard data. Please try again!");
  // }

  const sampleUsernames = [
    "PlayerOne", "HighRoller", "LuckyLucy", "JackpotJoe", "AcePlayer", 
    "SpinnerMaster", "BettingKing", "WagerQueen", "SlotSlayer", "ReelDeal",
    "GoldMiner", "CoinCollector", "BonusHunter", "RiskTaker", "VegasViper"
  ];

  const data: LeaderboardEntry[] = [];
  const numEntries = 10 + Math.floor(Math.random() * 6); // 10 to 15 entries

  for (let i = 0; i < numEntries; i++) {
    const usernameIndex = Math.floor(Math.random() * sampleUsernames.length);
    const username = sampleUsernames[usernameIndex] + (Math.random() > 0.7 ? Math.floor(Math.random() * 100) : '');
    // Ensure unique usernames for this batch roughly
    if (data.find(d => d.username === username) && i < sampleUsernames.length) {
        sampleUsernames.splice(usernameIndex, 1); // Avoid reusing directly if possible
    }

    data.push({
      id: (i + 1).toString(),
      username: username,
      wagerAmount: Math.floor(Math.random() * 20000) + 1000, // Wagers between 1000 and 21000
      avatar: `https://placehold.co/40x40.png?text=${username.substring(0,2).toUpperCase()}`
    });
  }
  
  return data.sort((a, b) => b.wagerAmount - a.wagerAmount);
}
