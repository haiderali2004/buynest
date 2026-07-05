import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Destination for links sent by Supabase Auth emails (password reset,
 * email confirmation, etc). `resetPasswordForEmail` uses the PKCE flow, so
 * the link carries a `code` that has to be exchanged for a real session
 * server-side before redirecting on to `next` — the session can't be
 * established client-side from this kind of link.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=link-expired", url.origin));
}
