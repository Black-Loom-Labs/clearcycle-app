import Link from "next/link";
import { Logo } from "@/components/logo";

export function MarketingFooter() {
  return (
    <footer className="bg-[#0F1F3D] px-4 py-10 sm:px-6 xl:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Logo className="h-8 w-auto" />
            <p className="mt-3 text-sm text-white/50">
              AI-powered claims intelligence for Indian private hospitals.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Product
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li>
                <Link href="/#solution" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#impact" className="hover:text-white transition-colors">
                  ROI & Impact
                </Link>
              </li>
              <li>
                <Link href="https://app.clearcycle.in/dashboard" className="hover:text-white transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Resources
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li>
                <Link href="/docs" className="hover:text-white transition-colors">
                  API Docs
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Legal
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">© 2026 ClearCycle. All rights reserved. · clearcycle.in</p>
          <p className="text-sm text-white/40">
            <a href="mailto:hello@clearcycle.in" className="hover:text-white/70 transition-colors">
              hello@clearcycle.in
            </a>{" "}
            · +91 91632 36777
          </p>
        </div>
      </div>
    </footer>
  );
}
