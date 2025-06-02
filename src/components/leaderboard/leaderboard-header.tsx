import { Gem, Sparkles, Award } from 'lucide-react';

export function LeaderboardHeader() {
  return (
    <div className="text-center pt-8 pb-6 border-b-2 border-primary/40">
      <div className="flex items-center justify-center mb-3">
        <Award className="w-12 h-12 text-accent mr-3 transform -rotate-12" />
        <h1 className="font-headline text-5xl sm:text-6xl font-bold text-primary drop-shadow-lg">Ace Slots</h1>
        <Sparkles className="w-12 h-12 text-accent ml-3 transform rotate-12" />
      </div>
      <h2 className="font-headline text-3xl sm:text-4xl text-foreground/90 tracking-tight">Wager Leaderboard</h2>
    </div>
  );
}
