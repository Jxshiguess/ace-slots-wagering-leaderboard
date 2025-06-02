
import { Cherry, Gem, DollarSign, Star, Bell, Zap, type LucideProps } from 'lucide-react';
import { useEffect, useState } from 'react';

const CherryIconComponent: React.FC<LucideProps> = (props) => <Cherry {...props} color="hsl(var(--destructive))" />;
const GemIconComponent: React.FC<LucideProps> = (props) => <Gem {...props} color="hsl(var(--primary))" />;
const DollarSignIconComponent: React.FC<LucideProps> = (props) => <DollarSign {...props} color="#4ade80" />;
const StarIconComponent: React.FC<LucideProps> = (props) => <Star {...props} color="#facc15" />;
const BellIconComponent: React.FC<LucideProps> = (props) => <Bell {...props} color="hsl(var(--accent))" />;
const ZapIconComponent: React.FC<LucideProps> = (props) => <Zap {...props} color="#f97316" />;

const ALL_SYMBOLS_COMPONENTS: React.FC<LucideProps>[] = [
  CherryIconComponent,
  GemIconComponent,
  DollarSignIconComponent,
  StarIconComponent,
  BellIconComponent,
  ZapIconComponent,
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
  // Pass the list of component functions directly
  availableSymbols: React.FC<LucideProps>[];
  duration: string;
  reelId: string;
}

const Reel: React.FC<ReelProps> = ({ availableSymbols, duration, reelId }) => {
  // Store shuffled indices referring to the availableSymbols array
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

  useEffect(() => {
    // Create an array of indices [0, 1, 2, ...]
    const indices = availableSymbols.map((_, i) => i);
    setShuffledIndices(shuffleArray(indices));
  }, [availableSymbols]);

  if (shuffledIndices.length === 0) {
    return <div className="h-20 w-20 bg-muted/10 rounded-lg shadow-inner" />;
  }
  
  // Duplicate indices for smooth looping
  const extendedIndices = [...shuffledIndices, ...shuffledIndices]; 

  return (
    <div className="h-20 w-20 overflow-hidden bg-card rounded-lg shadow-inner border border-primary/30 flex items-center justify-center relative">
      <div
        className="flex flex-col animate-slot-reel-spin"
        style={{ animationDuration: duration, animationName: `slot-reel-spin-${reelId}` }}
      >
        {extendedIndices.map((symbolIndex, i) => {
          // Get the component function from the original array using the index
          const SymbolComponent = availableSymbols[symbolIndex];
          if (!SymbolComponent) return null; // Should not happen if indices are correct
          return (
            <div key={`${reelId}-${i}-${symbolIndex}`} className="h-20 w-20 flex shrink-0 items-center justify-center">
              <SymbolComponent className="h-10 w-10" />
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-card/80 via-transparent to-card/80 pointer-events-none" />
    </div>
  );
};

export function SlotSpinner({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  const reelsData = [
    { duration: '0.4s', id: '1' },
    { duration: '0.5s', id: '2' },
    { duration: '0.3s', id: '3' },
  ];

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
          <Reel 
            key={index} 
            availableSymbols={ALL_SYMBOLS_COMPONENTS} 
            duration={reel.duration} 
            reelId={reel.id} 
          />
        ))}
      </div>
    </>
  );
}
