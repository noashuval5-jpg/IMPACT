/** Simple whistle mark. */
export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="12" fill="#1e3a8a" />
      {/* whistle body */}
      <circle cx="20" cy="28" r="9" fill="#ffffff" />
      <rect x="20" y="19" width="18" height="8" rx="2" fill="#ffffff" />
      {/* hole */}
      <circle cx="20" cy="28" r="3.2" fill="#1e3a8a" />
      {/* sound lines */}
      <path
        d="M33 13l3-4M38 15l4-2M28 12l0-4"
        stroke="#ffffff"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
