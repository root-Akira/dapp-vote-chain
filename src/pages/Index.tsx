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

  console.log('Connected Account:', account);
  console.log('Admin Address:', ADMIN_ADDRESS);
  console.log('Is Admin:', isAdmin);

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
            {/* Admin Badge */}
            {isAdmin && (
              <div className="glass-card p-4 rounded-xl bg-accent/10 border-accent/30">
                <p className="text-center text-accent font-semibold">
                  🔑 Admin Mode Active - You have full control over the election
                </p>
              </div>
            )}

            {/* Status Section */}
            <ElectionStatus electionStarted={electionStarted} electionEnded={electionEnded} />

            {/* Admin Panel */}
            {isAdmin ? (
              <AdminPanel
                contract={contract}
                electionStarted={electionStarted}
                electionEnded={electionEnded}
                onUpdate={fetchElectionData}
              />
            ) : (
              <div className="glass-card p-6 rounded-2xl">
                <h2 className="text-xl font-bold mb-3">Admin Controls</h2>
                <p className="text-muted-foreground text-sm">
                  Only the admin wallet ({ADMIN_ADDRESS.slice(0, 6)}...{ADMIN_ADDRESS.slice(-4)}) can manage the election.
                </p>
                <p className="text-muted-foreground text-sm mt-2">
                  Admin can: Add candidates, Start election, End election
                </p>
              </div>
            )}

            {/* Winner Display */}
            {electionEnded && winner && (
              <WinnerDisplay winnerName={winner.name} winnerVotes={winner.votes} />
            )}

            {/* Candidates Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6">
                {electionEnded ? 'Final Results' : electionStarted ? 'Live Results' : 'Candidates'}
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
                  <p className="text-xl font-semibold mb-2">No candidates yet</p>
                  <p className="text-muted-foreground">
                    {isAdmin 
                      ? "Use the admin panel above to add candidates" 
                      : "The admin needs to add candidates to start the election"}
                  </p>
                </div>
              )}
            </div>

            {/* How to Use Section */}
            {!isAdmin && !electionStarted && candidates.length === 0 && (
              <div className="glass-card p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4">How This Works</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>✅ <strong>Step 1:</strong> Admin adds candidates</p>
                  <p>✅ <strong>Step 2:</strong> Admin starts the election</p>
                  <p>✅ <strong>Step 3:</strong> Voters cast their votes (one per wallet)</p>
                  <p>✅ <strong>Step 4:</strong> Admin ends the election</p>
                  <p>✅ <strong>Step 5:</strong> Winner is announced!</p>
                </div>
              </div>
            )}
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
