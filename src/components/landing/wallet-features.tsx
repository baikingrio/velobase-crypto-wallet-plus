"use client";

import { ArrowLeftRight, Compass, Layers, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function WalletFeatures() {
  const t = useTranslations("landing.features");

  const features = [
    {
      icon: Layers,
      key: "multiChain" as const,
      color: "text-blue-500",
    },
    {
      icon: TrendingUp,
      key: "earn" as const,
      color: "text-emerald-500",
    },
    {
      icon: ArrowLeftRight,
      key: "swap" as const,
      color: "text-purple-500",
    },
    {
      icon: Compass,
      key: "discover" as const,
      color: "text-orange-500",
    },
  ];

  return (
    <section className="w-full py-24 px-6 relative overflow-hidden bg-background">
      <div className="max-w-[1200px] mx-auto grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, key, color }) => (
          <div
            key={key}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <Icon className={cn("h-8 w-8 mb-4", color)} />
            <h3 className="font-semibold mb-2">{t(`${key}.title`)}</h3>
            <p className="text-sm text-muted-foreground">{t(`${key}.description`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
