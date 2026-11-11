"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { btn, Card, Notice } from "@/components/ui";
import type { CoachGroup } from "@/lib/data/coach";
import { formatTimestamp } from "@/lib/format";
import type { Dict } from "@/lib/i18n/dict";
import { fillTemplate } from "@/lib/phone";
import { markDone, undoDone } from "./actions";

export function GroupsCard({
  token,
  groups,
  t,
}: {
  token: string;
  groups: CoachGroup[];
  t: Dict;
}) {
  const router = useRouter();
  // A coach without groups still gets one "done" button; the server creates the group on first use.
  const rows: CoachGroup[] = groups.length > 0 ? groups : [{ id: "default", name: t.myGroup, doneAt: null }];
  const [state, setState] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(rows.map((g) => [g.id, g.doneAt])),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [, startTransition] = useTransition();

  function toggle(groupId: string, makeDone: boolean) {
    const previous = state[groupId] ?? null;
    // Optimistic update: flip immediately, roll back on failure.
    setState((s) => ({ ...s, [groupId]: makeDone ? new Date().toISOString() : null }));
    setError(false);
    setBusy(groupId);
    startTransition(async () => {
      const res = makeDone ? await markDone(token, groupId) : await undoDone(token, groupId);
      if (res.ok) {
        setState((s) => ({ ...s, [groupId]: res.doneAt }));
        if (res.groupId && res.groupId !== groupId) router.refresh();
      } else {
        setState((s) => ({ ...s, [groupId]: previous }));
        setError(true);
      }
      setBusy(null);
    });
  }

  return (
    <Card title={t.myGroups}>
      <ul className="grid gap-3">
          {rows.map((g) => {
            // After the server creates the default group, the real group arrives as a new row.
            const doneAt = g.id in state ? (state[g.id] ?? null) : g.doneAt;
            return (
              <li
                key={g.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 transition-colors ${
                  doneAt ? "border-ok/30 bg-ok-soft" : "border-line bg-white"
                }`}
              >
                <div className="min-w-0">
                  <p className="font-semibold">{g.name}</p>
                  {doneAt ? (
                    <p className="text-sm text-ok">
                      ✓ {fillTemplate(t.doneOn, { date: formatTimestamp(doneAt) })}
                    </p>
                  ) : null}
                </div>
                {doneAt ? (
                  <button
                    type="button"
                    className={btn.small + " min-h-12 px-4"}
                    disabled={busy === g.id}
                    onClick={() => toggle(g.id, false)}
                  >
                    {t.undo}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={btn.primary + " min-w-28"}
                    disabled={busy === g.id}
                    onClick={() => toggle(g.id, true)}
                  >
                    {t.done}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      {error ? (
        <div className="mt-3">
          <Notice tone="error">{t.errorTryAgain}</Notice>
        </div>
      ) : null}
    </Card>
  );
}
