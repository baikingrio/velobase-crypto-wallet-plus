"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ExternalLink, Loader2, TrendingUp } from "lucide-react";
import { ProductShell } from "@/components/product/product-shell";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { track } from "@/analytics";
import { WALLET_EVENTS } from "@/analytics/events/wallet";
import { toast } from "sonner";

export function EarnPage() {
  const t = useTranslations("product.earn");
  const { data: session } = useSession();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState("100");

  const { data: products, isLoading } = api.earn.listProducts.useQuery({
    limit: 20,
  });

  const { data: positions } = api.earn.listPositions.useQuery(
    { limit: 10 },
    { enabled: !!session },
  );

  const openPosition = api.earn.openPosition.useMutation({
    onSuccess: () => {
      toast.success(t("positionOpened"));
      setSelectedId(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const selected = products?.items.find((p) => p.id === selectedId);

  return (
    <ProductShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {session && positions && positions.items.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              {t("myPositions")}
            </h2>
            {positions.items.map((pos) => (
              <div
                key={pos.id}
                className="rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-sm"
              >
                <p className="font-medium">{pos.product.name}</p>
                <p className="text-muted-foreground">
                  {pos.depositedAmount} · APY {pos.product.apy}%
                </p>
              </div>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {products?.items.map((product) => (
              <div
                key={product.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.protocol} · {product.chain}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-400">
                      {product.apy}%
                    </p>
                    <p className="text-xs text-muted-foreground">APY</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      track(WALLET_EVENTS.EARN_PRODUCT_VIEWED, {
                        productId: product.id,
                      });
                      window.open(product.externalUrl, "_blank", "noopener");
                    }}
                  >
                    <ExternalLink className="mr-1 h-3 w-3" />
                    {t("openProtocol")}
                  </Button>
                  {session && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedId(product.id)}
                    >
                      <TrendingUp className="mr-1 h-3 w-3" />
                      {t("trackPosition")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("trackPosition")}</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{selected.name}</p>
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t("amountPlaceholder")}
                />
                <Button
                  className="w-full"
                  disabled={openPosition.isPending}
                  onClick={() => {
                    track(WALLET_EVENTS.EARN_POSITION_OPENED, {
                      productId: selected.id,
                    });
                    openPosition.mutate({
                      productId: selected.id,
                      depositedAmount: amount,
                    });
                  }}
                >
                  {t("confirmTrack")}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProductShell>
  );
}
