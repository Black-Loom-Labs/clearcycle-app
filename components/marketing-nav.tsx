"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

const CONTACT_HREF = "/contact"

const navLinks = [
  { href: "#solution", label: "Product" },
  { href: "#payer-intelligence", label: "ClearCheck" },
  { href: "#impact", label: "Impact" },
  { href: "/docs", label: "Developers" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
]

export function MarketingNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="w-full border-b border-[#BFDBFE] bg-[#EEF4FF] px-4 py-2 text-center text-xs font-medium text-[#1557D4]">
        Limited slots open: free TPA leakage audit for hospitals joining the pilot.{" "}
        <a href="#audit" className="font-semibold underline hover:opacity-80">Claim yours →</a>
      </div>
    <header className="sticky top-0 z-50 border-b border-[#E8E4D8] bg-[#FEFCF8]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 xl:px-10">
        <Link href="/" aria-label="ClearCycle home" onClick={() => setOpen(false)}>
          <Logo className="h-9 w-auto sm:h-10" />
        </Link>

        {/* Desktop nav — hidden below lg */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
          {navLinks.map((l) =>
            l.href.startsWith("/") ? (
              <Link key={l.label} href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ) : (
              <a key={l.label} href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </a>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={<a href="https://app.clearcycle.in/dashboard">Login</a>}
            variant="ghost"
            className="hidden sm:inline-flex"
          />
          <Button
            nativeButton={false}
            render={<a href={CONTACT_HREF}>Contact Sales</a>}
            className="bg-[#1E6BFF] text-white hover:bg-[#1E6BFF]/90"
          />
          {/* Hamburger — visible below lg */}
          <button
            className="ml-1 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-[#E8E4D8] bg-[#FEFCF8] lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            {navLinks.map((l) =>
              l.href.startsWith("/") ? (
                <Link
                  key={l.label}
                  href={l.href}
                  className="border-b border-muted py-3 text-sm font-medium text-foreground last:border-0 hover:text-[#1E6BFF]"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  className="border-b border-muted py-3 text-sm font-medium text-foreground last:border-0 hover:text-[#1E6BFF]"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </a>
              )
            )}
            <a
              href="https://app.clearcycle.in/dashboard"
              className="py-3 text-sm font-medium text-muted-foreground hover:text-foreground sm:hidden"
              onClick={() => setOpen(false)}
            >
              Login
            </a>
          </nav>
        </div>
      )}
    </header>
    </>
  )
}
