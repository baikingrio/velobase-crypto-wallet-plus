"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeftRight,
  Compass,
  LayoutDashboard,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/wallet", icon: LayoutDashboard, key: "home" as const },
  { href: "/earn", icon: TrendingUp, key: "earn" as const },
  { href: "/swap", icon: ArrowLeftRight, key: "swap" as const },
  { href: "/discover", icon: Compass, key: "discover" as const },
];

export function ProductNav() {
  const pathname = usePathname();
  const t = useTranslations("product.nav");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, key }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} />
              <span>{t(key)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
