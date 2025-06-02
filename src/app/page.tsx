import LeaderboardPage from "@/components/leaderboard/leaderboard-page";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6 bg-gradient-to-br from-background to-card">
      <LeaderboardPage />
    </main>
  );
}
