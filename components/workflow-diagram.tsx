export function WorkflowDiagram() {
  const steps = [
    { n: "01", label: "Patient Discharge", sub: "Discharge summary generated in HIS" },
    { n: "02", label: "AI Medical Coding", sub: "ICD-10 + CPT with CCI & MUE validation" },
    { n: "03", label: "Policy Adjudication", sub: "Coverage verified, patient liability calculated" },
    { n: "04", label: "Payer Intelligence", sub: "Per-line deduction risk scored before submit" },
    { n: "05", label: "3-Gate Approval", sub: "Doctor → Billing → Admin via SMS OTP" },
    { n: "06", label: "TPA Submission", sub: "Autonomous portal submission, status tracked" },
  ]

  return (
    <div className="w-full overflow-x-auto">
      {/* Main flow */}
      <div className="flex min-w-[680px] items-stretch gap-0">
        {steps.map((step, i) => (
          <div key={step.n} className="flex flex-1 items-stretch">
            <div className="flex flex-1 flex-col">
              {/* Step card */}
              <div className="relative flex flex-1 flex-col rounded-2xl border border-[#E8E4D8] bg-white p-5 shadow-sm">
                <span className="text-xs font-bold text-[#1E6BFF]">{step.n}</span>
                <p className="mt-2 text-sm font-semibold leading-snug text-[#0F1F3D]">{step.label}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#8A8070]">{step.sub}</p>
              </div>
            </div>
            {/* Arrow connector */}
            {i < steps.length - 1 && (
              <div className="flex flex-col items-center justify-center px-1.5 pt-2">
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                  <path d="M0 8h16M12 3l5 5-5 5" stroke="#D4CEBC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Denial branch */}
      <div className="mt-3 flex min-w-[680px] items-start gap-0">
        {/* Spacer to align with last step */}
        <div className="flex-[5]" />
        <div className="flex flex-1 flex-col items-center">
          {/* Down arrow from step 6 */}
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" className="mt-0">
            <path d="M8 0v16M3 12l5 5 5-5" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-xs font-bold text-red-500">IF DENIED</p>
            <p className="mt-1 text-sm font-semibold text-[#0F1F3D]">Appeal Letter</p>
            <p className="mt-1 text-xs text-[#8A8070]">IRDAI-compliant draft in 60 seconds</p>
          </div>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path d="M8 0v16M3 12l5 5 5-5" stroke="#D4CEBC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
            <p className="text-xs font-bold text-emerald-600">RESOLUTION</p>
            <p className="mt-1 text-sm font-semibold text-[#0F1F3D]">Settlement</p>
            <p className="mt-1 text-xs text-[#8A8070]">7-14 days vs 45-90 day industry avg</p>
          </div>
        </div>
        <div className="flex-[0.5]" />
      </div>
    </div>
  )
}
