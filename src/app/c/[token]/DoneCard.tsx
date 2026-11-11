"use client";

import { useState, useTransition } from "react";
import { btn, Card, Notice } from "@/components/ui";
import { formatTimestamp } from "@/lib/format";
import type { Dict } from "@/lib/i18n/dict";
import { fillTemplate } from "@/lib/phone";
import { markDone, undoDone } from "./actions";

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
  const [pending, startTransition] = useTransition();

  function toggle(makeDone: boolean) {
    const previous = doneAt;
    // Optimistic update: flip immediately, roll back on failure.
    setDoneAt(makeDone ? new Date().toISOString() : null);
    setError(false);
    startTransition(async () => {
      const res = makeDone ? await markDone(token) : await undoDone(token);
      if (res.ok) {
        setDoneAt(res.doneAt);
      } else {
        setDoneAt(previous);
        setError(true);
      }
    });
  }

  return (
    <Card
      title={t.deliveredQuestion}
      className={doneAt ? "border-ok/40 bg-ok-soft transition-colors" : "transition-colors"}
    >
      {doneAt ? (
        <div className="grid gap-3">
          <p className="text-lg font-semibold text-ok">
            ✓ {fillTemplate(t.doneOn, { date: formatTimestamp(doneAt) })}
          </p>
          <button
            type="button"
            className={btn.small + " min-h-12 justify-self-start px-4"}
            disabled={pending}
            onClick={() => toggle(false)}
          >
            {t.undo}
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={btn.primary + " w-full text-lg"}
          disabled={pending}
          onClick={() => toggle(true)}
        >
          ✓ {t.done}
        </button>
      )}
      {error ? (
        <div className="mt-3">
          <Notice tone="error">{t.errorTryAgain}</Notice>
        </div>
      ) : null}
    </Card>
  );
}
