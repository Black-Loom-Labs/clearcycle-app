import type { JSX } from "react"

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  isoDate: string
  readTime: string
  Content: () => JSX.Element
}

function Post1() {
  return (
    <>
      <h2>The scale of the problem</h2>
      <p>
        Indian private hospitals lose an estimated ₹8,000 crore every year to avoidable insurance
        claim denials. The number sounds staggering — yet most hospitals accept it as an
        unavoidable cost of doing business.
      </p>
      <p>
        It is not unavoidable. The denials follow predictable patterns, and those patterns can be
        fixed before a claim ever reaches a TPA.
      </p>

      <h2>Why claims get denied in India</h2>
      <p>
        After analysing thousands of claims across Star Health, ICICI Lombard, United Health
        Insurance, HDFC Ergo, and New India Assurance, three root causes account for over 70% of
        first-pass denials:
      </p>
      <ol>
        <li>
          <strong>Coding errors (38%)</strong> — Incorrect ICD-10 codes, missing secondary
          diagnoses, or CPT-ICD mismatch flagged by CCI edits.
        </li>
        <li>
          <strong>Missing documentation (24%)</strong> — Implant invoices for ortho procedures,
          investigation reports for certain diagnoses, or pre-authorisation letters not attached.
        </li>
        <li>
          <strong>Policy limit breaches (11%)</strong> — Room upgrades billed above the insured
          room category without prior approval, proportionate deduction clauses not applied.
        </li>
      </ol>

      <h2>The hidden cost beyond the denial</h2>
      <p>
        Each denial triggers a rework cycle that costs 3–5 hours of billing staff time — researching
        the reason, gathering documents, drafting an appeal letter, resubmitting, and chasing
        status. At ₹400/hour for a billing executive, a single appeal costs ₹1,200–2,000 in labour
        before considering the time value of money on delayed settlement.
      </p>
      <p>
        A hospital processing 200 claims per month with a 30% denial rate faces 60 appeals/month —
        ₹72,000–1.2 lakhs in labour cost alone, plus 45–90 days of cash flow delay.
      </p>

      <h2>The fix: upstream intelligence</h2>
      <p>
        The highest-ROI intervention is not faster appeal processing — it is preventing the denial
        in the first place. This means:
      </p>
      <ul>
        <li>Validating ICD-10/CPT codes against CCI edits before submission</li>
        <li>Checking claim data against TPA-specific documentation requirements</li>
        <li>Applying policy adjudication rules to calculate exact insurer liability at discharge</li>
      </ul>
      <p>
        Hospitals using AI-powered pre-submission validation consistently achieve 85–90% first-pass
        acceptance rates versus the 65–70% industry average — recovering that 20-point gap as
        direct revenue.
      </p>

      <h2>What this means in rupees</h2>
      <p>
        For a hospital billing ₹2 crore per month in cashless claims, moving from 65% to 87%
        first-pass acceptance means ₹44 lakhs more per month clears on the first submission instead
        of going into the appeal queue. At typical TPA settlement timelines, that is 45–90 days of
        working capital freed per month.
      </p>
      <p>
        The maths is not complicated. The execution is — which is why hospitals that have
        implemented RCM automation consistently outperform those relying on manual billing teams.
      </p>
    </>
  )
}

function Post2() {
  return (
    <>
      <h2>Why ICD-10 coding matters more than ever</h2>
      <p>
        Indian TPAs have tightened their adjudication engines significantly over the last two years.
        Coding that would have passed manual review in 2022 is now automatically flagged by
        algorithmic claim review systems. The result: coding errors that were once minor annoyances
        have become primary denial reasons.
      </p>
      <p>
        Here are the five ICD-10 coding mistakes that account for the most claim rejections in
        Indian private hospitals — and how to avoid each one.
      </p>

      <h2>1. Using an unspecified code when a specific one exists</h2>
      <p>
        ICD-10 has approximately 68,000 codes for a reason. Using{" "}
        <code>M79.3 (Panniculitis, unspecified)</code> when the discharge summary clearly documents
        Lupus panniculitis (code <code>M35.6</code>) is a coding error — and many TPAs score
        unspecified codes as low confidence, triggering review queues that extend settlement time.
      </p>
      <p>
        <strong>Fix:</strong> Always code to the highest level of specificity the clinical
        documentation supports. AI coding assistants automatically select the most specific valid
        code from the discharge summary text.
      </p>

      <h2>2. CCI edit violations</h2>
      <p>
        Correct Coding Initiative (CCI) edits define pairs of procedure codes that cannot be billed
        together in the same encounter. Submitting a claim with a CCI-paired code combination — for
        example, billing a comprehensive metabolic panel alongside its component tests — is an
        automatic rejection trigger.
      </p>
      <p>
        <strong>Fix:</strong> Run all claims through CCI edit validation before submission. ClearCycle
        performs this check automatically on every claim bundle.
      </p>

      <h2>3. Missing secondary and complication codes</h2>
      <p>
        A diabetic patient admitted for a foot wound should have both the wound code and the
        diabetes complication code (<code>E11.621</code> for Type 2 diabetes with foot ulcer). Many
        billing teams code only the primary presenting condition, which underrepresents the case
        severity and can cause denial if the procedure complexity does not match the diagnosis
        complexity.
      </p>

      <h2>4. Principal diagnosis sequencing errors</h2>
      <p>
        In ICD-10, the principal diagnosis must be the condition established after study to be
        chiefly responsible for the hospital admission. Sequencing the admitting complaint (e.g.
        chest pain) as the principal diagnosis when the confirmed diagnosis is STEMI is technically
        incorrect and flags for review.
      </p>

      <h2>5. Procedure-diagnosis mismatch</h2>
      <p>
        If a claim includes an arthroscopic knee procedure but the diagnosis codes do not include
        any knee condition, the claim fails automated plausibility checks. This sounds obvious but
        is surprisingly common when coding and billing are handled by different team members without
        a reconciliation step.
      </p>

      <h2>The systemic fix</h2>
      <p>
        Individual training helps, but the reliable fix is an automated validation layer that checks
        every claim against CCI edits, MUE limits, and diagnosis-procedure plausibility before
        submission. Hospitals with automated pre-submission coding validation reduce coding-related
        denials by 55–65%.
      </p>
    </>
  )
}

function Post3() {
  return (
    <>
      <h2>What is NHCX?</h2>
      <p>
        The National Health Claims Exchange (NHCX) is IRDAI&apos;s digital infrastructure for
        standardising health insurance claims in India. Rather than each hospital and insurer
        maintaining bilateral integrations — a mess of different formats, portals, and timelines —
        NHCX establishes a single interoperability layer using the FHIR R4 (Fast Healthcare
        Interoperability Resources) standard.
      </p>
      <p>
        As of mid-2026, 83 payers and 42,000+ hospitals are onboarded. IRDAI has signalled mandatory
        adoption within 18 months for all empanelled hospitals.
      </p>

      <h2>What changes for hospitals</h2>
      <p>
        Under the current fragmented system, a hospital empanelled with 8 TPAs typically maintains
        8 different portal logins, 8 different claim formats, and 8 different follow-up processes.
        Staff who manage one TPA&apos;s portal cannot easily shift to another.
      </p>
      <p>
        NHCX replaces this with a single submission point. A FHIR R4 claim bundle submitted to NHCX
        is routed to the correct payer automatically. Status updates flow back through the same
        channel. Appeals and additional document requests use the same structured format.
      </p>

      <h2>The FHIR R4 requirement</h2>
      <p>
        This is where most hospitals will face implementation complexity. FHIR R4 is a structured
        data standard — it requires patient, encounter, condition, procedure, and claim resources to
        be formatted as JSON with specific code system bindings (SNOMED-CT for clinical concepts,
        ICD-10 for diagnoses). A discharge summary scanned as a PDF does not meet this standard.
      </p>
      <p>
        Hospitals that have not already digitised their clinical documentation will need to either:
      </p>
      <ol>
        <li>Implement structured EHR documentation at the point of care, or</li>
        <li>
          Use an RCM platform that can extract structured data from existing discharge summary
          formats and generate compliant FHIR bundles.
        </li>
      </ol>

      <h2>What this means for claim settlement timelines</h2>
      <p>
        NHCX mandates response SLAs from payers — acknowledgement within 2 hours, decision within
        72 hours for cashless claims. This is a dramatic improvement over the current average of
        45–90 days to settlement. Early pilot hospitals report settlement in 5–7 days.
      </p>

      <h2>Preparing now</h2>
      <p>
        Hospitals that start the transition to FHIR R4 structured claims now will be ahead of the
        mandatory rollout — and ahead of competitors. The key steps are:
      </p>
      <ul>
        <li>Audit your current claim data formats and identify gaps vs FHIR R4</li>
        <li>Evaluate RCM platforms with built-in NHCX-ready claim bundle generation</li>
        <li>Register your hospital on the NHCX portal (free, takes 2–3 days)</li>
        <li>Run parallel submissions (existing portal + NHCX) during transition</li>
      </ul>
    </>
  )
}

function Post4() {
  return (
    <>
      <h2>Why TPA behaviour patterns matter</h2>
      <p>
        Every TPA has systematic rejection patterns — claim characteristics they consistently flag
        or deny that go beyond the written policy terms. These patterns emerge from adjudication
        engine configurations, internal cost-control directives, and historical claim data the TPA
        uses to set automated review triggers.
      </p>
      <p>
        Hospitals that understand these patterns before submission get dramatically higher first-pass
        acceptance rates. Those that don&apos;t spend months learning the hard way through denials.
      </p>

      <h2>Star Health — key rejection patterns</h2>
      <ul>
        <li>
          <strong>Orthopaedic implant claims (34% rejection rate):</strong> Star Health requires an
          itemised implant invoice from the manufacturer or authorised distributor, physically
          attached to the claim. A hospital invoice or surgical estimate is not sufficient. Claims
          without this are systematically rejected at first pass.
        </li>
        <li>
          <strong>Room upgrade deductions:</strong> Star Health applies proportionate deductions to
          all ancillary charges (OT, ICU, investigations) when a patient is admitted to a room
          category above their insured room entitlement. The deduction is calculated automatically
          — but hospitals that don&apos;t catch and document room category upgrades pre-admission
          find their claims partially paid with no clear explanation.
        </li>
        <li>
          <strong>Cataract day-care claims:</strong> Day-care procedures under 3 hours are subject
          to fixed package rates. Itemised billing above the package rate is systematically
          deducted.
        </li>
      </ul>

      <h2>ICICI Lombard — key rejection patterns</h2>
      <ul>
        <li>
          <strong>Pre-existing disease (PED) scrutiny:</strong> ICICI Lombard applies stricter PED
          exclusion logic than most TPAs. Conditions mentioned in the admission notes — even if not
          claimed — can trigger a full clinical review if they appear on their PED watch list.
        </li>
        <li>
          <strong>Room upgrade deductions (systematic):</strong> Unlike Star, ICICI Lombard applies
          a blanket percentage deduction to the entire claim rather than proportionate deductions,
          when room upgrade is detected. The deduction rate is not published and can reach 30–40%.
        </li>
        <li>
          <strong>Package procedure claims:</strong> For procedures on their package rate list,
          ICICI Lombard will not pay more than the package rate regardless of itemised billing.
          Submit at the package rate from the start.
        </li>
      </ul>

      <h2>Building institutional knowledge</h2>
      <p>
        The challenge for most hospitals is that this knowledge lives in the heads of experienced
        billing executives — and walks out the door when they leave. The solution is to systematise
        it: maintain a TPA-specific rejection pattern database, update it every quarter with new
        denial data, and apply the rules as pre-submission checks on every claim.
      </p>
      <p>
        ClearCycle&apos;s payer intelligence engine does exactly this — 42 behavioural profiles
        across 5 major TPAs, updated continuously with claim outcome data.
      </p>
    </>
  )
}

function Post5() {
  return (
    <>
      <h2>The RCM automation decision</h2>
      <p>
        Most hospitals know their billing is inefficient. The question they wrestle with is whether
        the efficiency gain justifies the investment in automation — and whether the ROI is
        predictable enough to make a buying decision.
      </p>
      <p>
        This post lays out the numbers clearly, using a representative Indian private hospital
        billing ₹2 crore per month in cashless/TPA claims.
      </p>

      <h2>Baseline: what the average hospital looks like today</h2>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Current state</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Monthly TPA claim volume</td>
            <td>~200 claims</td>
          </tr>
          <tr>
            <td>First-pass acceptance rate</td>
            <td>65–70%</td>
          </tr>
          <tr>
            <td>Denial rate</td>
            <td>30–35%</td>
          </tr>
          <tr>
            <td>Average settlement time</td>
            <td>45–90 days</td>
          </tr>
          <tr>
            <td>Billing staff hours per claim</td>
            <td>3–4 hours (coding + submission + follow-up)</td>
          </tr>
          <tr>
            <td>Appeal turnaround</td>
            <td>3–5 days per appeal</td>
          </tr>
        </tbody>
      </table>

      <h2>After automation: what changes</h2>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>After ClearCycle</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>First-pass acceptance rate</td>
            <td>85–90%</td>
            <td>+20 percentage points</td>
          </tr>
          <tr>
            <td>Claim processing time</td>
            <td>4–6 hours total</td>
            <td>From 3–4 days</td>
          </tr>
          <tr>
            <td>TPA portal work per claim</td>
            <td>Automated</td>
            <td>45–60 min → 0</td>
          </tr>
          <tr>
            <td>Appeal turnaround</td>
            <td>Same day</td>
            <td>From 3–5 days</td>
          </tr>
          <tr>
            <td>Settlement time (cashless)</td>
            <td>7–14 days</td>
            <td>From 45–90 days</td>
          </tr>
        </tbody>
      </table>

      <h2>The revenue maths</h2>
      <p>
        The 20-point improvement in first-pass acceptance is the biggest lever. On ₹2 crore/month
        in claims:
      </p>
      <ul>
        <li>
          At 65% acceptance: ₹1.3 crore settles on first pass, ₹70 lakhs goes into the denial /
          appeal queue
        </li>
        <li>
          At 87% acceptance: ₹1.74 crore settles on first pass, ₹26 lakhs goes into the denial /
          appeal queue
        </li>
        <li>
          Freed from the queue: ₹44 lakhs/month — at 60-day average settlement delay, that is ₹88
          lakhs in working capital freed over 2 months
        </li>
      </ul>
      <p>
        The faster appeal turnaround (same day vs 3–5 days) means the remaining denials are
        resolved faster too. Total additional recovered revenue: ₹20–36 lakhs per month depending
        on payer mix and current process maturity.
      </p>

      <h2>The cost</h2>
      <p>
        ClearCycle is priced at ₹2–4 lakhs/month depending on claim volume and feature tier. The
        platform pays for itself in the first month — typically in the first 2–3 weeks once the
        payer intelligence engine starts flagging pre-submission issues.
      </p>

      <h2>The 3-month free pilot</h2>
      <p>
        We offer a 3-month free pilot specifically because we are confident in these numbers. You
        can run ClearCycle in parallel with your existing process, measure the improvement
        directly, and make a data-driven buying decision with 3 months of your own hospital&apos;s
        claim data. No commitment required.
      </p>
    </>
  )
}

export const allPosts: BlogPost[] = [
  {
    slug: "why-indian-hospitals-lose-crores-to-claim-denials",
    title: "Why Indian Hospitals Lose Crores to Insurance Claim Denials — And How to Stop It",
    excerpt:
      "Indian private hospitals lose ₹8,000 crore annually to avoidable claim denials. The patterns are predictable — and fixable before a claim ever reaches a TPA.",
    category: "Claim Denials",
    date: "October 2026",
    isoDate: "2026-10-01",
    readTime: "6 min read",
    Content: Post1,
  },
  {
    slug: "icd-10-coding-mistakes-indian-hospitals",
    title: "5 ICD-10 Coding Mistakes Indian Hospitals Make That Cost Them on Every Claim",
    excerpt:
      "TPAs now use algorithmic review engines that catch coding errors that would have passed manual review. These five mistakes account for most first-pass rejections.",
    category: "Medical Coding",
    date: "October 2026",
    isoDate: "2026-10-05",
    readTime: "5 min read",
    Content: Post2,
  },
  {
    slug: "how-nhcx-changes-insurance-claims-india",
    title: "How NHCX Will Change Insurance Claims for Indian Hospitals",
    excerpt:
      "IRDAI's National Health Claims Exchange is moving from pilot to mandatory adoption. Here's what FHIR R4 means for your hospital's billing workflow.",
    category: "NHCX & Compliance",
    date: "October 2026",
    isoDate: "2026-10-10",
    readTime: "7 min read",
    Content: Post3,
  },
  {
    slug: "tpa-rejection-patterns-star-health-icici-lombard",
    title: "TPA Rejection Patterns: What Star Health and ICICI Lombard Consistently Deny",
    excerpt:
      "Every TPA has systematic rejection patterns that go beyond written policy terms. Here are the ones causing the most denials at Indian private hospitals.",
    category: "Payer Intelligence",
    date: "October 2026",
    isoDate: "2026-10-15",
    readTime: "8 min read",
    Content: Post4,
  },
  {
    slug: "rcm-automation-roi-private-hospitals-india",
    title: "RCM Automation ROI for Indian Private Hospitals: The Numbers",
    excerpt:
      "A data-driven breakdown of the ROI from revenue cycle automation for a hospital billing ₹2 crore per month — first-pass rates, recovered revenue, and payback period.",
    category: "ROI & Pricing",
    date: "October 2026",
    isoDate: "2026-10-20",
    readTime: "6 min read",
    Content: Post5,
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return allPosts.find((p) => p.slug === slug)
}
