"use client";

import { WalletProvider } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/components/auth/store/auth-store";
import { useEvmWallet } from "@/hooks/use-evm-wallet";
import { useSolanaWallet } from "@/hooks/use-solana-wallet";
import { api } from "@/trpc/react";
import { track } from "@/analytics";
import { WALLET_EVENTS } from "@/analytics/events/wallet";

export function WalletConnectPanel() {
  const t = useTranslations("product.wallet");
  const { data: session } = useSession();
  const { setLoginModalOpen } = useAuthStore();
  const utils = api.useUtils();
  const evm = useEvmWallet();
  const sol = useSolanaWallet();

  const connectMutation = api.wallet.connect.useMutation({
    onSuccess: () => {
      void utils.wallet.listConnections.invalidate();
      void utils.portfolio.getOverview.invalidate();
      track(WALLET_EVENTS.WALLET_CONNECTED, { chain: "connected" });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleConnectEvm = async () => {
    if (!session) {
      setLoginModalOpen(true);
      return;
    }
    try {
      const address = await evm.connect();
      if (!address) return;
      await connectMutation.mutateAsync({
        address,
        chain: "ETHEREUM",
        provider: WalletProvider.METAMASK,
      });
      toast.success(t("connectedEvm"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("connectFailed"));
    }
  };

  const handleConnectSol = async () => {
    if (!session) {
      setLoginModalOpen(true);
      return;
    }
    try {
      const address = await sol.connect();
      if (!address) return;
      await connectMutation.mutateAsync({
        address,
        chain: "SOLANA",
        provider: WalletProvider.PHANTOM,
      });
      toast.success(t("connectedSol"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("connectFailed"));
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        variant="outline"
        className="flex-1"
        onClick={() => void handleConnectEvm()}
        disabled={evm.isConnecting || connectMutation.isPending}
      >
        {t("connectEvm")}
      </Button>
      <Button
        variant="outline"
        className="flex-1"
        onClick={() => void handleConnectSol()}
        disabled={sol.isConnecting || connectMutation.isPending}
      >
        {t("connectSol")}
      </Button>
    </div>
  );
}
