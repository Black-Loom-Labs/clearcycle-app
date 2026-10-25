import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Logo } from "@/components/logo"
import { MarketingFooter } from "@/components/marketing-footer"
import {
  TrendingDown,
  Clock,
  AlertTriangle,
  FileX,
  Brain,
  FileCheck,
  BarChart2,
  GitBranch,
  Send,
  MessageSquare,
  Zap,
  TrendingUp,
  ShieldAlert,
  PieChart,
  CheckCircle2,
  ScanLine,
  LineChart,
  Target,
} from "lucide-react"

export const metadata: Metadata = {
  title: "ClearCycle — AI Claims Intelligence for Indian Hospitals",
  description:
    "ClearCycle automates insurance claim coding, TPA submission and denial appeals for Indian private hospitals. Recover ₹20–36 lakhs per month with AI.",
  alternates: { canonical: "https://clearcycle.in" },
}

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ClearCycle",
  url: "https://clearcycle.in",
  logo: "https://clearcycle.in/logo.svg",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-91632-36777",
    contactType: "sales",
    areaServed: "IN",
    availableLanguage: "en",
  },
  sameAs: [],
}

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ClearCycle",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://clearcycle.in",
  description:
    "AI-powered revenue cycle management platform for Indian private hospitals. Automates ICD-10 coding, TPA claim submission, policy adjudication, and denial appeal letters.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    description: "3-month free pilot for early hospitals",
  },
  featureList: [
    "AI Medical Coding (ICD-10, CPT)",
    "Policy Adjudication",
    "ML Payer Intelligence — per-line deduction probability scoring",
    "Autonomous TPA Submission",
    "IRDAI-Compliant Appeal Letters",
    "NHCX FHIR R4 Bundle Generation",
    "3-Gate Doctor Approval Workflow",
    "DPDP Act 2023 Compliant",
  ],
}

const CONTACT_MAILTO = "mailto:gauravhira24@gmail.com"

const problems = [
  {
    icon: TrendingDown,
    title: "₹8,000 Crore Lost Every Year",
    description:
      "Indian private hospitals lose 15–25% of billable revenue to claim denials and underpayments — often for avoidable coding and documentation errors.",
  },
  {
    icon: Clock,
    title: "45–90 Days to Settlement",
    description:
      "Cash flow paralysis. Billing staff spend more time chasing TPAs than serving patients, with no visibility into where claims stand.",
  },
  {
    icon: AlertTriangle,
    title: "Submitting Blind",
    description:
      "No awareness that Star Health rejects 34% of ortho claims without an implant invoice, or that ICICI Lombard systematically deducts room upgrade charges.",
  },
  {
    icon: FileX,
    title: "3–5 Hours Per Appeal",
    description:
      "Every denial requires manual research, letter drafting, and resubmission. Most small hospitals have no dedicated RCM team to handle this at scale.",
  },
]

const solutions = [
  {
    icon: Brain,
    title: "AI Medical Coding",
    description:
      "Reads discharge summaries and assigns ICD-10 and CPT codes with confidence scores, CCI edit validation, and MUE checks.",
  },
  {
    icon: FileCheck,
    title: "Policy Adjudication",
    description:
      "Evaluates coding against TPA rule sets. Calculates exact insurer payment and patient liability before discharge.",
  },
  {
    icon: BarChart2,
    title: "ML Payer Intelligence",
    description:
      "Per-line deduction probability scoring before you submit. LightGBM model trained on carrier rejection history. Flags high-risk lines with the exact reason and suggested fix.",
  },
  {
    icon: GitBranch,
    title: "3-Gate Approval Workflow",
    description:
      "Doctor approves via SMS OTP. Billing reviews financials. Admin gives final sign-off. All digital, all auditable.",
  },
  {
    icon: Send,
    title: "Autonomous TPA Submission",
    description:
      "Submits to TPA portal automatically after approval. Status tracked daily. Denial triggers appeal letter instantly.",
  },
  {
    icon: MessageSquare,
    title: "Appeal Letter Generation",
    description:
      "IRDAI-compliant appeal letter in 60 seconds. Cites denial reason, clinical evidence, and policy terms.",
  },
]

const whyNow = [
  {
    icon: Zap,
    title: "NHCX Going Mainstream",
    description:
      "IRDAI pushing digital claims standardisation. 83 payers and 42,000+ hospitals already onboarded.",
  },
  {
    icon: TrendingUp,
    title: "Market Growing 15% YoY",
    description:
      "More policies, more claims, more complexity. Manual teams cannot scale without automation.",
  },
  {
    icon: ShieldAlert,
    title: "Denial Rates Rising",
    description:
      "TPAs tightening rejection criteria year on year. Star Health denial rates up 23% in 2 years.",
  },
  {
    icon: PieChart,
    title: "Margins Under Pressure",
    description:
      "Revenue recovery is the fastest path to margin improvement without capital expenditure.",
  },
]

const roiRows = [
  { metric: "Claim processing time", before: "3–5 days", after: "4–6 hours" },
  { metric: "First-pass TPA acceptance", before: "65–70%", after: "85–90%" },
  { metric: "Appeal turnaround", before: "3–5 days", after: "Same day" },
  { metric: "TPA portal work per claim", before: "45–60 minutes", after: "Automated" },
  { metric: "Revenue recovered monthly", before: "Baseline", after: "+₹20–36 lakhs" },
]

const compliance = [
  "DPDP Act 2023 — processing basis documented for every data touch",
  "7-year claim audit trail per IRDAI guidelines",
  "ICD-10-CM with CCI edits and MUE validation built in",
  "NHCX-ready FHIR R4 claim bundle generation",
  "AWS ap-south-1 — patient data never leaves India",
  "Doctor OTP sign-off — medicolegally defensible record",
]

export default function Home() {
  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" aria-label="ClearCycle home">
            <Logo className="h-9 w-auto sm:h-10" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
            <a href="#solution" className="hover:text-foreground transition-colors">Product</a>
            <a href="#payer-intelligence" className="hover:text-foreground transition-colors">Payer Intelligence</a>
            <a href="#impact" className="hover:text-foreground transition-colors">Impact</a>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              nativeButton={false}
              render={<a href="https://app.clearcycle.in/dashboard">Login</a>}
              variant="ghost"
            />
            <Button
              nativeButton={false}
              render={<a href={CONTACT_MAILTO}>Contact Sales</a>}
              className="bg-[#1E6BFF] text-white hover:bg-[#1E6BFF]/90"
            />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="grid min-h-screen grid-cols-1 bg-[#0F1F3D] lg:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-24 sm:px-6 lg:px-16 lg:py-0">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Your billing team is losing crores to a broken claims process.
          </h1>
          <p className="mt-6 max-w-xl text-base text-white/60 sm:text-lg">
            ClearCycle automates the entire claim lifecycle — from discharge summary to TPA
            settlement. ML payer intelligence scores every line for deduction risk before you
            submit.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              nativeButton={false}
              render={<a href={CONTACT_MAILTO}>Contact Sales</a>}
              size="lg"
              className="bg-[#1E6BFF] text-white hover:bg-[#1E6BFF]/90"
            />
            <Button
              nativeButton={false}
              render={<a href="#solution">See How It Works</a>}
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            />
          </div>
        </div>
        <div className="relative hidden items-center justify-center overflow-hidden px-10 lg:flex">
          <div className="relative w-full max-w-xl rotate-1">
            <Image
              src="/dashboard-preview.png"
              alt="ClearCycle dashboard"
              width={1280}
              height={800}
              className="w-full rounded-xl shadow-2xl ring-1 ring-white/10"
              priority
            />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground">
            THE PROBLEM
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold sm:text-3xl">
            Manual billing is costing your hospital more than you think.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {problems.map((item) => (
              <Card key={item.title}>
                <CardContent className="flex flex-col gap-3">
                  <item.icon className="size-8 text-[#1E6BFF]" />
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="bg-[#EAF2FF] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground">
            THE SOLUTION
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold sm:text-3xl">
            One platform. The entire claim lifecycle.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((item) => (
              <Card key={item.title} className="bg-white">
                <CardContent className="flex flex-col gap-3">
                  <item.icon className="size-8 text-[#1E6BFF]" />
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Payer Intelligence Deep-Dive */}
      <section id="payer-intelligence" className="bg-[#0F1F3D] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-widest text-[#1E6BFF]">
            ML PAYER INTELLIGENCE
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold text-white sm:text-3xl">
            Know your deduction risk before you hit submit.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-white/60">
            Our LightGBM model learns carrier-specific rejection patterns from your hospital&apos;s
            own remittance history. Every claim line gets a deduction probability score, a predicted
            amount, and a suggested action — before you submit to the TPA.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <ScanLine className="size-8 text-[#1E6BFF]" />
              <h3 className="mt-3 font-semibold text-white">Pre-Submission Risk Score</h3>
              <p className="mt-2 text-sm text-white/60">
                Each procedure line gets a deduction probability (0–100%) and risk tier —
                High, Medium, or Low — based on your payer&apos;s historical behaviour on that CPT/ICD
                combination.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <LineChart className="size-8 text-[#1E6BFF]" />
              <h3 className="mt-3 font-semibold text-white">Expected Deduction Forecast</h3>
              <p className="mt-2 text-sm text-white/60">
                Know the rupee impact before settlement. Per-line expected deduction and total
                collection rate help your billing team prioritise which claims to review before
                submission.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <Target className="size-8 text-[#1E6BFF]" />
              <h3 className="mt-3 font-semibold text-white">Gets Smarter Over Time</h3>
              <p className="mt-2 text-sm text-white/60">
                The model fine-tunes on your hospital&apos;s actual remittance data — so predictions
                improve as your claim history grows. Carrier profiles cover Star Health, ICICI
                Lombard, SBI General, Bajaj Allianz, Tata AIG, and Medi Assist.
              </p>
            </div>
          </div>
          <div className="mt-8 rounded-xl border border-[#1E6BFF]/30 bg-[#1E6BFF]/10 px-6 py-5">
            <p className="text-sm text-white/80">
              <span className="font-semibold text-white">How it works: </span>
              Upload your discharge summary → AI codes the claim → Payer Intelligence scores every
              line → High-risk lines flagged with exact reason (e.g. &quot;Star Health rejects
              implant-only CPT without attached invoice&quot;) → Billing team corrects before submission
              → First-pass acceptance rate improves from ~68% to ~88%.
            </p>
          </div>
        </div>
      </section>

      {/* Why Now */}
      <section className="bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground">
            WHY NOW
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold sm:text-3xl">
            The Indian health insurance market is at an inflection point.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyNow.map((item) => (
              <Card key={item.title}>
                <CardContent className="flex flex-col gap-3">
                  <item.icon className="size-8 text-[#1E6BFF]" />
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ROI */}
      <section id="impact" className="bg-[#0F1F3D] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold tracking-widest text-white/50">THE IMPACT</p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold text-white sm:text-3xl">
            What changes at a hospital billing ₹2 crore per month.
          </h2>
          <div className="mt-10 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-white/50">
                  <th className="px-5 py-3 font-medium">Metric</th>
                  <th className="px-5 py-3 font-medium">Before</th>
                  <th className="px-5 py-3 font-medium">After ClearCycle</th>
                </tr>
              </thead>
              <tbody>
                {roiRows.map((row, i) => (
                  <tr
                    key={row.metric}
                    className={i !== roiRows.length - 1 ? "border-b border-white/10" : ""}
                  >
                    <td className="px-5 py-4 text-white">{row.metric}</td>
                    <td className="px-5 py-4 text-white/50">{row.before}</td>
                    <td className="px-5 py-4 font-bold text-[#1E6BFF]">{row.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 rounded-xl border border-[#1E6BFF]/30 bg-[#1E6BFF]/10 px-6 py-5 text-center text-white">
            <span className="font-semibold">₹20–36 lakhs</span> recovered per month vs{" "}
            <span className="font-semibold">₹2–4 lakhs</span> cost. ROI visible within 30 days.
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="bg-white px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground">
            BUILT FOR INDIAN HEALTHCARE
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold sm:text-3xl">
            Compliance is not an afterthought.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {compliance.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#1E6BFF]" />
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1E6BFF] px-4 py-20 text-center sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to recover what your hospital is owed?
          </h2>
          <p className="mt-4 text-white/70">
            We&apos;re offering a 3-month free pilot to the first hospitals we onboard. No
            commitment. Full pipeline live within 2 weeks.
          </p>
          <Button
            nativeButton={false}
            render={<a href={CONTACT_MAILTO}>Contact Sales</a>}
            size="lg"
            className="mt-8 bg-white text-[#0F1F3D] hover:bg-white/90"
          />
          <p className="mt-5 text-sm text-white/60">
            gauravhira24@gmail.com · +91 91632 36777
          </p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
