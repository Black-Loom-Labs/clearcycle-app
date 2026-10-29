"use client"

import { useEffect, useState } from "react"

const STAGES = [
  { label: "Admission", sub: "Pre-auth to TPA" },
  { label: "During stay", sub: "Coding live" },
  { label: "Discharge", sub: "ClearCheck scan" },
  { label: "Approval", sub: "3-gate sign-off" },
  { label: "Submission", sub: "TPA portal" },
  { label: "Settlement", sub: "7–14 days" },
]

const HOLD_MS = 1800
const TRANSIT_MS = 550

export function WorkflowDiagram() {
  const [active, setActive] = useState(0)
  const [traveling, setTraveling] = useState(false)

  useEffect(() => {
    const hold = setTimeout(() => {
      setTraveling(true)
      const transit = setTimeout(() => {
        setActive((a) => (a + 1) % STAGES.length)
        setTraveling(false)
      }, TRANSIT_MS)
      return () => clearTimeout(transit)
    }, HOLD_MS)
    return () => clearTimeout(hold)
  }, [active])

  return (
    <div className="w-full overflow-x-auto">
      <style>{`
        @keyframes arrow-pulse {
          0%   { transform: translateX(-120%) translateY(-50%); opacity: 0; }
          15%  { opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateX(320%) translateY(-50%); opacity: 0; }
        }
        .wf-pulse { animation: arrow-pulse ${TRANSIT_MS}ms cubic-bezier(0.4,0,0.2,1) forwards; }
      `}</style>

      <div className="flex min-w-[580px] items-stretch py-6">
        {STAGES.map((stage, i) => {
          const dist = Math.abs(i - active)
          const isActive = i === active
          const isAdjacent = dist === 1
          const isFar = dist >= 3

          const opacity = isActive ? 1 : isAdjacent ? 0.5 : isFar ? 0.15 : 0.28
          const blur = dist >= 4 ? "blur-[1.5px]" : dist >= 3 ? "blur-[0.5px]" : ""
          const isArrowActive = traveling && i === active

          return (
            <div key={i} className="flex flex-1 items-center">
              {/* Stage pill */}
              <div
                className={`min-w-0 flex-1 transition-[opacity,filter] duration-500 ${blur}`}
                style={{ opacity }}
              >
                <div
                  className={`
                    mx-1 rounded-xl border px-3 py-3 text-center transition-all duration-500
                    ${isActive
                      ? "border-[#0F1F3D]/20 bg-white shadow-sm ring-[3px] ring-[#0F1F3D]/5"
                      : "border-[#EAE6DE] bg-[#FAFAF8]"
                    }
                  `}
                >
                  <p className={`text-xs font-semibold leading-tight transition-colors duration-500 ${isActive ? "text-[#0F1F3D]" : "text-[#8A8070]"}`}>
                    {stage.label}
                  </p>
                  <p className="mt-1 text-xs leading-tight text-[#B0A898]">
                    {stage.sub}
                  </p>
                </div>
              </div>

              {/* Arrow connector */}
              {i < STAGES.length - 1 && (
                <div className="relative flex w-8 shrink-0 items-center">
                  {/* Static line */}
                  <div className="h-px w-full bg-[#E8E4D8]" />
                  {/* Arrowhead */}
                  <svg
                    className="absolute -right-px shrink-0"
                    width="5" height="8" viewBox="0 0 5 8" fill="none"
                  >
                    <path
                      d="M1 1l3 3-3 3"
                      stroke={isArrowActive ? "#1E6BFF" : "#C8C4B8"}
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-colors duration-200"
                    />
                  </svg>
                  {/* Traveling glow */}
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
    </div>
  )
}
