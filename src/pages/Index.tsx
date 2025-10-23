import { useState, useEffect } from 'react';
import { useContract, Candidate } from '@/hooks/useContract';
import { WalletConnect } from '@/components/WalletConnect';
import { ElectionStatus } from '@/components/ElectionStatus';
import { CandidateCard } from '@/components/CandidateCard';
import { AdminPanel } from '@/components/AdminPanel';
import { WinnerDisplay } from '@/components/WinnerDisplay';
import { ADMIN_ADDRESS } from '@/config/contract';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { account, contract, isConnecting, connectWallet, disconnectWallet } = useContract();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [electionStarted, setElectionStarted] = useState(false);
  const [electionEnded, setElectionEnded] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [winner, setWinner] = useState<{ name: string; votes: bigint } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = account.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  const fetchElectionData = async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      
      const [started, ended, allCandidates] = await Promise.all([
        contract.electionStarted(),
        contract.electionEnded(),
        contract.getAllCandidates()
      ]);

      setElectionStarted(started);
      setElectionEnded(ended);
      setCandidates(allCandidates);

      if (account) {
        const voted = await contract.hasVoted(account);
        setHasVoted(voted);
      }

      if (ended) {
        const [winnerName, winnerVotes] = await contract.getWinner();
        setWinner({ name: winnerName, votes: winnerVotes });
      }
    } catch (error) {
      console.error('Error fetching election data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchElectionData();
  }, [contract, account]);

  const handleVote = async (candidateId: bigint) => {
    if (!contract) return;

    try {
      const tx = await contract.vote(candidateId);
      await tx.wait();
      
      toast({
        title: "Vote Submitted",
        description: "Your vote has been recorded on the blockchain",
      });

      fetchElectionData();
    } catch (error: any) {
      console.error('Error voting:', error);
      toast({
        title: "Vote Failed",
        description: error.message || "Failed to submit vote",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-black mb-2 gradient-text">BlockVote</h1>
              <p className="text-muted-foreground">Decentralized Voting Platform</p>
            </div>
            <WalletConnect
              account={account}
              isConnecting={isConnecting}
              onConnect={connectWallet}
              onDisconnect={disconnectWallet}
            />
          </div>
        </header>

        {account ? (
          <div className="space-y-8">
            {/* Status Section */}
            <ElectionStatus electionStarted={electionStarted} electionEnded={electionEnded} />

            {/* Admin Panel */}
            {isAdmin && (
              <AdminPanel
                contract={contract}
                electionStarted={electionStarted}
                electionEnded={electionEnded}
                onUpdate={fetchElectionData}
              />
            )}

            {/* Winner Display */}
            {electionEnded && winner && (
              <WinnerDisplay winnerName={winner.name} winnerVotes={winner.votes} />
            )}

            {/* Candidates Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6">
                {electionEnded ? 'Final Results' : 'Candidates'}
              </h2>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : candidates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {candidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id.toString()}
                      candidate={candidate}
                      onVote={handleVote}
                      canVote={electionStarted && !electionEnded}
                      hasVoted={hasVoted}
                      isWinner={
                        electionEnded &&
                        winner?.name === candidate.name &&
                        winner?.votes === candidate.voteCount
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-12 rounded-2xl text-center">
                  <p className="text-muted-foreground">No candidates added yet</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card p-12 rounded-2xl text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-8">
              Connect your MetaMask wallet to participate in the election
            </p>
            <div className="flex justify-center">
              <WalletConnect
                account={account}
                isConnecting={isConnecting}
                onConnect={connectWallet}
                onDisconnect={disconnectWallet}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
