import { useState } from 'react';
import { UserPlus, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface AdminPanelProps {
  contract: any;
  electionStarted: boolean;
  electionEnded: boolean;
  onUpdate: () => void;
}

export const AdminPanel = ({ contract, electionStarted, electionEnded, onUpdate }: AdminPanelProps) => {
  const [candidateName, setCandidateName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddCandidate = async () => {
    if (!candidateName.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a candidate name",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const tx = await contract.addCandidate(candidateName);
      await tx.wait();
      
      toast({
        title: "Success",
        description: `Candidate "${candidateName}" added successfully`,
      });
      
      setCandidateName('');
      onUpdate();
    } catch (error: any) {
      console.error('Error adding candidate:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to add candidate",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartElection = async () => {
    try {
      setIsLoading(true);
      const tx = await contract.startElection();
      await tx.wait();
      
      toast({
        title: "Election Started",
        description: "Voting is now open",
      });
      
      onUpdate();
    } catch (error: any) {
      console.error('Error starting election:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to start election",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndElection = async () => {
    try {
      setIsLoading(true);
      const tx = await contract.endElection();
      await tx.wait();
      
      toast({
        title: "Election Ended",
        description: "Voting is now closed",
      });
      
      onUpdate();
    } catch (error: any) {
      console.error('Error ending election:', error);
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to end election",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card p-6 rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 gradient-text">Admin Controls</h2>
      
      <div className="space-y-4">
        {!electionStarted && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Add Candidate</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter candidate name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="bg-background/50 border-border"
              />
              <Button 
                onClick={handleAddCandidate}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-accent"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!electionStarted && (
            <Button 
              onClick={handleStartElection}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Election
            </Button>
          )}

          {electionStarted && !electionEnded && (
            <Button 
              onClick={handleEndElection}
              disabled={isLoading}
              variant="destructive"
              className="flex-1"
            >
              <Square className="w-4 h-4 mr-2" />
              End Election
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
