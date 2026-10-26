import type { Metadata } from "next"
import Link from "next/link"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { CopyButton } from "@/components/copy-button"

export const metadata: Metadata = {
  title: "API Reference — ClearCycle Developer Docs",
  description:
    "REST API documentation for ClearCycle. Integrate ML payer intelligence, claim pre-check scoring, and automated TPA workflows into your hospital management system.",
}

// ── Code examples ─────────────────────────────────────────────────────────────

const CURL_AUTH = `curl -X POST https://api.clearcycle.in/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "billing@yourhospital.com",
    "password": "••••••••"
  }'`

const CURL_PRECHECK = `curl -X POST https://api.clearcycle.in/claims/pre-check \\
  -H "Authorization: Bearer <your_token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payer_id": "star_health",
    "claim_lines": [
      {
        "line_id": "L1",
        "procedure_code": "27447",
        "diagnosis_codes": ["M17.11"],
        "revenue_category": "procedure",
        "line_amount": 85000,
        "pre_auth_present": true
      },
      {
        "line_id": "L2",
        "procedure_code": "99232",
        "diagnosis_codes": ["M17.11"],
        "revenue_category": "inpatient",
        "line_amount": 18000,
        "pre_auth_present": false
      }
    ]
  }'`

const RESPONSE_PRECHECK = `{
  "hospital_id": "hosp_abc123",
  "payer_id": "star_health",
  "model_version": "pretrain:2025-09-14",
  "lines": [
    {
      "line_id": "L1",
      "deduction_probability": 0.78,
      "expected_deduction_amount": 21250.0,
      "risk_level": "high",
      "top_reasons": [
        "Implant-only CPT without attached invoice",
        "Missing pre-auth reference number"
      ],
      "suggested_action": "Attach implant invoice and pre-auth approval before submission"
    },
    {
      "line_id": "L2",
      "deduction_probability": 0.42,
      "expected_deduction_amount": 7560.0,
      "risk_level": "medium",
      "top_reasons": [
        "Room upgrade — policy covers standard ward only"
      ],
      "suggested_action": "Split room charges: standard ward vs upgrade differential"
    }
  ],
  "summary": {
    "total_lines": 2,
    "high_risk_lines": 1,
    "medium_risk_lines": 1,
    "low_risk_lines": 0,
    "total_billed_amount": 103000.0,
    "total_expected_deduction": 28810.0,
    "expected_collection_rate": 0.7203,
    "payer_history_available": true
  }
}`

const PYTHON_PRECHECK = `import requests

BASE_URL = "https://api.clearcycle.in"

# 1. Authenticate
resp = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "billing@yourhospital.com",
    "password": "your_password",
})
token = resp.json()["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# 2. Score claim lines before submission
payload = {
    "payer_id": "star_health",
    "claim_lines": [
        {
            "line_id": "L1",
            "procedure_code": "27447",
            "diagnosis_codes": ["M17.11"],
            "revenue_category": "procedure",
            "line_amount": 85000,
            "pre_auth_present": True,
        },
    ],
}

result = requests.post(
    f"{BASE_URL}/claims/pre-check",
    json=payload,
    headers=headers,
)
data = result.json()

for line in data["lines"]:
    print(f"{line['line_id']}: {line['risk_level'].upper()} "
          f"({line['deduction_probability']:.0%} deduction risk)")
    print(f"  Expected deduction: ₹{line['expected_deduction_amount']:,.0f}")
    for reason in line["top_reasons"]:
        print(f"  · {reason}")`

const NODE_PRECHECK = `const BASE_URL = "https://api.clearcycle.in";

// 1. Authenticate
const loginRes = await fetch(\`\${BASE_URL}/auth/login\`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "billing@yourhospital.com",
    password: "your_password",
  }),
});
const { access_token } = await loginRes.json();

// 2. Score claim lines
const res = await fetch(\`\${BASE_URL}/claims/pre-check\`, {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${access_token}\`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    payer_id: "star_health",
    claim_lines: [
      {
        line_id: "L1",
        procedure_code: "27447",
        diagnosis_codes: ["M17.11"],
        revenue_category: "procedure",
        line_amount: 85000,
        pre_auth_present: true,
      },
    ],
  }),
});

const data = await res.json();
console.log(\`Expected deduction: ₹\${data.summary.total_expected_deduction.toLocaleString("en-IN")}\`);
console.log(\`Collection rate: \${(data.summary.expected_collection_rate * 100).toFixed(1)}%\`);`

// ── Page ──────────────────────────────────────────────────────────────────────

const sections = [
  { id: "overview", label: "Overview" },
  { id: "authentication", label: "Authentication" },
  { id: "pre-check", label: "POST /claims/pre-check" },
  { id: "request-schema", label: "Request schema" },
  { id: "response-schema", label: "Response schema" },
  { id: "payer-ids", label: "Supported payer IDs" },
  { id: "errors", label: "Error codes" },
  { id: "sdks", label: "Code examples" },
]

function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
  return (
    <div className="group relative">
      <pre className="overflow-x-auto rounded-xl bg-[#0A1628] p-5 text-sm leading-relaxed text-white/80">
        <code>{code}</code>
      </pre>
      <div className="absolute right-3 top-3">
        <CopyButton text={code} />
      </div>
    </div>
  )
}

function Badge({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "green" | "amber" | "red" }) {
  const map = {
    blue: "bg-[#1E6BFF]/15 text-[#1E6BFF] border-[#1E6BFF]/30",
    green: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    amber: "bg-amber-500/15 text-amber-600 border-amber-500/30",
    red: "bg-red-500/15 text-red-600 border-red-500/30",
  }
  return (
    <span className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-xs font-medium ${map[color]}`}>
      {children}
    </span>
  )
}

function Field({
  name,
  type,
  required,
  children,
}: {
  name: string
  type: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-muted py-4 last:border-0">
      <div className="flex flex-wrap items-baseline gap-2">
        <code className="font-mono text-sm font-semibold text-foreground">{name}</code>
        <Badge color="blue">{type}</Badge>
        {required && <Badge color="red">required</Badge>}
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{children}</p>
    </div>
  )
}

export default function DocsPage() {
  return (
    <div className="flex flex-col">
      <MarketingNav />

      {/* Hero */}
      <div className="border-b bg-[#0F1F3D] px-4 py-14 sm:px-6 xl:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold tracking-widest text-[#1E6BFF]">DEVELOPER DOCS</p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">API Reference</h1>
          <p className="mt-4 max-w-2xl text-base text-white/60">
            Integrate ClearCycle&apos;s ML payer intelligence directly into your hospital management
            system. All endpoints use JSON over HTTPS and return structured, machine-readable
            responses.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-white/70">
              <span className="size-2 rounded-full bg-emerald-400" />
              Base URL: api.clearcycle.in
            </span>
            <a
              href="https://api.clearcycle.in/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-full border border-[#1E6BFF]/40 bg-[#1E6BFF]/10 px-3 py-1.5 text-[#1E6BFF] transition hover:bg-[#1E6BFF]/20"
            >
              Interactive Swagger UI ↗
            </a>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 xl:px-10">
        <div className="flex gap-12 lg:gap-16">

          {/* Sidebar */}
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="sticky top-24">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                On this page
              </p>
              <nav className="flex flex-col gap-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="rounded px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
              <div className="mt-8 rounded-xl border bg-muted/50 p-4">
                <p className="text-xs font-semibold text-foreground">Need access?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  API credentials are provisioned during onboarding.
                </p>
                <a
                  href="/contact"
                  className="mt-3 block text-xs font-medium text-[#1E6BFF] hover:underline"
                >
                  Contact us →
                </a>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0 flex-1">
            <div className="flex flex-col gap-16">

              {/* Overview */}
              <section id="overview">
                <h2 className="text-2xl font-bold">Overview</h2>
                <p className="mt-4 text-muted-foreground">
                  The ClearCycle REST API lets you embed claim intelligence into your existing
                  hospital information system (HIS) or billing software. The primary use case is
                  pre-submission risk scoring: before sending a claim to a TPA portal, your system
                  calls <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">/claims/pre-check</code>{" "}
                  and receives a per-line deduction probability, expected INR deduction, and
                  suggested corrective action.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    { label: "Authentication", value: "Bearer JWT" },
                    { label: "Content-Type", value: "application/json" },
                    { label: "Response format", value: "JSON" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border bg-muted/30 p-4">
                      <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                      <p className="mt-1 font-mono text-sm font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Authentication */}
              <section id="authentication">
                <h2 className="text-2xl font-bold">Authentication</h2>
                <p className="mt-4 text-muted-foreground">
                  Every API request must include a short-lived JWT in the{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">Authorization</code>{" "}
                  header. Obtain a token by posting your credentials to{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">POST /auth/login</code>.
                  Tokens expire after 24 hours.
                </p>
                <div className="mt-6">
                  <CodeBlock code={CURL_AUTH} />
                </div>
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <strong>Security note:</strong> Never expose your credentials in client-side code.
                  Always call the API from your backend and forward only what the frontend needs.
                </div>
              </section>

              {/* Pre-check endpoint */}
              <section id="pre-check">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold">Pre-check</h2>
                  <span className="rounded-full bg-[#1E6BFF] px-3 py-0.5 text-xs font-bold text-white">
                    POST
                  </span>
                  <code className="font-mono text-lg text-muted-foreground">
                    /claims/pre-check
                  </code>
                </div>
                <p className="mt-4 text-muted-foreground">
                  Score every line item of a draft claim against a payer&apos;s behavioural
                  profile. Returns per-line deduction probability, expected INR deduction, risk
                  tier, plain-English rejection reasons, and a suggested corrective action.{" "}
                  <strong>No claim is created or stored</strong> — this is a stateless scoring
                  call.
                </p>
                <div className="mt-6">
                  <CodeBlock code={CURL_PRECHECK} />
                </div>
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">Response</p>
                  <CodeBlock code={RESPONSE_PRECHECK} lang="json" />
                </div>
              </section>

              {/* Request schema */}
              <section id="request-schema">
                <h2 className="text-2xl font-bold">Request schema</h2>

                <h3 className="mt-6 text-base font-semibold">Top-level body</h3>
                <div className="mt-3 rounded-xl border">
                  <Field name="payer_id" type="string" required>
                    Insurer or TPA identifier. See{" "}
                    <a href="#payer-ids" className="text-[#1E6BFF] hover:underline">
                      supported payer IDs
                    </a>
                    .
                  </Field>
                  <Field name="claim_lines" type="ClaimLine[]" required>
                    One or more claim lines to score. Minimum 1 item.
                  </Field>
                </div>

                <h3 className="mt-8 text-base font-semibold">ClaimLine object</h3>
                <div className="mt-3 rounded-xl border">
                  <Field name="line_id" type="string" required>
                    Your identifier for this line. Returned unchanged in the response so you can
                    match results back to your records.
                  </Field>
                  <Field name="procedure_code" type="string" required>
                    HCPCS or CPT code for the procedure (e.g.{" "}
                    <code className="rounded bg-muted px-1 font-mono text-xs">27447</code>).
                  </Field>
                  <Field name="diagnosis_codes" type="string[]">
                    ICD-10 codes for this line. First element is used as primary diagnosis.
                    Defaults to <code className="rounded bg-muted px-1 font-mono text-xs">[]</code>.
                  </Field>
                  <Field name="revenue_category" type="string">
                    Billing category. One of:{" "}
                    {["procedure", "consumable", "drug", "inpatient", "outpatient", "dme", "other"].map(
                      (c) => (
                        <code key={c} className="mr-1 rounded bg-muted px-1 font-mono text-xs">
                          {c}
                        </code>
                      )
                    )}. Defaults to <code className="rounded bg-muted px-1 font-mono text-xs">unknown</code>.
                  </Field>
                  <Field name="line_amount" type="number" required>
                    Billed amount in INR. Must be ≥ 0.
                  </Field>
                  <Field name="pre_auth_present" type="boolean">
                    Whether pre-authorisation is on file for this line. Defaults to{" "}
                    <code className="rounded bg-muted px-1 font-mono text-xs">false</code>.
                  </Field>
                </div>
              </section>

              {/* Response schema */}
              <section id="response-schema">
                <h2 className="text-2xl font-bold">Response schema</h2>

                <h3 className="mt-6 text-base font-semibold">Top-level response</h3>
                <div className="mt-3 rounded-xl border">
                  <Field name="hospital_id" type="string">
                    Your hospital&apos;s identifier, derived from the bearer token.
                  </Field>
                  <Field name="payer_id" type="string">
                    Echoes the payer_id from the request.
                  </Field>
                  <Field name="model_version" type="string">
                    Identifies the model used:{" "}
                    <code className="rounded bg-muted px-1 font-mono text-xs">pretrain:YYYY-MM-DD</code>{" "}
                    for the pre-trained model, or a timestamp if your hospital model has been
                    fine-tuned.
                  </Field>
                  <Field name="lines" type="LineResult[]">
                    One result per input claim line, in the same order.
                  </Field>
                  <Field name="summary" type="Summary">
                    Aggregate stats across all lines.
                  </Field>
                </div>

                <h3 className="mt-8 text-base font-semibold">LineResult object</h3>
                <div className="mt-3 rounded-xl border">
                  <Field name="line_id" type="string">
                    Matches the <code className="rounded bg-muted px-1 font-mono text-xs">line_id</code>{" "}
                    you sent.
                  </Field>
                  <Field name="deduction_probability" type="number">
                    Probability of a deduction for this line (0.0–1.0). Multiply by 100 for a
                    percentage.
                  </Field>
                  <Field name="expected_deduction_amount" type="number">
                    Expected INR amount that will be deducted, rounded to 2 decimal places.
                  </Field>
                  <Field name="risk_level" type="string">
                    <code className="rounded bg-muted px-1 font-mono text-xs">low</code> (&lt;30%),{" "}
                    <code className="rounded bg-muted px-1 font-mono text-xs">medium</code> (30–55%),
                    or{" "}
                    <code className="rounded bg-muted px-1 font-mono text-xs">high</code> (&gt;55%).
                  </Field>
                  <Field name="top_reasons" type="string[]">
                    Plain-English reasons the model flags for deduction risk. Empty for low-risk lines.
                  </Field>
                  <Field name="suggested_action" type="string">
                    Recommended corrective action to reduce deduction risk before submission.
                  </Field>
                </div>

                <h3 className="mt-8 text-base font-semibold">Summary object</h3>
                <div className="mt-3 rounded-xl border">
                  <Field name="total_lines" type="number">Total lines scored.</Field>
                  <Field name="high_risk_lines" type="number">Count of high-risk lines.</Field>
                  <Field name="medium_risk_lines" type="number">Count of medium-risk lines.</Field>
                  <Field name="low_risk_lines" type="number">Count of low-risk lines.</Field>
                  <Field name="total_billed_amount" type="number">Sum of all line amounts (INR).</Field>
                  <Field name="total_expected_deduction" type="number">
                    Sum of expected deductions across all lines (INR).
                  </Field>
                  <Field name="expected_collection_rate" type="number">
                    Fraction of billed amount expected to be collected (0.0–1.0).
                  </Field>
                  <Field name="payer_history_available" type="boolean">
                    Whether your hospital has historical persona data for this payer. When{" "}
                    <code className="rounded bg-muted px-1 font-mono text-xs">false</code>, the
                    model uses pre-trained weights only.
                  </Field>
                </div>
              </section>

              {/* Payer IDs */}
              <section id="payer-ids">
                <h2 className="text-2xl font-bold">Supported payer IDs</h2>
                <p className="mt-4 text-muted-foreground">
                  Pass one of the following values as{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">payer_id</code>.
                  Additional insurers are added on request.
                </p>
                <div className="mt-5 overflow-x-auto rounded-xl border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                        <th className="px-5 py-3 font-medium">payer_id</th>
                        <th className="px-5 py-3 font-medium">Insurer / TPA</th>
                        <th className="px-5 py-3 font-medium">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["star_health", "Star Health and Allied Insurance", "Insurer"],
                        ["icici_lombard", "ICICI Lombard General Insurance", "Insurer"],
                        ["sbi_general", "SBI General Insurance", "Insurer"],
                        ["bajaj_allianz", "Bajaj Allianz General Insurance", "Insurer"],
                        ["tata_aig", "Tata AIG General Insurance", "Insurer"],
                        ["medi_assist", "Medi Assist India TPA", "TPA"],
                        ["health_india", "Health India TPA Services", "TPA"],
                        ["induslnd", "IndusInd TPA", "TPA"],
                      ].map(([id, name, type], i, arr) => (
                        <tr
                          key={id}
                          className={i !== arr.length - 1 ? "border-b" : ""}
                        >
                          <td className="px-5 py-3">
                            <code className="font-mono text-xs font-medium">{id}</code>
                          </td>
                          <td className="px-5 py-3 text-foreground">{name}</td>
                          <td className="px-5 py-3 text-muted-foreground">{type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Errors */}
              <section id="errors">
                <h2 className="text-2xl font-bold">Error codes</h2>
                <p className="mt-4 text-muted-foreground">
                  All errors return a JSON body with a{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-sm">detail</code>{" "}
                  field describing the problem.
                </p>
                <div className="mt-5 overflow-x-auto rounded-xl border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                        <th className="px-5 py-3 font-medium">Status</th>
                        <th className="px-5 py-3 font-medium">Meaning</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["401", "Missing or expired bearer token"],
                        ["403", "Token valid but hospital not authorised for this resource"],
                        ["422", "Request body failed validation — check field types and required fields"],
                        ["503", "Payer intelligence model unavailable (cold start or missing model file)"],
                        ["500", "Unexpected server error — contact support with the request ID"],
                      ].map(([code, msg], i, arr) => (
                        <tr
                          key={code}
                          className={i !== arr.length - 1 ? "border-b" : ""}
                        >
                          <td className="px-5 py-3">
                            <Badge color={code.startsWith("5") ? "red" : code === "401" || code === "403" ? "amber" : "blue"}>
                              {code}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">{msg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Code examples */}
              <section id="sdks">
                <h2 className="text-2xl font-bold">Code examples</h2>
                <p className="mt-4 text-muted-foreground">
                  Full end-to-end examples for common languages. Replace credentials with your
                  actual values.
                </p>

                <h3 className="mt-8 text-base font-semibold">Python</h3>
                <div className="mt-3">
                  <CodeBlock code={PYTHON_PRECHECK} lang="python" />
                </div>

                <h3 className="mt-8 text-base font-semibold">Node.js (fetch)</h3>
                <div className="mt-3">
                  <CodeBlock code={NODE_PRECHECK} lang="javascript" />
                </div>

                <div className="mt-10 rounded-xl border border-[#1E6BFF]/30 bg-[#1E6BFF]/5 px-6 py-5">
                  <p className="font-semibold text-[#1E6BFF]">Need help integrating?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    We provide a 2-hour technical onboarding call for all pilot hospitals. Our
                    team can walk through your HIS architecture and set up the integration for
                    you.
                  </p>
                  <a
                    href="/contact"
                    className="mt-3 inline-block text-sm font-medium text-[#1E6BFF] hover:underline"
                  >
                    Book an integration call →
                  </a>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}
