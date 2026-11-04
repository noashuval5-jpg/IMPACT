/** Small shared presentational pieces. */

export function Card({
  title,
  children,
  className = "",
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`print-card rounded-2xl border border-line bg-white p-5 shadow-sm ${className}`}
    >
      {title ? <h2 className="mb-3 text-lg font-bold text-brand">{title}</h2> : null}
      {children}
    </section>
  );
}

export const btn = {
  primary:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60",
  secondary:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-brand/30 bg-white px-5 font-semibold text-brand hover:bg-brand-soft disabled:opacity-60",
  whatsapp:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#128c4a] px-5 font-semibold text-white hover:bg-[#0f7a40] disabled:opacity-60",
  danger:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-bad/30 bg-white px-5 font-semibold text-bad hover:bg-bad-soft disabled:opacity-60",
  small:
    "inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-line bg-white px-3 text-sm font-medium text-brand hover:bg-brand-soft disabled:opacity-60",
};

export const input =
  "block min-h-12 w-full rounded-xl border border-line bg-white px-3 text-base text-ink focus:border-brand";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "ok";
  children: React.ReactNode;
}) {
  const cls =
    tone === "error"
      ? "bg-bad-soft text-bad"
      : tone === "ok"
        ? "bg-ok-soft text-ok"
        : "bg-brand-soft text-brand";
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 ${cls}`}>
      {children}
    </p>
  );
}
