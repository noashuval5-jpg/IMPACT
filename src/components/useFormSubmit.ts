"use client";

import { useState, useTransition, type FormEvent } from "react";

/**
 * Submits a form to a server action without React's automatic form reset,
 * so typed values stay in place when saving fails.
 */
export function useFormSubmit<S>(action: (formData: FormData) => Promise<S>, initial: S) {
  const [state, setState] = useState<S>(initial);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      setState(await action(formData));
    });
  }

  return { state, pending, onSubmit };
}
