"use client";

import { useState, useTransition } from "react";
import { CheckCircleIcon } from "@/components/icons";
import { btn, Card, Notice } from "@/components/ui";
import { formatTimestamp } from "@/lib/format";
import type { Dict } from "@/lib/i18n/dict";
import { fillTemplate } from "@/lib/phone";
import { markDone, undoDone } from "./actions";

const COLORS = ["#4dc1e5", "#a7d05b", "#ffd503", "#784199", "#f15730"];

/** Palette dots that fly out once when the coach marks the week as done. */
function Burst({ seed }: { seed: number }) {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2 + seed;
        const dist = 70 + (i % 3) * 22;
        return (
          <span
            key={`${seed}-${i}`}
            className="burst-dot absolute h-2.5 w-2.5 rounded-full"
            style={
              {
                background: COLORS[i % COLORS.length],
                "--dx": `${Math.cos(angle) * dist}px`,
                "--dy": `${Math.sin(angle) * dist}px`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </span>
  );
}

/** One big "done" button for this week, with undo until the week ends. */
export function DoneCard({
  token,
  initialDoneAt,
  t,
}: {
  token: string;
  initialDoneAt: string | null;
  t: Dict;
}) {
  const [doneAt, setDoneAt] = useState<string | null>(initialDoneAt);
  const [error, setError] = useState(false);
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(makeDone: boolean) {
    const previous = doneAt;
    // Optimistic update: flip immediately, roll back on failure.
    setDoneAt(makeDone ? new Date().toISOString() : null);
    setCelebrate(makeDone ? Date.now() % 1000 : null);
    setError(false);
    startTransition(async () => {
      const res = makeDone ? await markDone(token) : await undoDone(token);
      if (res.ok) {
        setDoneAt(res.doneAt);
      } else {
        setDoneAt(previous);
        setCelebrate(null);
        setError(true);
      }
    });
  }

  return (
    <Card
      title={t.deliveredQuestion}
      icon={<CheckCircleIcon />}
      accent="grape"
      className={doneAt ? "bg-gradient-to-b from-ok-soft to-white transition-colors" : ""}
    >
      <div className="relative">
        {celebrate !== null && doneAt ? <Burst seed={celebrate} /> : null}
        {doneAt ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="pop inline-flex h-14 w-14 items-center justify-center rounded-full bg-lime text-3xl font-black text-ink shadow-[0_4px_0_0_#86b03a]">
                ✓
              </span>
              <p className="text-lg font-bold text-ok">
                {fillTemplate(t.doneOn, { date: formatTimestamp(doneAt) })}
              </p>
            </div>
            <button
              type="button"
              className={btn.small + " min-h-12 px-4"}
              disabled={pending}
              onClick={() => toggle(false)}
            >
              {t.undo}
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={btn.primary + " min-h-16 w-full text-xl"}
            disabled={pending}
            onClick={() => toggle(true)}
          >
            ✓ {t.done}
          </button>
        )}
      </div>
      {error ? (
        <div className="mt-3">
          <Notice tone="error">{t.errorTryAgain}</Notice>
        </div>
      ) : null}
    </Card>
  );
}
