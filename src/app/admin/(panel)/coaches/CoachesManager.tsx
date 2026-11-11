"use client";

import { useEffect, useState, useTransition } from "react";
import { CopyButton } from "@/components/CopyButton";
import { btn, Card, Field, input, Notice } from "@/components/ui";
import { useFormSubmit } from "@/components/useFormSubmit";
import type { Dict, Lang } from "@/lib/i18n/dict";
import {
  createCoach,
  deactivateCoach,
  regenerateToken,
  updateCoach,
  type ActionResult,
} from "./actions";

export type CoachRow = {
  id: string;
  full_name: string;
  role: string;
  phone: string;
  language: Lang;
  link: string;
  welcomeHref: string | null;
};

function CoachForm({
  t,
  coach,
  onDone,
}: {
  t: Dict;
  coach?: CoachRow;
  onDone: () => void;
}) {
  const { state, pending, onSubmit } = useFormSubmit<ActionResult | null>(
    (formData) => (coach ? updateCoach : createCoach)({ ok: false }, formData),
    null,
  );
  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      {coach ? <input type="hidden" name="id" value={coach.id} /> : null}
      <Field label={t.name}>
        <input name="full_name" required maxLength={100} defaultValue={coach?.full_name} className={input} />
      </Field>
      <Field label={t.role}>
        <input name="role" maxLength={100} defaultValue={coach?.role} className={input} />
      </Field>
      <Field label={t.phone}>
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          dir="ltr"
          maxLength={30}
          defaultValue={coach?.phone}
          placeholder="050-0000000"
          className={input + " text-start"}
        />
      </Field>
      <Field label={t.language}>
        <select name="language" defaultValue={coach?.language ?? "ar"} className={input}>
          <option value="ar">العربية</option>
          <option value="he">עברית</option>
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

export function CoachesManager({ t, rows }: { t: Dict; rows: CoachRow[] }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function run(fn: () => Promise<ActionResult>, confirmText: string) {
    if (!window.confirm(confirmText)) return;
    setError(false);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(true);
    });
  }

  return (
    <>
      {adding ? (
        <Card title={t.addCoach}>
          <CoachForm t={t} onDone={() => setAdding(false)} />
        </Card>
      ) : (
        <div>
          <button type="button" className={btn.primary} onClick={() => setAdding(true)}>
            + {t.addCoach}
          </button>
        </div>
      )}

      {error ? <Notice tone="error">{t.errorTryAgain}</Notice> : null}

      {rows.length === 0 ? (
        <p className="text-muted">{t.noCoaches}</p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {rows.map((c) => (
            <li key={c.id} className="min-w-0">
              <Card>
                {editing === c.id ? (
                  <CoachForm t={t} coach={c} onDone={() => setEditing(null)} />
                ) : (
                  <div className="grid min-w-0 gap-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-lg font-bold">{c.full_name}</p>
                        <p className="text-sm text-muted">
                          {[c.role, c.language === "ar" ? "العربية" : "עברית"]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <p className="text-sm text-muted" dir="ltr">
                          {c.phone || t.noPhone}
                        </p>
                      </div>
                      <button type="button" className={btn.small} onClick={() => setEditing(c.id)}>
                        {t.edit}
                      </button>
                    </div>

                    <div className="min-w-0">
                      <p className="mb-1 text-sm font-medium">{t.personalLink}</p>
                      <p
                        dir="ltr"
                        className="truncate rounded-lg bg-page px-3 py-2 text-start font-mono text-xs text-muted"
                      >
                        {c.link}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <CopyButton
                        text={c.link}
                        label={t.copyLink}
                        copiedLabel={t.copied}
                        className={btn.small}
                      />
                      {c.welcomeHref ? (
                        <a
                          href={c.welcomeHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={btn.small + " border-[#128c4a]/40 text-[#0f7a40]"}
                        >
                          {t.shareWhatsapp}
                        </a>
                      ) : null}
                      <button
                        type="button"
                        className={btn.small}
                        disabled={pending}
                        onClick={() => run(() => regenerateToken(c.id), t.confirmRegenerate)}
                      >
                        {t.regenerateLink}
                      </button>
                      <button
                        type="button"
                        className={btn.small + " text-bad"}
                        disabled={pending}
                        onClick={() => run(() => deactivateCoach(c.id), t.confirmDeactivate)}
                      >
                        {t.deactivate}
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
