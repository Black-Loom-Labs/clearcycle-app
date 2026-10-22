"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" aria-label="ClearCycle home">
          <Logo className="h-9 w-auto sm:h-10" />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
          <Link href="/#solution" className="hover:text-foreground transition-colors">
            Product
          </Link>
          <Link href="/#impact" className="hover:text-foreground transition-colors">
            Impact
          </Link>
          <Link href="/blog" className="hover:text-foreground transition-colors">
            Blog
          </Link>
          <Link href="/faq" className="hover:text-foreground transition-colors">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            nativeButton={false}
            render={<Link href="https://app.clearcycle.in/dashboard">Login</Link>}
            variant="ghost"
          />
          <Button
            nativeButton={false}
            render={<a href="mailto:gauravhira24@gmail.com">Contact Sales</a>}
            className="bg-[#1E6BFF] text-white hover:bg-[#1E6BFF]/90"
          />
        </div>
      </div>
    </header>
  );
}
