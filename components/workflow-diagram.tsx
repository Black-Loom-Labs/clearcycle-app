"use client"

import { useEffect, useState } from "react"
import { FileText } from "lucide-react"

interface DocEvent {
  name: string
  tag: string
}

interface Stage {
  label: string
  sub: string
  docs: DocEvent[]
}

const STAGES: Stage[] = [
  {
    label: "Admission",
    sub: "Pre-auth sent",
    docs: [
      { name: "Consent form", tag: "v1 · uploaded" },
      { name: "Pre-auth request", tag: "sent to TPA" },
    ],
  },
  {
    label: "During stay",
    sub: "Coding runs live",
    docs: [
      { name: "Clinical notes", tag: "v4 · updated" },
      { name: "Lab reports", tag: "+3 documents" },
      { name: "Invoice draft", tag: "v2 · in progress" },
    ],
  },
  {
    label: "Discharge",
    sub: "ClearCheck scan",
    docs: [
      { name: "Discharge summary", tag: "final · locked" },
      { name: "Claim bundle", tag: "v1 · generated" },
    ],
  },
  {
    label: "Approval",
    sub: "3-gate sign-off",
    docs: [
      { name: "Doctor OTP log", tag: "signed · timestamped" },
      { name: "Billing sign-off", tag: "recorded" },
      { name: "Audit entry", tag: "compliance log" },
    ],
  },
  {
    label: "Submission",
    sub: "TPA portal",
    docs: [
      { name: "Claim bundle", tag: "v1 · submitted" },
      { name: "Portal receipt", tag: "stored · versioned" },
    ],
  },
  {
    label: "Settlement",
    sub: "7–14 days",
    docs: [
      { name: "Remittance advice", tag: "received · matched" },
      { name: "Reconciliation report", tag: "complete" },
    ],
  },
]

const HOLD_MS = 1800
const TRANSIT_MS = 550

export function WorkflowDiagram() {
  const [active, setActive] = useState(0)
  const [traveling, setTraveling] = useState(false)
  const [docsVisible, setDocsVisible] = useState(true)

  useEffect(() => {
    const hold = setTimeout(() => {
      setDocsVisible(false)
      setTraveling(true)
      const transit = setTimeout(() => {
        setActive((a) => (a + 1) % STAGES.length)
        setTraveling(false)
        setDocsVisible(true)
      }, TRANSIT_MS)
      return () => clearTimeout(transit)
    }, HOLD_MS)
    return () => clearTimeout(hold)
  }, [active])

  const activeDocs = STAGES[active].docs

  return (
    <div className="w-full">
      <style>{`
        @keyframes arrow-pulse {
          0%   { transform: translateX(-120%) translateY(-50%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(320%) translateY(-50%); opacity: 0; }
        }
        @keyframes arrow-pulse-v {
          0%   { transform: translateY(-100%) translateX(-50%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(200%) translateX(-50%); opacity: 0; }
        }
        .wf-pulse   { animation: arrow-pulse   ${TRANSIT_MS}ms cubic-bezier(0.4,0,0.2,1) forwards; }
        .wf-pulse-v { animation: arrow-pulse-v ${TRANSIT_MS}ms cubic-bezier(0.4,0,0.2,1) forwards; }
      `}</style>

      {/* ── MOBILE: vertical flow ── */}
      <div className="sm:hidden">
        <div className="flex flex-col">
          {STAGES.map((stage, i) => {
            const dist = Math.abs(i - active)
            const isActive = i === active
            const isArrowActive = traveling && i === active
            const opacity = isActive ? 1 : dist === 1 ? 0.55 : dist === 2 ? 0.32 : 0.15
            const blur = dist >= 3 ? "blur-[0.5px]" : ""

            return (
              <div key={i}>
                <div
                  className={`transition-[opacity,filter] duration-500 ${blur}`}
                  style={{ opacity }}
                >
                  <div
                    className={`rounded-xl border px-4 py-3 transition-all duration-500 ${
                      isActive
                        ? "border-[#0F1F3D]/20 bg-white shadow-sm ring-[3px] ring-[#0F1F3D]/5"
                        : "border-[#EAE6DE] bg-[#FAFAF8]"
                    }`}
                  >
                    <p className={`text-sm font-semibold transition-colors duration-500 ${isActive ? "text-[#0F1F3D]" : "text-[#8A8070]"}`}>
                      {stage.label}
                    </p>
                    <p className="mt-0.5 text-xs text-[#B0A898]">{stage.sub}</p>
                  </div>
                </div>

                {i < STAGES.length - 1 && (
                  <div className="relative my-1 flex h-7 items-center overflow-hidden pl-5">
                    <div className="h-full w-px bg-[#E8E4D8]" />
                    <svg className="absolute bottom-0 left-[17px] -translate-x-1/2" width="8" height="5" viewBox="0 0 8 5" fill="none">
                      <path d="M1 1l3 3 3-3" stroke={isArrowActive ? "#1E6BFF" : "#C8C4B8"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="transition-colors duration-200" />
                    </svg>
                    {isArrowActive && (
                      <div
                        className="wf-pulse-v pointer-events-none absolute left-[18px] top-0 h-5 w-px -translate-x-1/2 rounded-full"
                        style={{
                          background: "linear-gradient(to bottom, transparent, #1E6BFF 40%, #1E6BFF 60%, transparent)",
                          boxShadow: "1px 0 6px 1px #1E6BFF88",
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Doc panel — always rendered below all pills, min-h prevents flicker */}
        <div className="mt-4">
          <div
            className={`min-h-[100px] rounded-2xl border border-[#EAE6DE] bg-white px-4 py-3 transition-all duration-300 ${
              docsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
            }`}
          >
            <div className="flex flex-col gap-2">
              {activeDocs.map((doc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <FileText className="size-3 shrink-0 text-[#B0A898]" strokeWidth={1.5} />
                  <span className="text-xs font-medium text-[#0F1F3D]">{doc.name}</span>
                  <span className="text-xs text-[#B0A898]">· {doc.tag}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-[#C0B8A8]">All versions logged · IRDAI audit trail</p>
          </div>
        </div>
      </div>

      {/* ── DESKTOP: horizontal flow ── */}
      <div className="hidden overflow-x-hidden overflow-y-hidden sm:block">
        <div className="flex min-w-0 items-stretch pt-6">
          {STAGES.map((stage, i) => {
            const dist = Math.abs(i - active)
            const isActive = i === active
            const isAdjacent = dist === 1
            const isFar = dist >= 3
            const isArrowActive = traveling && i === active

            const opacity = isActive ? 1 : isAdjacent ? 0.5 : isFar ? 0.15 : 0.28
            const blur = dist >= 4 ? "blur-[1.5px]" : dist >= 3 ? "blur-[0.5px]" : ""

            return (
              <div key={i} className="flex flex-1 items-center">
                <div
                  className={`min-w-0 flex-1 transition-[opacity,filter] duration-500 ${blur}`}
                  style={{ opacity }}
                >
                  <div
                    className={`mx-1 rounded-xl border px-3 py-3 text-center transition-all duration-500 ${
                      isActive
                        ? "border-[#0F1F3D]/20 bg-white shadow-sm ring-[3px] ring-[#0F1F3D]/5"
                        : "border-[#EAE6DE] bg-[#FAFAF8]"
                    }`}
                  >
                    <p className={`text-xs font-semibold leading-tight transition-colors duration-500 ${isActive ? "text-[#0F1F3D]" : "text-[#8A8070]"}`}>
                      {stage.label}
                    </p>
                    <p className="mt-1 text-xs leading-tight text-[#B0A898]">{stage.sub}</p>
                  </div>
                  <div className={`flex justify-center transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}>
                    <div className="h-4 w-px bg-[#E0DAD0]" />
                  </div>
                </div>

                {i < STAGES.length - 1 && (
                  <div className="relative flex w-8 shrink-0 items-center overflow-hidden">
                    <div className="h-px w-full bg-[#E8E4D8]" />
                    <svg className="absolute -right-px shrink-0" width="5" height="8" viewBox="0 0 5 8" fill="none">
                      <path
                        d="M1 1l3 3-3 3"
                        stroke={isArrowActive ? "#1E6BFF" : "#C8C4B8"}
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-colors duration-200"
                      />
                    </svg>
                    {isArrowActive && (
                      <div
                        className="wf-pulse pointer-events-none absolute left-0 top-1/2 h-px w-6 rounded-full"
                        style={{
                          background: "linear-gradient(to right, transparent, #1E6BFF 40%, #1E6BFF 60%, transparent)",
                          boxShadow: "0 0 6px 1px #1E6BFF88",
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Doc panel — min-h prevents layout shift between 2-doc and 3-doc stages */}
        <div>
          <div
            className={`mx-1 rounded-2xl border border-[#EAE6DE] bg-white px-5 py-4 transition-all duration-300 ${
              docsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
            }`}
          >
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex min-h-[32px] flex-1 flex-wrap content-start gap-2">
                {activeDocs.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 rounded-lg border border-[#EAE6DE] bg-[#FAFAF8] px-3 py-1.5"
                    style={{ transitionDelay: `${i * 60}ms` }}
                  >
                    <FileText className="size-3 shrink-0 text-[#B0A898]" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-[#0F1F3D]">{doc.name}</span>
                    <span className="text-xs text-[#B0A898]">· {doc.tag}</span>
                  </div>
                ))}
              </div>
              <p className="shrink-0 self-center text-xs text-[#C0B8A8]">
                All versions logged · IRDAI audit trail
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
