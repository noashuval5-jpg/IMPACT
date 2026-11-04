"use client";

import { btn, Field, input, Notice } from "@/components/ui";
import { useFormSubmit } from "@/components/useFormSubmit";
import type { Dict } from "@/lib/i18n/dict";
import { signIn, type LoginState } from "./actions";

export function LoginForm({ t }: { t: Dict }) {
  const { state, pending, onSubmit } = useFormSubmit<LoginState>(
    (formData) => signIn({ error: false }, formData),
    { error: false },
  );
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Field label={t.email}>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          dir="ltr"
          className={input + " text-start"}
        />
      </Field>
      <Field label={t.password}>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          dir="ltr"
          className={input + " text-start"}
        />
      </Field>
      {state.error ? <Notice tone="error">{t.loginError}</Notice> : null}
      <button type="submit" className={btn.primary} disabled={pending}>
        {t.login}
      </button>
    </form>
  );
}
