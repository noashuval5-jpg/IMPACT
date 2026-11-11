/** Small shared presentational pieces. */

export type Accent = "sky" | "lime" | "sun" | "grape" | "flame";

const ACCENT: Record<Accent, { bar: string; bubble: string }> = {
  sky: { bar: "border-t-sky", bubble: "bg-brand-soft text-brand" },
  lime: { bar: "border-t-lime", bubble: "bg-ok-soft text-ok" },
  sun: { bar: "border-t-sun", bubble: "bg-warn-soft text-warn" },
  grape: { bar: "border-t-grape", bubble: "bg-grape-soft text-grape" },
  flame: { bar: "border-t-flame", bubble: "bg-bad-soft text-bad" },
};

export function Card({
  title,
  children,
  className = "",
  icon,
  accent,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  accent?: Accent;
}) {
  const a = accent ? ACCENT[accent] : null;
  return (
    <section
      className={`print-card rise min-w-0 rounded-3xl border border-line bg-white p-5 shadow-[0_6px_24px_-12px_rgb(18_53_66/0.25)] ${
        a ? `border-t-4 ${a.bar}` : ""
      } ${className}`}
    >
      {title ? (
        <h2 className="mb-3 flex items-center gap-2.5 text-lg font-bold text-ink">
          {icon ? (
            <span
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                a ? a.bubble : "bg-brand-soft text-brand"
              }`}
            >
              {icon}
            </span>
          ) : null}
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 font-bold transition active:scale-[0.98] disabled:opacity-60";

export const btn = {
  primary: `${base} bg-sky text-ink shadow-[0_4px_0_0_#2a9cc0] hover:bg-sky-dark`,
  secondary: `${base} border-2 border-sky bg-white text-brand hover:bg-brand-soft`,
  whatsapp: `${base} bg-lime text-ink shadow-[0_4px_0_0_#86b03a] hover:brightness-95`,
  danger: `${base} border-2 border-flame/50 bg-white text-bad hover:bg-bad-soft`,
  small:
    "inline-flex min-h-10 items-center justify-center gap-1 rounded-xl border border-line bg-white px-3 text-sm font-semibold text-brand transition hover:border-sky hover:bg-brand-soft disabled:opacity-60",
};

export const input =
  "block min-h-12 w-full rounded-xl border border-line bg-white px-3 text-base text-ink focus:border-sky";

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
