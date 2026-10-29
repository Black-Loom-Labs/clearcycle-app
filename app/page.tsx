import type { Metadata } from "next"
import Link from "next/link"
import { MarketingFooter } from "@/components/marketing-footer"
import { MarketingNav } from "@/components/marketing-nav"
import { PreCheckDemo } from "@/components/pre-check-demo"
import { AuditForm } from "@/components/audit-form"
import { PayerLogoChip } from "@/components/payer-logo-chip"
import { WorkflowDiagram } from "@/components/workflow-diagram"
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
}

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ClearCycle",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://clearcycle.in",
  description:
    "AI-powered revenue cycle management platform for Indian private hospitals.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    description: "3-month free pilot for early hospitals",
  },
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
    title: "ClearCheck",
    description:
      "Per-line deduction probability scoring before you submit. Flags high-risk lines with the exact reason and fix.",
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
  "Patient data processed and stored in India only - never leaves the country",
  "Doctor OTP sign-off: medicolegally defensible record",
]

export default function Home() {
  return (
    <div className="flex flex-col bg-[#FEFCF8]">
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
      <section className="px-4 pb-0 pt-16 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div className="pb-12 lg:pb-20">
              <span className="inline-flex items-center rounded-full border border-[#1E6BFF]/20 bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#1E6BFF]">
                ClearCheck
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight text-[#0F1F3D] sm:text-5xl lg:text-[3.25rem]">
                Your hospital is owed money it will never collect.
              </h1>
              <p className="mt-5 max-w-lg text-base text-[#5C5C6B] sm:text-lg">
                TPA deductions happen silently. ClearCycle surfaces them before submission and
                improves first-pass acceptance from 68% to 88%.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#audit"
                  className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#1E6BFF] px-7 text-sm font-semibold text-white transition hover:bg-[#1557D4]"
                >
                  Get your free audit <ArrowRight className="size-4" />
                </a>
                <a
                  href="#payer-intelligence"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-[#E0DAD0] px-7 text-sm font-semibold text-[#0F1F3D] transition hover:bg-[#F4F0E8]"
                >
                  See it working
                </a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#A09888]">
                <span>3-month free pilot</span>
                <span>Full pipeline live in 2 weeks</span>
                <span>Data stays in India</span>
              </div>
            </div>

            {/* Right: payer intelligence demo clipped at bottom */}
            <div
              className="relative hidden overflow-hidden rounded-t-2xl border border-[#E8E4D8] bg-[#FAFAF8] shadow-lg lg:block"
              style={{ maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)" }}
            >
              <div className="flex items-center gap-1.5 border-b border-[#EAE6DE] bg-white px-4 py-2.5">
                <span className="size-2.5 rounded-full bg-[#E8E4D8]" />
                <span className="size-2.5 rounded-full bg-[#E8E4D8]" />
                <span className="size-2.5 rounded-full bg-[#E8E4D8]" />
                <span className="ml-3 text-xs text-[#B0A898]">ClearCycle - Payer Intelligence</span>
              </div>
              <div className="pointer-events-none select-none">
                <PreCheckDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payer logos strip */}
      <section className="border-y border-[#EAE6DE] bg-white px-4 py-7 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-[#B0A898]">
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
          <div className="grid grid-cols-1 divide-y divide-[#EAE6DE] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {impacts.map((item) => (
              <div key={item.stat} className="px-8 py-8 text-center first:pt-0 last:pb-0 sm:py-4 sm:first:pt-4 sm:last:pb-4">
                <p className="text-4xl font-bold text-[#0F1F3D]">{item.stat}</p>
                <p className="mt-2 text-sm text-[#8A8070]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-white px-4 py-20 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B0A898]">
            The problem
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold text-[#0F1F3D] sm:text-3xl">
            Manual billing is breaking your revenue cycle.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                stat: "₹15-25%",
                title: "Revenue lost silently",
                body: "Not rejected outright. Quietly deducted. Room upgrades, missing invoices, coding mismatches. Most hospitals find out 60 days later when the remittance comes in short.",
              },
              {
                stat: "45-90 days",
                title: "Cash flow paralysis",
                body: "Once a claim goes into the TPA portal, it disappears. Your billing team checks status manually. Denials arrive with vague reason codes. Nobody is watching.",
              },
              {
                stat: "3-5 hrs",
                title: "Per appeal, per denial",
                body: "Research the denial. Find the policy clause. Draft the letter. Resubmit. For a billing team of 3, that's a full-time job just to chase what you were already owed.",
              },
            ].map((c) => (
              <div key={c.stat} className="rounded-2xl border border-[#EAE6DE] bg-[#FEFCF8] p-8">
                <p className="text-3xl font-bold text-[#1E6BFF]">{c.stat}</p>
                <h3 className="mt-3 font-semibold text-[#0F1F3D]">{c.title}</h3>
                <p className="mt-2 text-sm text-[#8A8070]">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow diagram */}
      <section className="bg-[#FEFCF8] px-4 py-20 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B0A898]">
            How it works
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold text-[#0F1F3D] sm:text-3xl">
            From admission to settlement - nothing falls through.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-[#8A8070]">
            Every step in the claim journey automated, every decision auditable, every rupee tracked.
          </p>
          <div className="mt-10">
            <WorkflowDiagram />
          </div>
        </div>
      </section>

      {/* Payer Intelligence: hero feature */}
      <section id="payer-intelligence" className="bg-white px-4 py-20 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-7xl">
          <span className="inline-flex items-center rounded-full border border-[#1E6BFF]/20 bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#1E6BFF]">
            ClearCheck
          </span>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-xl text-2xl font-bold text-[#0F1F3D] sm:text-3xl">
              ClearCheck knows what Star Health will cut before you submit.
            </h2>
            <p className="max-w-md text-sm text-[#8A8070] lg:text-right">
              Trained on carrier rejection history across 42 payer profiles. Every claim line gets
              a deduction probability, a predicted rupee amount, and a fix.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-[#EAE6DE] bg-[#FAFAF8]">
            <PreCheckDemo />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              { stat: "42", title: "Payer profiles in ClearCheck", body: "Star Health, ICICI Lombard, SBI General, Bajaj Allianz, Tata AIG, Medi Assist and more." },
              { stat: "68% → 88%", title: "First-pass acceptance", body: "The 20-point gap between what hospitals get and what they should. ClearCheck closes it before the claim leaves." },
              { stat: "Learns over time", title: "Trained on your data", body: "ClearCheck fine-tunes on your hospital's own remittance history. Predictions get sharper every month." },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-[#EAE6DE] bg-white p-6">
                <p className="text-xl font-bold text-[#1E6BFF]">{c.stat}</p>
                <h3 className="mt-2 font-semibold text-[#0F1F3D]">{c.title}</h3>
                <p className="mt-1.5 text-sm text-[#8A8070]">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Full platform */}
      <section id="solution" className="bg-[#FEFCF8] px-4 py-20 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B0A898]">
            The platform
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold text-[#0F1F3D] sm:text-3xl">
            One platform. The entire claim lifecycle.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#EAE6DE] bg-white p-6">
                <item.icon className="size-8 text-[#1E6BFF]" />
                <h3 className="mt-4 font-semibold text-[#0F1F3D]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#8A8070]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI */}
      <section id="impact" className="bg-white px-4 py-20 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B0A898]">The impact</p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold text-[#0F1F3D] sm:text-3xl">
            What changes at a hospital billing ₹2 crore per month.
          </h2>
          <div className="mt-10 overflow-x-auto rounded-2xl border border-[#EAE6DE]">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#EAE6DE] text-left text-[#B0A898]">
                  <th className="bg-[#FEFCF8] px-5 py-3 font-medium">Metric</th>
                  <th className="bg-[#FEFCF8] px-5 py-3 font-medium">Before</th>
                  <th className="bg-[#FEFCF8] px-5 py-3 font-medium">After ClearCycle</th>
                </tr>
              </thead>
              <tbody>
                {roiRows.map((row, i) => (
                  <tr
                    key={row.metric}
                    className={i !== roiRows.length - 1 ? "border-b border-[#EAE6DE]" : ""}
                  >
                    <td className="px-5 py-4 text-[#0F1F3D]">{row.metric}</td>
                    <td className="px-5 py-4 text-[#B0A898]">{row.before}</td>
                    <td className="px-5 py-4 font-bold text-[#1E6BFF]">{row.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 rounded-2xl border border-[#BFDBFE] bg-[#EEF4FF] px-6 py-4 text-center text-[#0F1F3D]">
            <span className="font-semibold">₹20-36 lakhs</span> recovered per month vs{" "}
            <span className="font-semibold">₹2-4 lakhs</span> cost. ROI visible within 30 days.
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="bg-[#FEFCF8] px-4 py-20 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B0A898]">
            Built for Indian healthcare
          </p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold text-[#0F1F3D] sm:text-3xl">
            Compliance is not an afterthought.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {compliance.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[#1E6BFF]" />
                <p className="text-sm text-[#5C5C6B]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audit CTA */}
      <section id="audit" className="bg-white px-4 py-20 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-[#1E6BFF]/20 bg-[#EEF4FF] px-3 py-1 text-xs font-semibold text-[#1E6BFF]">
            Free TPA leakage audit
          </span>
          <h2 className="mt-4 text-2xl font-bold text-[#0F1F3D] sm:text-3xl">
            Find out exactly how much your hospital is losing.
          </h2>
          <p className="mt-4 text-base text-[#8A8070]">
            Share 6 months of remittance data. We'll map your deduction patterns, identify the
            biggest recoverable amounts, and show you what ClearCycle would change. No pitch until
            you've seen your number.
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#B0A898]">
            <span>Spots limited to 5 hospitals this month</span>
            <span>·</span>
            <span>3-month pilot included, free</span>
            <span>·</span>
            <span>Data stays in India</span>
          </div>
          <div className="mt-10 rounded-2xl border border-[#EAE6DE] bg-[#FEFCF8] p-8">
            <AuditForm />
          </div>
          <p className="mt-6 text-sm text-[#B0A898]">
            Prefer a call?{" "}
            <a href="tel:+919163236777" className="text-[#5C5C6B] underline hover:text-[#0F1F3D]">
              +91 91632 36777
            </a>
            {" "}or{" "}
            <Link href="/contact" className="text-[#5C5C6B] underline hover:text-[#0F1F3D]">
              fill out the full form
            </Link>
          </p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
