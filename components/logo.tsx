export function Logo({ className }: { className?: string }) {
  return (
    <svg width="180" height="47" viewBox="0 0 380 100" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="40" fill="#EAF2FF"/>
      <path d="M 60 32.68 A 20 20 0 1 1 35.14 36.62" fill="none" stroke="#1E6BFF" strokeWidth="5" strokeLinecap="round"/>
      <path d="M 41.83 29.19 L 39.6 40.63 L 30.68 32.61 Z" fill="#1E6BFF"/>
      <text x="102" y="55" fontFamily="Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" fontSize="36" fontWeight="600" letterSpacing="-0.8">
        <tspan fill="#0A0A0F">Clear</tspan><tspan fill="#1E6BFF">Cycle</tspan>
      </text>
      <text x="102" y="76" fontFamily="Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" fontSize="13" fontWeight="500" letterSpacing="1.2" fill="#5C5C6B">CLAIMS INTELLIGENCE PLATFORM</text>
    </svg>
  )
}
