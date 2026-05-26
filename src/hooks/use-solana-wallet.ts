"use client";

import { useCallback, useState } from "react";

interface PhantomProvider {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  publicKey?: { toString: () => string };
  isPhantom?: boolean;
}

export function useSolanaWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const getProvider = useCallback((): PhantomProvider | null => {
    const phantom = (
      window as unknown as { phantom?: { solana?: PhantomProvider } }
    ).phantom?.solana;
    return phantom?.isPhantom ? phantom : null;
  }, []);

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      throw new Error("Phantom wallet not found.");
    }
    setIsConnecting(true);
    try {
      const resp = await provider.connect();
      const addr = resp.publicKey.toString();
      setAddress(addr);
      return addr;
    } finally {
      setIsConnecting(false);
    }
  }, [getProvider]);

  const disconnect = useCallback(async () => {
    const provider = getProvider();
    if (provider) {
      await provider.disconnect();
    }
    setAddress(null);
  }, [getProvider]);

  return { address, isConnecting, connect, disconnect };
}
