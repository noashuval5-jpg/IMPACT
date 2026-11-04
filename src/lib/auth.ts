import "server-only";
import { redirect } from "next/navigation";
import { authClient } from "./supabase/ssr";

/**
 * Server-side session check. Call at the top of every admin page and every
 * admin server action. Any logged-in user is an admin (no public sign-up).
 */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const supabase = await authClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/admin/login");
  return { id: data.user.id, email: data.user.email ?? "" };
}
