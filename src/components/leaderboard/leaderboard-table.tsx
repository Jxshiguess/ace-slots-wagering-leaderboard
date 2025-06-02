
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeaderboardEntry } from "@/types/leaderboard";
import { Crown, Medal, Trophy, Cherry, Gem, DollarSign, Star, type LucideProps } from "lucide-react";
import { SlotSpinner } from '@/components/ui/slot-spinner';
import { useEffect, useState } from 'react';

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
}

const rankIcons = [
  <Crown key="1" className="h-6 w-6 text-yellow-400" />,
  <Medal key="2" className="h-6 w-6 text-slate-300" />,
  <Trophy key="3" className="h-6 w-6 text-orange-400" />,
];

// Explicitly define flair icon components
const FlairCherryIcon: React.FC<LucideProps> = (props) => <Cherry {...props} className="h-4 w-4 text-red-500" />;
const FlairGemIcon: React.FC<LucideProps> = (props) => <Gem {...props} className="h-4 w-4 text-blue-400" />;
const FlairDollarSignIcon: React.FC<LucideProps> = (props) => <DollarSign {...props} className="h-4 w-4 text-green-400" />;
const FlairStarIcon: React.FC<LucideProps> = (props) => <Star {...props} className="h-4 w-4 text-yellow-400" />;

const slotFlairIconsListComponent: React.FC<LucideProps>[] = [
  FlairCherryIcon,
  FlairGemIcon,
  FlairDollarSignIcon,
  FlairStarIcon,
];

const FlairIconDisplay = () => {
  const [Icon, setIcon] = useState<React.FC<LucideProps> | null>(null);

  useEffect(() => {
    // Select icon only on client-side
    const randomIndex = Math.floor(Math.random() * slotFlairIconsListComponent.length);
    setIcon(() => slotFlairIconsListComponent[randomIndex]); 
  }, []);

  if (!Icon) return <span className="h-4 w-4 inline-block" />; // Placeholder or empty span
  return <Icon />;
}


export function LeaderboardTable({ data, isLoading, error }: LeaderboardTableProps) {
  if (isLoading && !data.length) {
    // Use the SlotSpinner component when loading
    return <SlotSpinner isLoading={true} />;
  }

  if (error) {
    return <p className="text-center text-destructive text-lg py-8">{error}</p>;
  }

  if (!data.length && !isLoading) {
    return <p className="text-center text-foreground/70 text-lg py-8">No data to display. Try refreshing!</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border-2 border-primary/50 shadow-2xl bg-card/70 backdrop-blur-sm">
      <Table className="min-w-full">
        <TableHeader className="bg-primary/20">
          <TableRow className="border-b-2 border-primary/50">
            <TableHead className="w-[80px] text-center font-headline text-lg text-primary-foreground/90 py-3">Rank</TableHead>
            <TableHead className="font-headline text-lg text-primary-foreground/90 py-3">Username</TableHead>
            <TableHead className="text-right font-headline text-lg text-primary-foreground/90 py-3 pr-6">Wager Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry, index) => (
            <TableRow 
              key={entry.id} 
              className={`border-b border-primary/20 transition-opacity duration-500 ease-in-out hover:bg-accent/20 ${isLoading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}
            >
              <TableCell className="text-center font-bold text-xl py-4">
                <div className="flex items-center justify-center space-x-2">
                  {rankIcons[index] || <span className="text-foreground/80">{index + 1}</span>}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center space-x-3">
                  <Image
                    src={entry.avatar || `https://placehold.co/40x40.png?text=${entry.username.substring(0,2).toUpperCase()}`}
                    alt={`${entry.username}'s avatar`}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-accent/70 shadow-md"
                    data-ai-hint="player avatar"
                  />
                  <span className="font-medium text-foreground text-base">{entry.username}</span>
                  <span className="opacity-80 ml-1">
                    <FlairIconDisplay />
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right py-4 pr-6">
                <span className="font-bold text-accent text-lg tracking-wider">
                  ${entry.wagerAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
