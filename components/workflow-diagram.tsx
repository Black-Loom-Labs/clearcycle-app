export function WorkflowDiagram() {
  const phases = [
    {
      phase: "Admission",
      color: "#EEF4FF",
      border: "#BFDBFE",
      accent: "#1E6BFF",
      steps: [
        { label: "Patient arrives", sub: "Registration details captured" },
        { label: "Pre-auth sent", sub: "Automatic request to TPA, eligibility verified in minutes" },
      ],
    },
    {
      phase: "During Stay",
      color: "#F0FDF4",
      border: "#BBF7D0",
      accent: "#059669",
      steps: [
        { label: "Documents captured", sub: "Clinical notes, lab reports, scans - all logged continuously" },
        { label: "Coding runs live", sub: "Codes suggested in the background as the case progresses" },
      ],
    },
    {
      phase: "Discharge",
      color: "#FFFBEB",
      border: "#FDE68A",
      accent: "#D97706",
      steps: [
        { label: "Discharge summary", sub: "Final diagnosis and procedures locked in" },
        { label: "ClearCheck scan", sub: "Every claim line scored for deduction risk before submission" },
        { label: "3-gate approval", sub: "Doctor → Billing → Admin signs off digitally via OTP" },
      ],
    },
    {
      phase: "Outcome",
      color: "#FFF",
      border: "#EAE6DE",
      accent: "#5C5C6B",
      steps: [],
      isOutcome: true,
    },
  ]

  return (
    <div className="w-full">
      {/* Phase columns */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {phases.map((p, pi) => (
          <div key={p.phase}>
            {/* Phase header */}
            <div
              className="mb-3 rounded-full px-3 py-1.5 text-center text-xs font-bold"
              style={{ background: p.color, border: `1px solid ${p.border}`, color: p.accent }}
            >
              {p.phase}
            </div>

            {p.isOutcome ? (
              /* Outcome column — two result cards */
              <div className="flex flex-col gap-3">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-bold text-emerald-600">APPROVED</p>
                  <p className="mt-1 text-sm font-semibold text-[#0F1F3D]">Payment in 7-14 days</p>
                  <p className="mt-1 text-xs text-[#8A8070]">vs 45-90 day industry average</p>
                </div>
                <div className="flex items-center justify-center py-1">
                  <span className="text-xs font-medium text-[#B0A898]">— or —</span>
                </div>
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs font-bold text-red-500">IF DENIED</p>
                  <p className="mt-1 text-sm font-semibold text-[#0F1F3D]">Appeal in 60 seconds</p>
                  <p className="mt-1 text-xs text-[#8A8070]">IRDAI-compliant letter, cites exact denial reason</p>
                  <div className="mt-3 border-t border-red-100 pt-3">
                    <p className="text-xs font-bold text-emerald-600">SETTLEMENT</p>
                    <p className="mt-0.5 text-xs text-[#8A8070]">Typically resolved in 7-14 days</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Step cards */
              <div className="flex flex-col gap-3">
                {p.steps.map((step, si) => (
                  <div
                    key={si}
                    className="rounded-2xl border border-[#EAE6DE] bg-white p-4 shadow-sm"
                  >
                    <div
                      className="mb-2 size-1.5 rounded-full"
                      style={{ background: p.accent }}
                    />
                    <p className="text-sm font-semibold leading-snug text-[#0F1F3D]">{step.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#8A8070]">{step.sub}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Flow arrow */}
      <div className="mt-5 flex items-center justify-center gap-2">
        <div className="h-px flex-1 bg-[#EAE6DE]" />
        <p className="shrink-0 text-xs text-[#B0A898]">
          Claim submitted automatically after approval · status tracked daily
        </p>
        <div className="h-px flex-1 bg-[#EAE6DE]" />
      </div>
    </div>
  )
}
