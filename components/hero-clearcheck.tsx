"use client"

import { useEffect, useState } from "react"

const PAYERS = ["Star Health", "ICICI Lombard", "SBI General"]

const LINES = [
  { procedure: "Total Knee Arthroplasty", amount: "₹85,000", risk: "high" as const, pct: 78, deduction: "₹21,250", fix: "Attach implant invoice and pre-auth reference" },
  { procedure: "Anaesthesia – Major Orthopaedic", amount: "₹12,000", risk: "low" as const, pct: 8, deduction: null, fix: null },
  { procedure: "Inpatient Room (4 nights)", amount: "₹18,000", risk: "medium" as const, pct: 42, deduction: "₹7,560", fix: "Split room charges: standard ward vs upgrade" },
  { procedure: "Post-op Physiotherapy", amount: "₹6,500", risk: "low" as const, pct: 11, deduction: null, fix: null },
]

const RESULTS_BY_PAYER: Record<string, typeof LINES> = {
  "Star Health": LINES,
  "ICICI Lombard": [
    { procedure: "Total Knee Arthroplasty", amount: "₹85,000", risk: "high", pct: 71, deduction: "₹18,700", fix: "Submit implant breakout form and request pre-auth enhancement" },
    { procedure: "Anaesthesia – Major Orthopaedic", amount: "₹12,000", risk: "low", pct: 6, deduction: null, fix: null },
    { procedure: "Inpatient Room (4 nights)", amount: "₹18,000", risk: "high", pct: 61, deduction: "₹10,980", fix: "Recode to policy-permitted room rate of ₹3,000/night" },
    { procedure: "Post-op Physiotherapy", amount: "₹6,500", risk: "medium", pct: 34, deduction: "₹2,210", fix: "Attach physiotherapy session logs" },
  ],
  "SBI General": [
    { procedure: "Total Knee Arthroplasty", amount: "₹85,000", risk: "medium", pct: 38, deduction: "₹9,775", fix: "Verify itemised vs package billing under SBI schedule" },
    { procedure: "Anaesthesia – Major Orthopaedic", amount: "₹12,000", risk: "low", pct: 9, deduction: null, fix: null },
    { procedure: "Inpatient Room (4 nights)", amount: "₹18,000", risk: "medium", pct: 45, deduction: "₹8,100", fix: "Justify extended stay with clinical notes" },
    { procedure: "Post-op Physiotherapy", amount: "₹6,500", risk: "low", pct: 14, deduction: null, fix: null },
  ],
}

type LineState = "pending" | "scanning" | "done"

export function HeroClearCheck() {
  const [payerIdx, setPayerIdx] = useState(0)
  const [lineStates, setLineStates] = useState<LineState[]>(["pending", "pending", "pending", "pending"])
  const [showSummary, setShowSummary] = useState(false)

  const payer = PAYERS[payerIdx]
  const lines = RESULTS_BY_PAYER[payer]
  const totalDeduction = lines.reduce((s, l) => s + (l.deduction ? parseInt(l.deduction.replace(/[₹,]/g, "")) : 0), 0)
  const flagged = lines.filter((l) => l.risk !== "low").length

  useEffect(() => {
    let cancelled = false
    setLineStates(["pending", "pending", "pending", "pending"])
    setShowSummary(false)

    const timers: ReturnType<typeof setTimeout>[] = []

    // Scan each line with a delay
    lines.forEach((_, i) => {
      timers.push(setTimeout(() => {
        if (cancelled) return
        setLineStates((s) => s.map((v, j) => j === i ? "scanning" : v))
      }, i * 700 + 300))

      timers.push(setTimeout(() => {
        if (cancelled) return
        setLineStates((s) => s.map((v, j) => j === i ? "done" : v))
      }, i * 700 + 900))
    })

    // Show summary
    timers.push(setTimeout(() => {
      if (cancelled) return
      setShowSummary(true)
    }, lines.length * 700 + 1000))

    // Cycle to next payer after pause
    timers.push(setTimeout(() => {
      if (cancelled) return
      setPayerIdx((p) => (p + 1) % PAYERS.length)
    }, lines.length * 700 + 4500))

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [payerIdx])

  return (
    <div className="flex h-full flex-col text-[#0F1F3D]">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-[#EAE6DE] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-2 rounded-full bg-[#1E6BFF]">
            <span className="absolute size-2 animate-ping rounded-full bg-[#1E6BFF] opacity-50" />
          </span>
          <p className="text-xs font-semibold text-[#1E6BFF]">ClearCheck scanning</p>
        </div>
        <div className="flex gap-1.5">
          {PAYERS.map((p, i) => (
            <span
              key={p}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-300 ${
                i === payerIdx
                  ? "bg-[#0F1F3D] text-white"
                  : "text-[#B0A898]"
              }`}
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Claim info */}
      <div className="border-b border-[#EAE6DE] px-5 py-2.5">
        <p className="text-xs text-[#8A8070]">Knee arthroplasty · ₹1,21,500 billed · {payer}</p>
      </div>

      {/* Lines */}
      <div className="flex-1 divide-y divide-[#F0EDE6]">
        {lines.map((line, i) => {
          const state = lineStates[i]
          const isHigh = line.risk === "high"
          const isMedium = line.risk === "medium"
          const isFlagged = isHigh || isMedium

          return (
            <div
              key={i}
              className={`relative px-5 py-3 transition-all duration-500 ${
                state === "done" && isFlagged ? "bg-[#FAFAF8]" : ""
              }`}
            >
              {/* Left risk stripe */}
              {state === "done" && isFlagged && (
                <span
                  className={`absolute inset-y-0 left-0 w-0.5 ${isHigh ? "bg-red-400" : "bg-orange-300"}`}
                />
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {/* State indicator */}
                  <span className="mt-0.5 shrink-0">
                    {state === "pending" && (
                      <span className="flex size-3.5 items-center justify-center rounded-full border border-[#E0DAD0]">
                        <span className="size-1 rounded-full bg-[#D4CEBC]" />
                      </span>
                    )}
                    {state === "scanning" && (
                      <span className="flex size-3.5 items-center justify-center rounded-full border border-[#1E6BFF] bg-[#EEF4FF]">
                        <span className="size-1.5 animate-pulse rounded-full bg-[#1E6BFF]" />
                      </span>
                    )}
                    {state === "done" && !isFlagged && (
                      <svg className="size-3.5 text-[#B0A898]" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {state === "done" && isFlagged && (
                      <svg className={`size-3.5 ${isHigh ? "text-red-400" : "text-orange-400"}`} viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M7 4.5v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    )}
                  </span>

                  <div>
                    <p className={`text-xs font-medium leading-snug ${state === "pending" ? "text-[#C0B8A8]" : "text-[#0F1F3D]"}`}>
                      {line.procedure}
                    </p>
                    {state === "done" && isFlagged && line.fix && (
                      <p className="mt-1 text-xs leading-snug text-[#8A8070]">{line.fix}</p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className={`text-xs font-medium ${state === "pending" ? "text-[#D4CEBC]" : "text-[#5C5C6B]"}`}>
                    {line.amount}
                  </p>
                  {state === "done" && line.deduction && (
                    <p className={`text-xs font-semibold ${isHigh ? "text-red-500" : "text-orange-500"}`}>
                      -{line.deduction}
                    </p>
                  )}
                  {state === "done" && !isFlagged && (
                    <p className="text-xs text-[#B0A898]">{line.pct}% risk</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div
        className={`border-t border-[#EAE6DE] px-5 py-3 transition-all duration-500 ${
          showSummary ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#8A8070]">Expected deduction</p>
            <p className="text-sm font-bold text-red-500">
              ₹{totalDeduction.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#8A8070]">{flagged} line{flagged !== 1 ? "s" : ""} flagged</p>
            <p className="text-xs font-medium text-[#1E6BFF]">fixes ready to apply</p>
          </div>
        </div>
      </div>
    </div>
  )
}
