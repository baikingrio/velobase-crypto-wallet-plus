"use client";

import { useState } from "react";
import type { WalletChain } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ArrowDown, Loader2 } from "lucide-react";
import { ProductShell } from "@/components/product/product-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/components/auth/store/auth-store";
import { api } from "@/trpc/react";
import { track } from "@/analytics";
import { WALLET_EVENTS } from "@/analytics/events/wallet";
import { toast } from "sonner";

export function SwapPage() {
  const t = useTranslations("product.swap");
  const { data: session } = useSession();
  const { setLoginModalOpen } = useAuthStore();

  const [chain, setChain] = useState<WalletChain>("ETHEREUM");
  const [fromToken, setFromToken] = useState("ETH");
  const [toToken, setToToken] = useState("USDC");
  const [fromAmount, setFromAmount] = useState("0.1");
  const [quote, setQuote] = useState<{
    toAmount: string;
    feeAmount: string;
    feeBps: number;
    aggregator: string;
  } | null>(null);

  const quoteQuery = api.swap.getQuote.useQuery(
    { chain, fromToken, toToken, fromAmount },
    { enabled: false },
  );

  const createOrder = api.swap.createOrder.useMutation();
  const confirmOrder = api.swap.confirmOrder.useMutation();

  const handleGetQuote = async () => {
    if (!session) {
      setLoginModalOpen(true);
      return;
    }
    track(WALLET_EVENTS.SWAP_INITIATED, { chain, fromToken, toToken });
    const result = await quoteQuery.refetch();
    if (result.data) {
      setQuote(result.data);
    } else if (result.error) {
      toast.error(result.error.message);
    }
  };

  const handleSwap = async () => {
    if (!session || !quote) return;
    try {
      const order = await createOrder.mutateAsync({
        chain,
        fromToken,
        toToken,
        fromAmount,
      });
      const confirmed = await confirmOrder.mutateAsync({
        orderId: order.id,
        txHash: `demo-${Date.now()}`,
        toAmount: quote.toAmount,
      });
      track(WALLET_EVENTS.SWAP_COMPLETED, {
        orderId: confirmed.id,
        chain,
      });
      toast.success(t("swapSuccess"));
      setQuote(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("swapFailed"));
    }
  };

  const tokens =
    chain === "SOLANA" ? ["SOL", "USDC"] : ["ETH", "USDC", "USDT"];

  return (
    <ProductShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
          <Select
            value={chain}
            onValueChange={(v) => {
              setChain(v as WalletChain);
              setFromToken(v === "SOLANA" ? "SOL" : "ETH");
              setToToken("USDC");
              setQuote(null);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ETHEREUM">Ethereum</SelectItem>
              <SelectItem value="SOLANA">Solana</SelectItem>
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">{t("from")}</label>
            <div className="flex gap-2">
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((tok) => (
                    <SelectItem key={tok} value={tok}>
                      {tok}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={fromAmount}
                onChange={(e) => {
                  setFromAmount(e.target.value);
                  setQuote(null);
                }}
                className="font-mono"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">{t("to")}</label>
            <div className="flex gap-2">
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens
                    .filter((tok) => tok !== fromToken)
                    .map((tok) => (
                      <SelectItem key={tok} value={tok}>
                        {tok}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Input
                readOnly
                value={quote?.toAmount ?? "—"}
                className="font-mono bg-muted/30"
              />
            </div>
          </div>

          {quote && (
            <div className="rounded-lg bg-muted/20 p-3 text-xs text-muted-foreground space-y-1">
              <p>
                {t("fee")}: {quote.feeAmount} ({quote.feeBps} bps)
              </p>
              <p>
                {t("aggregator")}: {quote.aggregator}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => void handleGetQuote()}
              disabled={quoteQuery.isFetching || !session}
            >
              {quoteQuery.isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("getQuote")
              )}
            </Button>
            <Button
              className="flex-1"
              onClick={() => void handleSwap()}
              disabled={!quote || createOrder.isPending || !session}
            >
              {t("swap")}
            </Button>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground">{t("disclaimer")}</p>
      </div>
    </ProductShell>
  );
}
