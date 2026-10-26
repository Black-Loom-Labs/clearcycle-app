import type { Metadata } from "next"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { ChevronDown } from "lucide-react"

export const metadata: Metadata = {
  title: "FAQ — Insurance Claims Automation",
  description:
    "Answers to the most common questions about ClearCycle: how AI medical coding works, TPA integration, NHCX compliance, pricing, and implementation for Indian hospitals.",
  alternates: { canonical: "https://clearcycle.in/faq" },
  openGraph: {
    title: "FAQ — ClearCycle Insurance Claims Automation",
    description:
      "Answers to the most common questions about ClearCycle's AI-powered claims platform for Indian private hospitals.",
    url: "https://clearcycle.in/faq",
  },
}

export const faqs = [
  {
    category: "Getting Started",
    items: [
      {
        q: "What is ClearCycle?",
        a: "ClearCycle is an AI-powered revenue cycle management platform built specifically for Indian private hospitals. It automates the full insurance claim lifecycle — from ICD-10 coding of discharge summaries to TPA submission, policy adjudication, and appeal letter generation — so hospitals can recover 85–90% of billable revenue on first pass.",
      },
      {
        q: "How long does implementation take?",
        a: "Most hospitals go fully live within 2 weeks. Week 1 covers API integration with your existing HIS/EMR and configuring the 3-gate approval workflow. Week 2 covers TPA portal connections and staff training. We handle the integration work — your team just needs to approve configurations.",
      },
      {
        q: "Do we need to replace our existing hospital software?",
        a: "No. ClearCycle integrates alongside your existing Hospital Information System (HIS) or EMR via API. It ingests discharge summary data from your system, enriches it with AI coding and adjudication, and pushes claims to TPA portals. Your existing workflows stay intact.",
      },
      {
        q: "Is there a free trial?",
        a: "Yes. We offer a 3-month free pilot to the first hospitals we onboard. You get the full platform — AI coding, TPA submission, payer intelligence, and appeal generation — with no commitment. ROI is typically visible within the first 30 days.",
      },
    ],
  },
  {
    category: "AI Medical Coding",
    items: [
      {
        q: "How accurate is the AI medical coding?",
        a: "ClearCycle's coding engine achieves 92–95% accuracy on ICD-10-CM and CPT coding for common admission types. It also runs CCI (Correct Coding Initiative) edit checks and MUE (Medically Unlikely Edits) validation before submission, reducing denials caused by coding errors by up to 60%.",
      },
      {
        q: "Which coding systems does ClearCycle support?",
        a: "ClearCycle supports ICD-10-CM (diagnosis), ICD-10-PCS (procedures), CPT codes, and NABH-aligned coding conventions used by major Indian TPAs. It generates FHIR R4-compliant claim bundles for NHCX submission.",
      },
      {
        q: "Does a doctor need to review every coded claim?",
        a: "Only claims with a confidence score below your configured threshold (default 85%) require doctor review. High-confidence claims move through the 3-gate workflow — doctor approves via SMS OTP, billing confirms financials, admin gives final sign-off — in minutes rather than days.",
      },
    ],
  },
  {
    category: "TPA Integration & Submission",
    items: [
      {
        q: "Which TPAs and insurers does ClearCycle support?",
        a: "ClearCycle currently has built-in payer profiles and submission connectors for Star Health, ICICI Lombard, United Health Insurance, HDFC Ergo, and New India Assurance. We hold 42 behavioural profiles across these TPAs covering known rejection patterns, room upgrade deduction rules, implant invoice requirements, and more.",
      },
      {
        q: "What is payer intelligence and how does it help?",
        a: "Payer intelligence is ClearCycle's database of TPA-specific rejection patterns learned from thousands of claims. For example, it knows that Star Health rejects 34% of ortho claims without an implant invoice attached, and that ICICI Lombard systematically deducts room upgrade charges above a threshold. Before submission, ClearCycle flags claims that match these patterns and prompts for the missing documentation.",
      },
      {
        q: "What happens when a claim is denied?",
        a: "ClearCycle automatically generates an IRDAI-compliant appeal letter citing the denial reason, clinical evidence from the discharge summary, and relevant policy terms — in under 60 seconds. The appeal is queued for admin review and resubmission. Most resubmissions are resolved within 7–14 days vs the industry average of 45–90 days.",
      },
    ],
  },
  {
    category: "Compliance & Security",
    items: [
      {
        q: "Is ClearCycle compliant with IRDAI guidelines?",
        a: "Yes. ClearCycle maintains a 7-year audit trail per IRDAI guidelines, generates IRDAI-compliant appeal letters, and supports NHCX-ready FHIR R4 claim bundle generation. All doctor approvals are captured via OTP and stored as medicolegally defensible records.",
      },
      {
        q: "How does ClearCycle handle patient data under DPDP Act 2023?",
        a: "Every data processing operation in ClearCycle has a documented legal basis under DPDP Act 2023 (primarily consent and legitimate interest for billing). Patient data never leaves India — all infrastructure runs on AWS ap-south-1 (Mumbai). Data is encrypted in transit (TLS 1.3) and at rest (AES-256). We provide a standard DPA (Data Processing Agreement) for hospital sign-off.",
      },
      {
        q: "Is ClearCycle NHCX ready?",
        a: "Yes. ClearCycle generates FHIR R4 claim bundles compatible with the National Health Claims Exchange (NHCX) specification. We are monitoring IRDAI's NHCX rollout timeline and will update our connector as the mandatory adoption schedule is confirmed.",
      },
    ],
  },
  {
    category: "Pricing & ROI",
    items: [
      {
        q: "How is ClearCycle priced?",
        a: "ClearCycle is priced as a monthly SaaS subscription based on claim volume (number of cashless/reimbursement claims processed per month). Pricing starts at ₹2 lakhs per month for hospitals processing up to 200 claims/month. Contact us for a custom quote — the 3-month pilot is completely free.",
      },
      {
        q: "What ROI can we expect?",
        a: "A hospital billing ₹2 crore per month typically recovers ₹20–36 lakhs in additional revenue per month after implementing ClearCycle — through improved first-pass acceptance rates (65–70% → 85–90%), faster appeal resolution, and eliminated manual TPA portal work. The platform pays for itself in the first month.",
      },
      {
        q: "How quickly will we see results?",
        a: "Most hospitals see measurable improvement in first-pass acceptance rates within the first 2–4 weeks of go-live. Full ROI impact is typically visible after 60–90 days as the payer intelligence engine accumulates claim data specific to your hospital's payer mix.",
      },
    ],
  },
]

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.flatMap((cat) =>
    cat.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    }))
  ),
}

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <MarketingNav />
      <main>
        {/* Hero */}
        <section className="bg-[#0F1F3D] px-4 py-20 text-center sm:px-6">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
              Frequently Asked Questions
            </p>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Everything you need to know about ClearCycle
            </h1>
            <p className="mt-4 text-base text-white/60">
              Can&apos;t find your answer?{" "}
              <a
                href="/contact"
                className="underline text-white/80 hover:text-white"
              >
                Get in touch.
              </a>
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="bg-white px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-12">
            {faqs.map((category) => (
              <div key={category.category}>
                <h2 className="mb-6 text-lg font-semibold text-[#0F1F3D]">{category.category}</h2>
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <details
                      key={item.q}
                      className="group rounded-xl border border-border bg-[#F7F8FA] open:bg-white open:shadow-sm transition-all"
                    >
                      <summary className="flex cursor-pointer items-start justify-between gap-4 px-5 py-4 font-medium list-none">
                        <span>{item.q}</span>
                        <ChevronDown className="mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="px-5 pb-5 pt-2 text-sm leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#EAF2FF] px-4 py-16 text-center sm:px-6">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Still have questions?</h2>
            <p className="mt-3 text-muted-foreground">
              Talk to our team. We&apos;ll walk you through a live demo and answer anything specific to
              your hospital&apos;s payer mix and claim volume.
            </p>
            <a
              href="/contact"
              className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-[#1E6BFF] px-6 text-sm font-medium text-white hover:bg-[#1E6BFF]/90 transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  )
}
