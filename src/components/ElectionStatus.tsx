import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ElectionStatusProps {
  electionStarted: boolean;
  electionEnded: boolean;
}

export const ElectionStatus = ({ electionStarted, electionEnded }: ElectionStatusProps) => {
  const getStatus = () => {
    if (electionEnded) {
      return { text: 'Election Ended', icon: XCircle, variant: 'destructive' as const };
    }
    if (electionStarted) {
      return { text: 'Voting Active', icon: CheckCircle, variant: 'default' as const };
    }
    return { text: 'Not Started', icon: Clock, variant: 'secondary' as const };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <div className="glass-card p-6 rounded-2xl text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icon className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Election Status</h3>
      </div>
      <Badge variant={status.variant} className="text-sm px-4 py-1">
        {status.text}
      </Badge>
    </div>
  );
};
