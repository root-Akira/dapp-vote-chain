import { Wallet, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletConnectProps {
  account: string;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletConnect = ({ account, isConnecting, onConnect, onDisconnect }: WalletConnectProps) => {
  return (
    <div className="flex justify-end">
      {account ? (
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 rounded-lg">
            <p className="text-sm font-medium">
              {account.slice(0, 6)}...{account.slice(-4)}
            </p>
          </div>
          <Button onClick={onDisconnect} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
      ) : (
        <Button 
          onClick={onConnect} 
          disabled={isConnecting}
          className="bg-gradient-to-r from-primary to-primary-glow glow-effect"
        >
          <Wallet className="w-4 h-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
    </div>
  );
};
