import { Vote, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Candidate } from '@/hooks/useContract';

interface CandidateCardProps {
  candidate: Candidate;
  onVote: (id: bigint) => void;
  canVote: boolean;
  hasVoted: boolean;
  isWinner?: boolean;
}

export const CandidateCard = ({ candidate, onVote, canVote, hasVoted, isWinner }: CandidateCardProps) => {
  return (
    <Card className={`glass-card p-6 rounded-2xl transition-all hover:scale-105 ${isWinner ? 'ring-2 ring-accent glow-effect' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold">{candidate.name}</h3>
            {isWinner && <Trophy className="w-5 h-5 text-accent" />}
          </div>
          <p className="text-sm text-muted-foreground">Candidate #{candidate.id.toString()}</p>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold gradient-text">{candidate.voteCount.toString()}</span>
          <span className="text-sm text-muted-foreground">votes</span>
        </div>
      </div>

      {canVote && (
        <Button 
          onClick={() => onVote(candidate.id)}
          disabled={hasVoted}
          className="w-full bg-gradient-to-r from-primary to-accent"
        >
          <Vote className="w-4 h-4 mr-2" />
          {hasVoted ? 'Already Voted' : 'Cast Vote'}
        </Button>
      )}
    </Card>
  );
};
