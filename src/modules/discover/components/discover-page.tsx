"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ExternalLink, Loader2, Star } from "lucide-react";
import { ProductShell } from "@/components/product/product-shell";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { track } from "@/analytics";
import { WALLET_EVENTS } from "@/analytics/events/wallet";

export function DiscoverPage() {
  const t = useTranslations("product.discover");
  const { data: session } = useSession();

  const { data: promoted } = api.discover.listPromoted.useQuery();
  const { data: dapps, isLoading } = api.discover.listDApps.useQuery({
    limit: 20,
  });

  const trackClick = api.discover.trackClick.useMutation();

  const handleOpen = (dappId: string, url: string) => {
    track(WALLET_EVENTS.DAPP_CLICKED, { dappId });
    if (session) {
      trackClick.mutate({ dappId });
    }
    window.open(url, "_blank", "noopener");
  };

  return (
    <ProductShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {promoted && promoted.length > 0 && (
          <div className="space-y-2">
            <h2 className="flex items-center gap-1 text-sm font-medium text-amber-400">
              <Star className="h-4 w-4" />
              {t("featured")}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {promoted.map((dapp) => (
                <button
                  key={dapp.id}
                  type="button"
                  onClick={() => handleOpen(dapp.id, dapp.url)}
                  className="min-w-[140px] shrink-0 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-left transition hover:bg-amber-500/20"
                >
                  <p className="font-semibold text-sm">{dapp.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {dapp.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {dapps?.items.map((dapp) => (
              <div
                key={dapp.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{dapp.name}</p>
                      {dapp.isPromoted && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-400">
                          {t("promoted")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {dapp.description}
                    </p>
                    <p className="mt-1 text-[10px] uppercase text-muted-foreground">
                      {dapp.category}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => handleOpen(dapp.id, dapp.url)}
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  {t("openDapp")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProductShell>
  );
}
