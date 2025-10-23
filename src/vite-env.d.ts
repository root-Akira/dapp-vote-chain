/// <reference types="vite/client" />

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeAllListeners: (event: string) => void;
    selectedAddress: string | null;
    isMetaMask?: boolean;
    send: (method: string, params: any[]) => Promise<any>;
  };
}
