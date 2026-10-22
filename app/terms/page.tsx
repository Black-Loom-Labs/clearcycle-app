import type { Metadata } from "next"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "ClearCycle Terms of Service — the agreement governing your use of the ClearCycle claims intelligence platform.",
  alternates: { canonical: "https://clearcycle.in/terms" },
  robots: { index: true, follow: false },
}

const LAST_UPDATED = "1 October 2026"
const COMPANY = "ClearCycle"
const EMAIL = "gauravhira24@gmail.com"

export default function TermsOfService() {
  return (
    <>
      <MarketingNav />
      <main className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-bold">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

          <div className="mt-10 space-y-0 text-sm leading-relaxed [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_li]:leading-relaxed [&_strong]:font-semibold [&_a]:text-[#1E6BFF] [&_a]:underline">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the
              ClearCycle platform and services provided by {COMPANY} (&ldquo;ClearCycle&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo;). By accessing the platform, you agree to these
              Terms.
            </p>

            <h2>1. Services</h2>
            <p>
              ClearCycle provides a Software-as-a-Service platform for health insurance revenue
              cycle management, including: AI-assisted ICD-10/CPT medical coding, insurance claim
              adjudication, TPA portal submission, claim status tracking, appeal letter generation,
              and payer intelligence analytics.
            </p>

            <h2>2. Eligibility</h2>
            <p>
              The platform is available to hospitals, clinics, and healthcare facilities registered
              under applicable Indian laws. By accepting these Terms, you represent that you have
              the authority to bind your organisation.
            </p>

            <h2>3. Account responsibilities</h2>
            <ul>
              <li>
                You are responsible for maintaining the confidentiality of your login credentials.
              </li>
              <li>
                You must not share platform access with individuals outside your organisation or
                with third-party billing vendors without a signed sub-processor agreement.
              </li>
              <li>
                You are responsible for the accuracy of the patient and clinical data you submit to
                the platform.
              </li>
              <li>
                You must obtain all necessary consents from patients before submitting their data
                for claim processing.
              </li>
            </ul>

            <h2>4. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Submit fraudulent, fabricated, or inflated claim data.</li>
              <li>Reverse-engineer, decompile, or copy any part of the platform.</li>
              <li>Attempt to access data belonging to another hospital.</li>
              <li>Use the platform in any manner that violates IRDAI regulations or Indian law.</li>
              <li>
                Resell or sub-license access to the platform without written authorisation from
                ClearCycle.
              </li>
            </ul>

            <h2>5. AI coding accuracy and clinical responsibility</h2>
            <p>
              ClearCycle&apos;s AI coding engine assists with ICD-10/CPT code assignment. While we
              achieve 92–95% accuracy on common admission types, the platform is a decision-support
              tool — not a replacement for qualified clinical coders or doctors.
            </p>
            <p>
              <strong>
                The hospital retains full clinical and medicolegal responsibility for the accuracy
                of all codes submitted to insurers.
              </strong>{" "}
              The doctor OTP approval step in the 3-gate workflow creates an auditable record of
              clinical sign-off, but does not transfer liability to ClearCycle.
            </p>

            <h2>6. Fees and payment</h2>
            <p>
              Fees are billed monthly based on claim volume processed in the preceding month. Pilot
              hospitals in the first 3 months pay nothing. Post-pilot fees are per the order form
              signed at contract execution. Late payment (beyond 30 days) accrues interest at 18%
              per annum.
            </p>

            <h2>7. Data ownership</h2>
            <p>
              You own all patient and clinical data you submit to the platform. ClearCycle holds a
              limited licence to process that data to deliver the service. We do not claim any
              ownership over your claim data or payer intelligence derived specifically from your
              claims.
            </p>
            <p>
              Aggregate and anonymised claim data across all hospitals may be used to improve the
              platform&apos;s AI models. This data cannot be traced back to any individual patient
              or hospital.
            </p>

            <h2>8. Intellectual property</h2>
            <p>
              The ClearCycle platform, AI models, payer intelligence database, and all associated
              software and content are the intellectual property of {COMPANY}. No licence is
              granted beyond the right to use the platform as described in these Terms.
            </p>

            <h2>9. Service availability</h2>
            <p>
              We target 99.5% monthly uptime for the platform, excluding scheduled maintenance
              windows (notified 48 hours in advance). Downtime credit of 10% of monthly fees per
              hour below the SLA threshold applies, capped at one month&apos;s fees.
            </p>

            <h2>10. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, ClearCycle&apos;s aggregate liability for any
              claim arising from these Terms or your use of the platform is limited to the total
              fees paid by you in the 3 months preceding the claim.
            </p>
            <p>
              ClearCycle is not liable for: indirect or consequential losses; claim denials by TPAs
              where the submitted data was accurate; losses arising from incorrect data submitted by
              the hospital; or losses arising from force majeure events.
            </p>

            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify ClearCycle against any claims arising from: fraudulent or
              inaccurate claim data submitted through the platform; your violation of IRDAI, DPDP,
              or other applicable regulations; or your infringement of third-party rights.
            </p>

            <h2>12. Termination</h2>
            <p>
              Either party may terminate the service agreement with 30 days&apos; written notice.
              Termination for material breach may be immediate. Upon termination, we will provide a
              data export in standard format and delete your data within 60 days, subject to legal
              retention obligations.
            </p>

            <h2>13. Governing law and disputes</h2>
            <p>
              These Terms are governed by the laws of India. Disputes shall first be referred to
              good-faith negotiation. If unresolved within 30 days, disputes shall be submitted to
              arbitration under the Arbitration and Conciliation Act, 1996, with venue in Bengaluru,
              India.
            </p>

            <h2>14. Changes to these Terms</h2>
            <p>
              We may update these Terms to reflect changes in law or the platform. Material changes
              will be notified to active hospital accounts at least 30 days before taking effect.
              Continued use after the effective date constitutes acceptance of the updated Terms.
            </p>

            <h2>15. Contact</h2>
            <p>
              Legal notices and queries: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <br />
              {COMPANY}
            </p>
          </div>
        </div>
      </main>
      <MarketingFooter />
    </>
  )
}
