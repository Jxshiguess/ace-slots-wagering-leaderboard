import { Gem, Sparkles } from 'lucide-react';

export function LeaderboardHeader() {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center mb-2">
        <Sparkles className="w-10 h-10 text-accent mr-3" />
        <h1 className="font-headline text-5xl font-bold text-primary">Ace Slots</h1>
        <Sparkles className="w-10 h-10 text-accent ml-3" />
      </div>
      <h2 className="font-headline text-3xl text-foreground/90">Wager Leaderboard</h2>
    </div>
  );
}
