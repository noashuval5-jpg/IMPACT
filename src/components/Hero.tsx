import { Logo } from "./Logo";

/**
 * Bright sky banner with palette circles, a crosswalk and a floating whistle.
 * Text on it is dark ink (readable on the sky blue).
 */
export function Hero({
  title,
  subtitle,
  badge,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <section className="rise relative overflow-hidden rounded-3xl bg-gradient-to-bl from-sky to-[#7fd3ee] p-5 text-ink shadow-[0_10px_30px_-14px_rgb(11_102_131/0.6)]">
      {/* palette circles: kept on the far (end) side so they never sit under the text */}
      <span aria-hidden="true" className="absolute -top-10 -end-10 h-32 w-32 rounded-full bg-sun/90" />
      <span aria-hidden="true" className="absolute -bottom-12 end-24 h-24 w-24 rounded-full bg-lime/80" />
      <span aria-hidden="true" className="absolute bottom-4 end-4 h-5 w-5 rounded-full bg-flame" />
      <span aria-hidden="true" className="absolute top-4 end-28 h-3.5 w-3.5 rounded-full bg-grape" />
      {/* crosswalk stripes along the bottom edge */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2 opacity-50"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, #ffffff 0 18px, transparent 18px 30px)",
        }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{title}</h1>
          {subtitle ? <div className="mt-1 font-medium text-ink/80">{subtitle}</div> : null}
          {badge ? <div className="mt-3">{badge}</div> : null}
        </div>
        <div className="float relative shrink-0 rounded-3xl bg-white p-2 shadow-md">
          <Logo className="h-14 w-14" />
        </div>
      </div>
    </section>
  );
}
