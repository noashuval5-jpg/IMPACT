"use client";

import { useEffect, useState, useTransition } from "react";
import { btn, Card, Field, input, Notice } from "@/components/ui";
import { useFormSubmit } from "@/components/useFormSubmit";
import type { Dict } from "@/lib/i18n/dict";
import { createGroup, deactivateGroup, updateGroup, type ActionResult } from "./actions";

type Row = { id: string; name: string; coach_id: string; coachName: string };
type CoachOption = { id: string; name: string };

function GroupForm({
  t,
  coaches,
  group,
  onDone,
}: {
  t: Dict;
  coaches: CoachOption[];
  group?: Row;
  onDone: () => void;
}) {
  const { state, pending, onSubmit } = useFormSubmit<ActionResult | null>(
    (formData) => (group ? updateGroup : createGroup)({ ok: false }, formData),
    null,
  );
  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      {group ? <input type="hidden" name="id" value={group.id} /> : null}
      <Field label={t.groupName}>
        <input name="name" required maxLength={100} defaultValue={group?.name} className={input} />
      </Field>
      <Field label={t.coach}>
        <select name="coach_id" required defaultValue={group?.coach_id ?? ""} className={input}>
          <option value="" disabled>
            {t.chooseCoach}
          </option>
          {coaches.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      {state && !state.ok ? (
        <div className="sm:col-span-2">
          <Notice tone="error">{t.errorTryAgain}</Notice>
        </div>
      ) : null}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" className={btn.primary} disabled={pending}>
          {t.save}
        </button>
        <button type="button" className={btn.secondary} onClick={onDone}>
          {t.cancel}
        </button>
      </div>
    </form>
  );
}

export function GroupsManager({
  t,
  rows,
  coaches,
}: {
  t: Dict;
  rows: Row[];
  coaches: CoachOption[];
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function deactivate(id: string) {
    if (!window.confirm(t.confirmDeactivate)) return;
    setError(false);
    startTransition(async () => {
      const res = await deactivateGroup(id);
      if (!res.ok) setError(true);
    });
  }

  return (
    <>
      {coaches.length === 0 ? (
        <Notice>{t.noCoaches}</Notice>
      ) : adding ? (
        <Card title={t.addGroup}>
          <GroupForm t={t} coaches={coaches} onDone={() => setAdding(false)} />
        </Card>
      ) : (
        <div>
          <button type="button" className={btn.primary} onClick={() => setAdding(true)}>
            + {t.addGroup}
          </button>
        </div>
      )}

      {error ? <Notice tone="error">{t.errorTryAgain}</Notice> : null}

      {rows.length === 0 ? (
        <p className="text-muted">{t.noGroupsAdmin}</p>
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {rows.map((g) => (
              <li key={g.id} className="py-3">
                {editing === g.id ? (
                  <GroupForm t={t} coaches={coaches} group={g} onDone={() => setEditing(null)} />
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{g.name}</p>
                      <p className="text-sm text-muted">
                        {t.coach}: {g.coachName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className={btn.small} onClick={() => setEditing(g.id)}>
                        {t.edit}
                      </button>
                      <button
                        type="button"
                        className={btn.small + " text-bad"}
                        disabled={pending}
                        onClick={() => deactivate(g.id)}
                      >
                        {t.deactivate}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
