import type { Metadata } from "next"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "ClearCycle's Privacy Policy — how we collect, use, and protect personal and patient data under DPDP Act 2023 and IRDAI guidelines.",
  alternates: { canonical: "https://clearcycle.in/privacy" },
  robots: { index: true, follow: false },
}

const LAST_UPDATED = "1 October 2026"
const COMPANY = "ClearCycle"
const EMAIL = "gauravhira24@gmail.com"
const SITE = "clearcycle.in"

export default function PrivacyPolicy() {
  return (
    <>
      <MarketingNav />
      <main className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

          <div className="mt-10 space-y-0 text-sm leading-relaxed [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-semibold [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 [&_li]:leading-relaxed [&_strong]:font-semibold [&_a]:text-[#1E6BFF] [&_a]:underline">
            <p>
              This Privacy Policy describes how {COMPANY} (&ldquo;ClearCycle&rdquo;,
              &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) collects, uses, stores, and
              shares information when you use our website ({SITE}), platform
              (app.clearcycle.in), or services. It is designed to comply with India&apos;s
              <strong> Digital Personal Data Protection (DPDP) Act 2023</strong>, IRDAI data
              handling guidelines, and applicable international data protection standards.
            </p>

            <h2>1. Who this policy applies to</h2>
            <p>This policy applies to:</p>
            <ul>
              <li>
                <strong>Hospital administrators and billing staff</strong> who access the ClearCycle
                platform on behalf of their organisation.
              </li>
              <li>
                <strong>Doctors</strong> who receive approval requests via SMS/OTP as part of the
                3-gate claim workflow.
              </li>
              <li>
                <strong>Website visitors</strong> who browse clearcycle.in.
              </li>
              <li>
                <strong>Patients</strong> whose de-identified health information is processed as
                part of insurance claim submissions made by empanelled hospitals. Patients are not
                direct users of the platform; their data is submitted by and under the
                responsibility of the hospital.
              </li>
            </ul>

            <h2>2. What data we collect</h2>
            <h3>2.1 Hospital account data</h3>
            <p>
              When a hospital signs up or pilots ClearCycle, we collect: hospital name, address,
              registration number, contact person name, email address, phone number, and payment
              information.
            </p>
            <h3>2.2 Platform usage data</h3>
            <p>
              We collect logs of actions taken within the platform: claim created, coding reviewed,
              claim approved, submission status, appeal generated. These logs form the 7-year audit
              trail required by IRDAI guidelines.
            </p>
            <h3>2.3 Clinical and patient data</h3>
            <p>
              To process insurance claims, hospitals submit: patient name, Aadhaar or policy number
              (as required by the insurer), date of birth, diagnosis codes, procedure codes,
              discharge summary excerpts, investigation reports, and TPA pre-authorisation
              references.
            </p>
            <p>
              ClearCycle processes this data as a <strong>data processor</strong> acting on
              instructions from the hospital (the data fiduciary under DPDP Act 2023). We do not
              use patient clinical data for any purpose other than claim processing, audit trail
              maintenance, and improving our AI coding models (only with explicit hospital consent
              and always in anonymised form).
            </p>
            <h3>2.4 Website data</h3>
            <p>
              When you visit clearcycle.in, we collect standard web analytics data: pages visited,
              time on page, referring URL, approximate location (country/city), and device type. We
              use this data to improve the website.
            </p>

            <h2>3. Legal basis for processing (DPDP Act 2023)</h2>
            <p>We process personal data on the following bases:</p>
            <ul>
              <li>
                <strong>Consent:</strong> For marketing communications and non-essential analytics
                cookies. You may withdraw consent at any time.
              </li>
              <li>
                <strong>Contract:</strong> For processing account data and platform usage data to
                deliver the service you have contracted.
              </li>
              <li>
                <strong>Legitimate interest:</strong> For security monitoring, fraud prevention, and
                product improvement (using anonymised aggregate data).
              </li>
              <li>
                <strong>Legal obligation:</strong> For maintaining the 7-year claim audit trail per
                IRDAI regulations.
              </li>
            </ul>

            <h2>4. Data storage and security</h2>
            <ul>
              <li>
                All data is stored on <strong>AWS ap-south-1 (Mumbai)</strong>. Patient data never
                leaves India.
              </li>
              <li>Data in transit is encrypted with TLS 1.3.</li>
              <li>Data at rest is encrypted with AES-256.</li>
              <li>
                Access is role-based: billing staff can only see claims for their hospital; doctor
                OTP approval creates an immutable log entry.
              </li>
              <li>
                We conduct annual security audits and maintain SOC 2 Type II certification (in
                progress).
              </li>
            </ul>

            <h2>5. Data sharing</h2>
            <p>We share data with:</p>
            <ul>
              <li>
                <strong>TPA portals</strong> (Star Health, ICICI Lombard, etc.) as required to
                submit claims on behalf of hospitals.
              </li>
              <li>
                <strong>NHCX</strong> as required for digital claims exchange under IRDAI mandate.
              </li>
              <li>
                <strong>AWS</strong> as our cloud infrastructure provider (standard DPA in place).
              </li>
              <li>
                <strong>Anthropic</strong> (Claude AI) for AI-assisted coding and appeal letter
                generation (data processed under Anthropic&apos;s Enterprise DPA; patient data
                sent only as de-identified clinical text).
              </li>
            </ul>
            <p>
              We do not sell personal data to third parties. We do not share data with insurance
              companies for underwriting purposes.
            </p>

            <h2>6. Your rights (DPDP Act 2023)</h2>
            <p>
              Individuals whose data we process have the right to: access their data, correct
              inaccurate data, erase their data (subject to legal retention obligations), and
              nominate a representative to exercise these rights on their behalf. To exercise these
              rights, contact us at{" "}
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
            </p>
            <p>
              For patients whose data was submitted by a hospital: your primary relationship is with
              the hospital. We will cooperate with hospitals to fulfil patient rights requests.
            </p>

            <h2>7. Cookies</h2>
            <p>
              We use essential cookies (required for the platform to function) and optional
              analytics cookies. A cookie consent banner on our website allows you to accept or
              reject non-essential cookies. You can change your preference at any time by clearing
              your browser&apos;s localStorage.
            </p>

            <h2>8. Data retention</h2>
            <ul>
              <li>
                Claim audit trails are retained for 7 years per IRDAI guidelines, then deleted.
              </li>
              <li>Account data is retained for the duration of the contract plus 2 years.</li>
              <li>
                Website analytics data is retained for 24 months in aggregate form only.
              </li>
            </ul>

            <h2>9. Changes to this policy</h2>
            <p>
              We may update this policy as regulations change or we add new features. Material
              changes will be notified to active hospital accounts by email at least 30 days before
              they take effect. The current version is always available at{" "}
              <a href="https://clearcycle.in/privacy">clearcycle.in/privacy</a>.
            </p>

            <h2>10. Contact</h2>
            <p>
              Data Protection queries:{" "}
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <br />
              Phone: +91 91632 36777
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
