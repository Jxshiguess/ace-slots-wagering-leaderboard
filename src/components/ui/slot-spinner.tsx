
import { Cherry, Gem, DollarSign, Star, Bell, Zap, LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const ALL_SYMBOLS: React.FC<LucideProps>[] = [
  (props) => <Cherry {...props} color="hsl(var(--destructive))" />,
  (props) => <Gem {...props} color="hsl(var(--primary))" />,
  (props) => <DollarSign {...props} color="#4ade80" />, // Green
  (props) => <Star {...props} color="#facc15" />, // Yellow
  (props) => <Bell {...props} color="hsl(var(--accent))" />,
  (props) => <Zap {...props} color="#f97316" />, // Orange
];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface ReelProps {
  initialSymbols: React.FC<LucideProps>[];
  duration: string;
  reelId: string;
}

const Reel: React.FC<ReelProps> = ({ initialSymbols, duration, reelId }) => {
  const [symbols, setSymbols] = useState<React.FC<LucideProps>[]>([]);

  useEffect(() => {
    // Shuffle symbols on client-side to avoid hydration mismatch
    setSymbols(shuffleArray(initialSymbols));
  }, [initialSymbols]);

  if (symbols.length === 0) {
    // Render a placeholder or nothing until symbols are shuffled
    return <div className="h-20 w-20 bg-muted/10 rounded-lg shadow-inner" />;
  }
  
  const extendedSymbols = [...symbols, ...symbols]; // Duplicate for smooth looping

  return (
    <div className="h-20 w-20 overflow-hidden bg-card rounded-lg shadow-inner border border-primary/30 flex items-center justify-center relative">
      <div
        className="flex flex-col animate-slot-reel-spin"
        style={{ animationDuration: duration, animationName: `slot-reel-spin-${reelId}` }}
      >
        {extendedSymbols.map((SymbolComponent, i) => (
          <div key={i} className="h-20 w-20 flex shrink-0 items-center justify-center">
            <SymbolComponent className="h-10 w-10" />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-card/80 via-transparent to-card/80 pointer-events-none" />
    </div>
  );
};

export function SlotSpinner({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  const reelsData = [
    { symbols: ALL_SYMBOLS, duration: '0.4s', id: '1' },
    { symbols: ALL_SYMBOLS, duration: '0.5s', id: '2' },
    { symbols: ALL_SYMBOLS, duration: '0.3s', id: '3' },
  ];

  // Generate unique keyframe animations for each reel to ensure they can have different symbol orders
  // This is a bit of a hack due to Tailwind's static nature of animations
  // A more robust solution might involve dynamic style tags or more complex JS-driven animation
  const keyframesStyle = reelsData.map(reel => `
    @keyframes slot-reel-spin-${reel.id} {
      0% { transform: translateY(0%); }
      100% { transform: translateY(-50%); }
    }
  `).join('');


  return (
    <>
      <style>{keyframesStyle}</style>
      <div className="flex justify-center items-center space-x-3 sm:space-x-4 py-10" aria-busy="true" aria-live="polite">
        {reelsData.map((reel, index) => (
          <Reel key={index} initialSymbols={reel.symbols} duration={reel.duration} reelId={reel.id} />
        ))}
      </div>
    </>
  );
}
