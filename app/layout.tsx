import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/cookie-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://clearcycle.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ClearCycle: AI Claims Intelligence for Indian Hospitals",
    template: "%s | ClearCycle",
  },
  description:
    "ClearCycle automates insurance claim coding, adjudication, TPA submission and appeal for Indian private hospitals. Recover ₹20-36 lakhs per month with AI.",
  keywords: [
    "hospital revenue cycle management India",
    "insurance claim automation India",
    "TPA claim submission software",
    "medical coding AI India",
    "ICD-10 coding automation",
    "claim denial management",
    "health insurance claim software India",
    "NHCX compliant software",
    "hospital billing software India",
    "RCM software India",
  ],
  authors: [{ name: "ClearCycle", url: SITE_URL }],
  creator: "ClearCycle",
  publisher: "ClearCycle",
  category: "Healthcare Technology",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "ClearCycle",
    title: "ClearCycle: AI Claims Intelligence for Indian Hospitals",
    description:
      "Automate insurance claim coding, adjudication, TPA submission and appeal. Recover ₹20-36 lakhs per month.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ClearCycle: AI Claims Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClearCycle: AI Claims Intelligence for Indian Hospitals",
    description:
      "Automate insurance claim coding, adjudication, TPA submission and appeal. Recover ₹20-36 lakhs per month.",
    images: ["/og-image.png"],
    creator: "@clearcycle_in",
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  }
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F7F8FA] text-[#0A0A0F]">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
