import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { LeaderboardEntry } from "@/types/leaderboard";
import { Crown, Cherry, Gem, DollarSign, Trophy, Medal, Star } from "lucide-react";

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
}

const rankIcons = [
  <Crown key="1" className="h-5 w-5 text-yellow-400" />,
  <Medal key="2" className="h-5 w-5 text-slate-400" />,
  <Trophy key="3" className="h-5 w-5 text-yellow-600" />,
];

const slotFlairIcons = [
  <Cherry key="cherry" className="h-4 w-4 text-red-500" />,
  <Gem key="gem" className="h-4 w-4 text-blue-500" />,
  <DollarSign key="dollar" className="h-4 w-4 text-green-500" />,
  <Star key="star" className="h-4 w-4 text-yellow-500" />,
];

function getRandomFlairIcon() {
  return slotFlairIcons[Math.floor(Math.random() * slotFlairIcons.length)];
}


export function LeaderboardTable({ data, isLoading, error }: LeaderboardTableProps) {
  if (isLoading && !data.length) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 bg-card-foreground/5 rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full bg-muted/20" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 bg-muted/20" />
              <Skeleton className="h-4 w-1/2 bg-muted/20" />
            </div>
            <Skeleton className="h-6 w-12 bg-muted/20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive text-lg py-8">{error}</p>;
  }

  if (!data.length && !isLoading) {
    return <p className="text-center text-foreground/70 text-lg py-8">No data to display. Try refreshing!</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border shadow-lg">
      <Table className="min-w-full">
        <TableHeader className="bg-primary/10">
          <TableRow>
            <TableHead className="w-[80px] text-center font-headline text-primary-foreground/80">Rank</TableHead>
            <TableHead className="font-headline text-primary-foreground/80">Username</TableHead>
            <TableHead className="text-right font-headline text-primary-foreground/80">Wager Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry, index) => (
            <TableRow key={entry.id} className={`transition-opacity duration-500 ease-in-out hover:bg-accent/10 ${isLoading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
              <TableCell className="text-center font-medium text-lg">
                <div className="flex items-center justify-center space-x-2">
                  {rankIcons[index] || <span className="text-foreground/80">{index + 1}</span>}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Image
                    src={entry.avatar || `https://placehold.co/40x40.png?text=${entry.username.substring(0,2).toUpperCase()}`}
                    alt={`${entry.username}'s avatar`}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-accent/50"
                    data-ai-hint="player avatar"
                  />
                  <span className="font-medium text-foreground">{entry.username}</span>
                  <span className="opacity-70">{getRandomFlairIcon()}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-bold text-accent text-lg">
                  ${entry.wagerAmount.toLocaleString()}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
