"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2, AlertCircle, Loader2, ChevronRight, IndianRupee } from "lucide-react"

const CLAIM_LINES = [
  { id: "L1", procedure: "Total Knee Arthroplasty", cpt: "27447", icd: "M17.11", amount: 85000 },
  { id: "L2", procedure: "Anaesthesia – Major Orthopaedic", cpt: "00400", icd: "M17.11", amount: 12000 },
  { id: "L3", procedure: "Inpatient Room (4 nights)", cpt: "99232", icd: "M17.11", amount: 18000 },
  { id: "L4", procedure: "Post-op Physiotherapy (6 sessions)", cpt: "97110", icd: "M17.11", amount: 6500 },
]

const TOTAL_BILLED = CLAIM_LINES.reduce((s, l) => s + l.amount, 0)

type Risk = "high" | "medium" | "low"

interface LineResult {
  risk: Risk
  prob: number
  deduction: number
  reasons: string[]
  action: string
}

const RESULTS: Record<string, LineResult[]> = {
  star_health: [
    { risk: "high", prob: 0.78, deduction: 21250, reasons: ["Implant-only CPT without attached invoice", "Missing pre-auth reference number"], action: "Attach implant invoice and pre-auth approval before submission" },
    { risk: "low", prob: 0.08, deduction: 960, reasons: [], action: "No action needed" },
    { risk: "medium", prob: 0.42, deduction: 7560, reasons: ["Room upgrade — policy covers standard ward only"], action: "Split room charges: standard ward vs upgrade differential" },
    { risk: "low", prob: 0.11, deduction: 715, reasons: [], action: "No action needed" },
  ],
  icici_lombard: [
    { risk: "high", prob: 0.71, deduction: 18700, reasons: ["ICICI requires separate implant cost breakout form", "Pre-auth limit ₹80,000 — procedure exceeds cap"], action: "Submit implant breakout form and apply for pre-auth enhancement" },
    { risk: "low", prob: 0.06, deduction: 720, reasons: [], action: "No action needed" },
    { risk: "high", prob: 0.61, deduction: 10980, reasons: ["Room upgrade systematically deducted", "ICICI caps room at ₹3,000/night for this policy tier"], action: "Recode room charges to policy-permitted rate" },
    { risk: "medium", prob: 0.34, deduction: 2210, reasons: ["Post-discharge physio challenged without session notes"], action: "Attach physiotherapy session logs" },
  ],
  sbi_general: [
    { risk: "medium", prob: 0.38, deduction: 9775, reasons: ["Implant cost exceeds SBI package ceiling for this procedure"], action: "Verify itemised vs package billing option under SBI schedule" },
    { risk: "low", prob: 0.09, deduction: 1080, reasons: [], action: "No action needed" },
    { risk: "medium", prob: 0.45, deduction: 8100, reasons: ["Room entitlement: semi-private ward only", "4-night LOS above SBI average for this DRG"], action: "Justify extended stay with clinical notes" },
    { risk: "low", prob: 0.14, deduction: 910, reasons: [], action: "No action needed" },
  ],
}

const PAYERS = [
  { id: "star_health", label: "Star Health" },
  { id: "icici_lombard", label: "ICICI Lombard" },
  { id: "sbi_general", label: "SBI General" },
]

function RiskBadge({ risk }: { risk: Risk }) {
  const map = {
    high: "bg-red-50 text-red-600 border-red-200",
    medium: "bg-amber-50 text-amber-600 border-amber-200",
    low: "bg-emerald-50 text-emerald-600 border-emerald-200",
  }
  const label = { high: "High", medium: "Medium", low: "Low" }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${map[risk]}`}>
      {label[risk]}
    </span>
  )
}

function RiskIcon({ risk }: { risk: Risk }) {
  if (risk === "high") return <AlertTriangle className="size-4 shrink-0 text-red-500" />
  if (risk === "medium") return <AlertCircle className="size-4 shrink-0 text-amber-500" />
  return <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
}

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN")
}

export function PreCheckDemo() {
  const [payer, setPayer] = useState("star_health")
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle")
  const [visibleRows, setVisibleRows] = useState(0)

  function runCheck() {
    setStatus("loading")
    setVisibleRows(0)
    setTimeout(() => {
      setStatus("done")
      ;[0, 1, 2, 3].forEach((i) =>
        setTimeout(() => setVisibleRows((v) => v + 1), i * 120)
      )
    }, 1600)
  }

  function reset() {
    setStatus("idle")
    setVisibleRows(0)
  }

  const results = RESULTS[payer]
  const totalDeduction = results?.reduce((s, r) => s + r.deduction, 0) ?? 0
  const collectionRate = ((TOTAL_BILLED - totalDeduction) / TOTAL_BILLED) * 100
  const highCount = results?.filter((r) => r.risk === "high").length ?? 0

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#1E6BFF]">LIVE DEMO</p>
          <h3 className="mt-1 text-lg font-bold text-[#0F1F3D]">
            Try it — see deduction risk before you submit
          </h3>
          <p className="mt-1 text-sm text-[#8A8070]">
            Sample claim: knee arthroplasty · {fmt(TOTAL_BILLED)} billed
          </p>
        </div>
        {/* Payer selector */}
        <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
          {PAYERS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPayer(p.id); if (status === "done") reset() }}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                payer === p.id
                  ? "border-[#1E6BFF] bg-[#1E6BFF] text-white"
                  : "border-[#E0DAD0] text-[#8A8070] hover:border-[#1E6BFF] hover:text-[#1E6BFF]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left — claim lines */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#B0A898]">
            Claim Lines
          </p>
          <div className="overflow-hidden rounded-xl border border-[#EAE6DE]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#EAE6DE] bg-[#FAFAF8] text-left text-[#B0A898]">
                  <th className="px-4 py-2.5 font-medium">Procedure</th>
                  <th className="px-4 py-2.5 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {CLAIM_LINES.map((line, i) => (
                  <tr key={line.id} className={i !== CLAIM_LINES.length - 1 ? "border-b border-[#EAE6DE]" : ""}>
                    <td className="px-4 py-3">
                      <p className="text-[#0F1F3D]">{line.procedure}</p>
                      <p className="text-xs text-[#B0A898]">CPT {line.cpt} · {line.icd}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#5C5C6B]">
                      {fmt(line.amount)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-[#E0DAD0] bg-[#F4F0E8]">
                  <td className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#8A8070]">
                    Total billed
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-[#0F1F3D]">
                    {fmt(TOTAL_BILLED)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            onClick={status === "idle" || status === "loading" ? runCheck : reset}
            disabled={status === "loading"}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E6BFF] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1E6BFF]/90 disabled:opacity-60"
          >
            {status === "loading" ? (
              <><Loader2 className="size-4 animate-spin" />Scoring claim lines…</>
            ) : status === "done" ? (
              <>Try another payer above, or reset</>
            ) : (
              <>Run Pre-Check<ChevronRight className="size-4" /></>
            )}
          </button>
        </div>

        {/* Right — results */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#B0A898]">
            Risk Assessment
          </p>

          {status === "idle" && (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-[#E0DAD0] text-center">
              <p className="text-sm text-[#C0B8A8]">
                Select a payer and click <span className="text-[#8A8070]">Run Pre-Check</span>
              </p>
            </div>
          )}

          {status === "loading" && (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 rounded-xl border border-[#EAE6DE] bg-[#FAFAF8]">
              <Loader2 className="size-8 animate-spin text-[#1E6BFF]" />
              <p className="text-sm text-[#8A8070]">
                Scoring against {PAYERS.find((p) => p.id === payer)?.label} carrier profile…
              </p>
            </div>
          )}

          {status === "done" && (
            <div className="flex flex-col gap-3">
              {/* Summary bar */}
              <div className="rounded-xl border border-[#1E6BFF]/20 bg-[#EEF4FF] px-4 py-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <p className="text-xs text-[#8A8070]">Expected deduction</p>
                    <p className="font-bold text-red-500">{fmt(totalDeduction)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8A8070]">Collection rate</p>
                    <p className="font-bold text-[#0F1F3D]">{collectionRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#8A8070]">High-risk lines</p>
                    <p className="font-bold text-red-500">{highCount} of 4</p>
                  </div>
                </div>
              </div>

              {/* Per-line results */}
              {results.map((r, i) => (
                <div
                  key={i}
                  className={`rounded-xl border border-[#EAE6DE] bg-white p-4 transition-all duration-300 ${
                    i < visibleRows ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <RiskIcon risk={r.risk} />
                      <p className="text-sm font-medium text-[#0F1F3D]">
                        {CLAIM_LINES[i].procedure}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <RiskBadge risk={r.risk} />
                      <span className="text-xs font-semibold text-[#8A8070]">
                        {(r.prob * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  {r.reasons.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1 pl-6">
                      {r.reasons.map((reason) => (
                        <li key={reason} className="text-xs text-[#8A8070]">· {reason}</li>
                      ))}
                    </ul>
                  )}
                  {r.risk !== "low" && (
                    <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-[#EEF4FF] px-3 py-2">
                      <IndianRupee className="mt-0.5 size-3 shrink-0 text-[#1E6BFF]" />
                      <p className="text-xs text-[#5C5C6B]">
                        <span className="font-medium text-[#0F1F3D]">Expected deduction: </span>
                        {fmt(r.deduction)} — {r.action}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
