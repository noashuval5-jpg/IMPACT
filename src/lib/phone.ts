/**
 * Phone normalization and WhatsApp link helpers. Pure functions, unit tested.
 */

/** Keeps digits only; a leading 0 becomes the Israeli country code 972. */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
}

/** Link that opens a WhatsApp chat with `phone`, with `text` pre-filled. */
export function waLink(phone: string, text: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(text)}`;
}

/** Link that opens WhatsApp's "share" screen (the user picks the chat). */
export function waShareLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Replaces {key} placeholders. Unknown placeholders are left as they are. */
export function fillTemplate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
