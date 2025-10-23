import { Trophy, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface WinnerDisplayProps {
  winnerName: string;
  winnerVotes: bigint;
}

export const WinnerDisplay = ({ winnerName, winnerVotes }: WinnerDisplayProps) => {
  return (
    <Card className="glass-card p-8 rounded-2xl text-center glow-effect ring-2 ring-accent">
      <div className="flex justify-center mb-4">
        <div className="relative">
          <Trophy className="w-16 h-16 text-accent" />
          <Sparkles className="w-6 h-6 text-accent absolute -top-2 -right-2 animate-pulse" />
        </div>
      </div>
      
      <h2 className="text-3xl font-bold mb-2 gradient-text">Election Winner</h2>
      <p className="text-4xl font-black mb-2">{winnerName}</p>
      <p className="text-xl text-muted-foreground">
        {winnerVotes.toString()} votes
      </p>
    </Card>
  );
};
