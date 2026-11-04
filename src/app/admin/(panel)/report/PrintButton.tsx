"use client";

import { btn } from "@/components/ui";

export function PrintButton({ label }: { label: string }) {
  return (
    <button type="button" className={btn.primary + " no-print"} onClick={() => window.print()}>
      {label}
    </button>
  );
}
