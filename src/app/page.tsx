"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/layout/header";
import { Background } from "@/components/layout/background";
import { SiteFooter } from "@/components/layout/site-footer";
import { WalletFeatures } from "@/components/landing/wallet-features";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  const t = useTranslations("landing");
  const { data: session } = useSession();

  return (
    <div
      className={cn(
        "w-full bg-background text-foreground font-sans selection:bg-primary/30 relative",
        "min-h-screen overflow-y-auto overflow-x-hidden",
      )}
    >
      <Background />
      <Header />

      <main className="relative z-10 flex flex-col items-center w-full px-4 pt-24 pb-8 min-h-[calc(100vh-80px)]">
        <div className="relative w-full max-w-4xl mx-auto text-center mb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-both">
          <h1 className="font-poppins font-medium text-5xl md:text-7xl tracking-tight text-foreground drop-shadow-sm">
            {t("hero.titleLine1")}{" "}
            <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-emerald-500 to-purple-500 animate-gradient-x">
              {t("hero.titleLine2")}
            </span>
          </h1>
          <p className="font-sans text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto font-light tracking-wide">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link href={session ? "/wallet" : "/auth/signin"}>
                {t("hero.cta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/discover">{t("hero.ctaSecondary")}</Link>
            </Button>
          </div>
        </div>

        <WalletFeatures />
      </main>

      <SiteFooter />
    </div>
  );
}
