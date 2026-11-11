"use client";

import { useState } from "react";

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older phones / non-secure contexts.
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  }
}

export function CopyButton({
  text,
  label,
  copiedLabel,
  className,
  icon,
}: {
  text: string;
  label: string;
  copiedLabel: string;
  className: string;
  icon?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        if (await copyToClipboard(text)) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }}
    >
      {copied ? null : icon}
      <span aria-live="polite">{copied ? `✓ ${copiedLabel}` : label}</span>
    </button>
  );
}
