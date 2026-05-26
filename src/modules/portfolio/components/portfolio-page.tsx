"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Loader2, Wallet } from "lucide-react";
import { ProductShell } from "@/components/product/product-shell";
import { WalletConnectPanel } from "@/components/wallet/wallet-connect-panel";
import { useAuthStore } from "@/components/auth/store/auth-store";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { track } from "@/analytics";
import { WALLET_EVENTS } from "@/analytics/events/wallet";

function formatUsd(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function PortfolioPage() {
  const t = useTranslations("product.portfolio");
  const { data: session } = useSession();
  const { setLoginModalOpen } = useAuthStore();

  const { data, isLoading } = api.portfolio.getOverview.useQuery(undefined, {
    enabled: !!session,
  });

  const { data: connections } = api.wallet.listConnections.useQuery(undefined, {
    enabled: !!session,
  });

  useEffect(() => {
    if (session && data) {
      track(WALLET_EVENTS.PORTFOLIO_VIEWED, {
        totalUsd: data.totalUsd,
        isDemo: data.isDemo,
      });
    }
  }, [session, data]);

  return (
    <ProductShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {!session ? (
          <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
            <Wallet className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-4 text-sm text-muted-foreground">{t("signInPrompt")}</p>
            <Button onClick={() => setLoginModalOpen(true)}>{t("signIn")}</Button>
          </div>
        ) : (
          <>
            <WalletConnectPanel />

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6">
                  <p className="text-sm text-muted-foreground">{t("totalBalance")}</p>
                  <p className="mt-1 text-4xl font-bold tracking-tight">
                    {formatUsd(data?.totalUsd ?? 0)}
                  </p>
                  {data?.isDemo && (
                    <p className="mt-2 text-xs text-amber-500/90">{t("demoData")}</p>
                  )}
                </div>

                {connections && connections.length > 0 && (
                  <div className="space-y-2">
                    <h2 className="text-sm font-medium text-muted-foreground">
                      {t("connectedWallets")}
                    </h2>
                    {connections.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm"
                      >
                        <span className="font-mono text-xs truncate max-w-[200px]">
                          {c.address}
                        </span>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {c.chain}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <h2 className="text-sm font-medium text-muted-foreground">
                    {t("assets")}
                  </h2>
                  {(data?.tokens ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("noAssets")}</p>
                  ) : (
                    data?.tokens.map((token, i) => (
                      <div
                        key={`${token.chain}-${token.symbol}-${i}`}
                        className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">{token.symbol}</p>
                          <p className="text-xs text-muted-foreground">{token.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm">{token.balance}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatUsd(token.balanceUsd)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </ProductShell>
  );
}
