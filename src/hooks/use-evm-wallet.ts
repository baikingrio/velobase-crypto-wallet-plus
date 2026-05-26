"use client";

import { useCallback, useState } from "react";

interface EvmWalletState {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
}

export function useEvmWallet() {
  const [state, setState] = useState<EvmWalletState>({
    address: null,
    chainId: null,
    isConnecting: false,
  });

  const connect = useCallback(async () => {
    const ethereum = (
      window as unknown as {
        ethereum?: {
          request: (args: {
            method: string;
          }) => Promise<string[] | string>;
        };
      }
    ).ethereum;

    if (!ethereum) {
      throw new Error("No EVM wallet detected. Install MetaMask.");
    }

    setState((s) => ({ ...s, isConnecting: true }));
    try {
      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      const chainIdHex = (await ethereum.request({
        method: "eth_chainId",
      })) as string;
      const chainId = parseInt(chainIdHex, 16);
      setState({
        address: accounts[0] ?? null,
        chainId,
        isConnecting: false,
      });
      return accounts[0] ?? null;
    } catch (err) {
      setState((s) => ({ ...s, isConnecting: false }));
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({ address: null, chainId: null, isConnecting: false });
  }, []);

  return { ...state, connect, disconnect };
}
