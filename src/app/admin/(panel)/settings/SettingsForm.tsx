"use client";

import { btn, Field, input, Notice } from "@/components/ui";
import { useFormSubmit } from "@/components/useFormSubmit";
import type { Dict } from "@/lib/i18n/dict";
import { saveSettings, type SettingsState } from "./actions";

export function SettingsForm({ t, startDate }: { t: Dict; startDate: string | null }) {
  const { state, pending, onSubmit } = useFormSubmit<SettingsState>(
    (formData) => saveSettings({ status: "idle" }, formData),
    { status: "idle" },
  );
  return (
    <form onSubmit={onSubmit} className="grid max-w-sm gap-4">
      <Field label={t.programStartDate} hint={t.mustBeSunday}>
        <input
          type="date"
          name="program_start_date"
          required
          defaultValue={startDate ?? ""}
          className={input}
        />
      </Field>
      {state.status === "notSunday" ? <Notice tone="error">{t.mustBeSunday}</Notice> : null}
      {state.status === "error" ? <Notice tone="error">{t.errorTryAgain}</Notice> : null}
      {state.status === "saved" ? <Notice tone="ok">✓ {t.saved}</Notice> : null}
      <button type="submit" className={btn.primary} disabled={pending}>
        {t.save}
      </button>
    </form>
  );
}
