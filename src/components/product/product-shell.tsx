"use client";

import { Header } from "@/components/layout/header";
import { Background } from "@/components/layout/background";
import { ProductNav } from "@/components/product/product-nav";
import { cn } from "@/lib/utils";

interface ProductShellProps {
  children: React.ReactNode;
  className?: string;
}

export function ProductShell({ children, className }: ProductShellProps) {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Background />
      <Header />
      <main
        className={cn(
          "relative z-10 mx-auto max-w-lg px-4 pb-24 pt-20",
          className,
        )}
      >
        {children}
      </main>
      <ProductNav />
    </div>
  );
}
