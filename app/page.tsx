import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingNav } from "@/components/marketing-nav"
import { PreCheckDemo } from "@/components/pre-check-demo"
import { AuditForm } from "@/components/audit-form"
import { PayerLogoChip } from "@/components/payer-logo-chip"
import {
  Brain,
  FileCheck,
  BarChart2,
  GitBranch,
  Send,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"

export const metadata: Metadata = {
  title: "ClearCycle: AI Claims Intelligence for Indian Hospitals",
  description:
    "ClearCycle automates insurance claim coding, TPA submission and denial appeals for Indian private hospitals. Recover ₹20-36 lakhs per month with AI.",
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
    "ML Payer Intelligence: per-line deduction probability scoring",
    "Autonomous TPA Submission",
    "IRDAI-Compliant Appeal Letters",
    "NHCX FHIR R4 Bundle Generation",
    "3-Gate Doctor Approval Workflow",
    "DPDP Act 2023 Compliant",
  ],
}

const PAYERS = [
  { name: "Star Health", domain: "starhealth.in" },
  { name: "ICICI Lombard", domain: "icicilombard.com" },
  { name: "SBI General", domain: "sbigeneral.in" },
  { name: "HDFC Ergo", domain: "hdfcergo.com" },
  { name: "New India Assurance", domain: "newindia.co.in" },
  { name: "United India Insurance", domain: "unitedindiainsurance.co.in" },
  { name: "Bajaj Allianz", domain: "bajajallianz.com" },
  { name: "Medi Assist", domain: "mediassistindia.com" },
]

const impacts = [
  { stat: "₹8,000 Cr", label: "lost by Indian hospitals to TPA denials every year" },
  { stat: "34%", label: "of Star Health ortho claims rejected without implant invoice" },
  { stat: "₹20-36L", label: "recovered per month by hospitals on ClearCycle" },
]

const steps = [
  {
    n: "01",
    title: "Send us your remittance data",
    body: "6 months of TPA remittance files. We handle the rest.",
  },
  {
    n: "02",
    title: "We audit your leakage",
    body: "Our team maps every deduction pattern specific to your payer mix and flags exactly what's costing you.",
  },
  {
    n: "03",
    title: "See your number",
    body: "You get a report showing the exact amount your hospital is leaving on the table - and a clear action plan to recover it.",
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
      "Per-line deduction probability scoring before you submit. LightGBM model trained on carrier rejection history. Flags high-risk lines with the exact reason and fix.",
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

const roiRows = [
  { metric: "Claim processing time", before: "3-5 days", after: "4-6 hours" },
  { metric: "First-pass TPA acceptance", before: "65-70%", after: "85-90%" },
  { metric: "Appeal turnaround", before: "3-5 days", after: "Same day" },
  { metric: "TPA portal work per claim", before: "45-60 minutes", after: "Automated" },
  { metric: "Revenue recovered monthly", before: "Baseline", after: "+₹20-36 lakhs" },
]

const compliance = [
  "DPDP Act 2023: processing basis documented for every data touch",
  "7-year claim audit trail per IRDAI guidelines",
  "ICD-10-CM with CCI edits and MUE validation built in",
  "NHCX-ready FHIR R4 claim bundle generation",
  "AWS ap-south-1: patient data never leaves India",
  "Doctor OTP sign-off: medicolegally defensible record",
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
      <MarketingNav />

      {/* Hero */}
      <section className="bg-[#0F1F3D] px-4 pb-0 pt-16 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left */}
            <div className="pb-16 lg:pb-24">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1E6BFF]">
                ML Payer Intelligence
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-[3.25rem]">
                Your hospital is owed money it will never collect.
              </h1>
              <p className="mt-6 max-w-lg text-base text-white/60 sm:text-lg">
                TPA deductions happen silently. ClearCycle surfaces them before submission and
                improves first-pass acceptance from 68% to 88%.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#audit"
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#1E6BFF] px-7 text-sm font-semibold text-white transition hover:bg-[#1E6BFF]/90"
                >
                  Get your free audit <ArrowRight className="size-4" />
                </a>
                <a
                  href="#payer-intelligence"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/20 px-7 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  See it working
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/40">
                <span>3-month free pilot</span>
                <span>Full pipeline live in 2 weeks</span>
                <span>Data stays in India</span>
              </div>
            </div>

            {/* Right: payer intelligence demo (clipped at bottom, invites scroll) */}
            <div className="relative hidden overflow-hidden lg:block" style={{ maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)" }}>
              <div className="pointer-events-none select-none rounded-t-xl border border-white/10 bg-white/5 p-1">
                <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                  <span className="size-2.5 rounded-full bg-white/20" />
                  <span className="size-2.5 rounded-full bg-white/20" />
                  <span className="size-2.5 rounded-full bg-white/20" />
                  <span className="ml-3 text-xs text-white/30">ClearCycle - Payer Intelligence</span>
                </div>
                <PreCheckDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payer logos strip */}
      <section className="border-y border-[#E8E4D8] bg-[#FAF7F2] px-4 py-7 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-[#A09888]">
            42 behavioural profiles mapped across major Indian TPAs
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PAYERS.map((p) => (
              <PayerLogoChip key={p.name} name={p.name} domain={p.domain} />
            ))}
          </div>
        </div>
      </section>

      {/* Impact numbers */}
      <section className="bg-[#FEFCF8] px-4 py-16 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {impacts.map((item) => (
              <div key={item.stat} className="px-8 py-8 text-center first:pt-0 last:pb-0 sm:py-4 sm:first:pt-4 sm:last:pb-4">
                <p className="text-4xl font-bold text-[#0F1F3D]">{item.stat}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-[#F4F0E8] px-4 py-20 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            The problem
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold sm:text-3xl">
            Manual billing is breaking your revenue cycle.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <p className="text-3xl font-bold text-[#0F1F3D]">₹15-25%</p>
              <h3 className="mt-3 font-semibold">Revenue lost silently</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Not rejected outright. Quietly deducted. Room upgrades, missing invoices, coding
                mismatches. Most hospitals find out 60 days later when the remittance comes in short.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <p className="text-3xl font-bold text-[#0F1F3D]">45-90 days</p>
              <h3 className="mt-3 font-semibold">Cash flow paralysis</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Once a claim goes into the TPA portal, it disappears. Your billing team checks
                status manually. Denials arrive with vague reason codes. Nobody is watching.
              </p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <p className="text-3xl font-bold text-[#0F1F3D]">3-5 hrs</p>
              <h3 className="mt-3 font-semibold">Per appeal, per denial</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Research the denial. Find the policy clause. Draft the letter. Resubmit. For a
                billing team of 3, that&apos;s a full-time job just to chase what you were already owed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Payer Intelligence: hero feature */}
      <section id="payer-intelligence" className="bg-[#0F1F3D] px-4 py-20 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1E6BFF]">
            ML Payer Intelligence
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-xl text-2xl font-bold text-white sm:text-3xl">
              We know what Star Health will cut before you submit.
            </h2>
            <p className="max-w-md text-sm text-white/50 lg:text-right">
              LightGBM model trained on carrier rejection history. Every claim line gets a deduction
              probability, a predicted rupee amount, and a fix.
            </p>
          </div>

          <div className="mt-10">
            <PreCheckDemo />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-2xl font-bold text-[#1E6BFF]">42</p>
              <h3 className="mt-2 font-semibold text-white">Payer rejection profiles</h3>
              <p className="mt-1.5 text-sm text-white/50">
                Star Health, ICICI Lombard, SBI General, Bajaj Allianz, Tata AIG, Medi Assist
                and more - each with known deduction patterns.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-2xl font-bold text-[#1E6BFF]">68% → 88%</p>
              <h3 className="mt-2 font-semibold text-white">First-pass acceptance</h3>
              <p className="mt-1.5 text-sm text-white/50">
                The 20-point gap between what hospitals get and what they should get. We close it
                before the claim leaves the building.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-2xl font-bold text-[#1E6BFF]">Gets smarter</p>
              <h3 className="mt-2 font-semibold text-white">Trained on your data</h3>
              <p className="mt-1.5 text-sm text-white/50">
                The model fine-tunes on your hospital&apos;s own remittance history. Predictions improve
                as your claim volume grows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How the audit works */}
      <section className="bg-[#FEFCF8] px-4 py-20 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            How it starts
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold sm:text-3xl">
            We audit your leakage first. No pitch, just the numbers.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="flex flex-col gap-3">
                <p className="text-4xl font-bold text-[#E8E0D0]">{s.n}</p>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full platform */}
      <section id="solution" className="bg-[#F4F0E8] px-4 py-20 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            The platform
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold sm:text-3xl">
            One platform. The entire claim lifecycle.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((item) => (
              <div key={item.title} className="rounded-2xl bg-white p-6 shadow-sm">
                <item.icon className="size-8 text-[#1E6BFF]" />
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI */}
      <section id="impact" className="bg-[#0F1F3D] px-4 py-20 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/50">The impact</p>
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
            <span className="font-semibold">₹20-36 lakhs</span> recovered per month vs{" "}
            <span className="font-semibold">₹2-4 lakhs</span> cost. ROI visible within 30 days.
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="bg-[#FEFCF8] px-4 py-20 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Built for Indian healthcare
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

      {/* Audit CTA */}
      <section id="audit" className="bg-[#0F1F3D] px-4 py-20 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1E6BFF]">
            Free TPA leakage audit
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            Find out exactly how much your hospital is losing.
          </h2>
          <p className="mt-4 text-base text-white/60">
            Share 6 months of remittance data. We&apos;ll map your deduction patterns, identify the
            biggest recoverable amounts, and show you what ClearCycle would change. No pitch until
            you&apos;ve seen your number.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/40">
            <span>Spots limited to 5 hospitals this month</span>
            <span>·</span>
            <span>3-month pilot included, free</span>
            <span>·</span>
            <span>Data stays in India</span>
          </div>
          <div className="mt-10">
            <AuditForm />
          </div>
          <p className="mt-8 text-sm text-white/40">
            Prefer a call?{" "}
            <a href="tel:+919163236777" className="text-white/70 underline hover:text-white">
              +91 91632 36777
            </a>
            {" "}or{" "}
            <Link href="/contact" className="text-white/70 underline hover:text-white">
              fill out the full form
            </Link>
          </p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
