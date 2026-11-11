/** Whistle mark in the brand palette. */
export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="14" fill="#4dc1e5" />
      <circle cx="40" cy="41" r="9" fill="#a7d05b" opacity="0.9" />
      {/* whistle body */}
      <circle cx="20" cy="28" r="9" fill="#ffffff" />
      <rect x="20" y="19" width="18" height="8" rx="2" fill="#ffffff" />
      <circle cx="20" cy="28" r="3.4" fill="#784199" />
      {/* sound lines */}
      <path
        d="M33 13l3-4M38 15l4-2M28 12l0-4"
        stroke="#ffd503"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Thin four-colour stripe (lime · sun · grape · flame) used under headers. */
export function ColorStripe({ className = "h-1" }: { className?: string }) {
  return (
    <div className={`flex w-full ${className}`} aria-hidden="true">
      <span className="flex-1 bg-sky" />
      <span className="flex-1 bg-lime" />
      <span className="flex-1 bg-sun" />
      <span className="flex-1 bg-grape" />
      <span className="flex-1 bg-flame" />
    </div>
  );
}
