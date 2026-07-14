import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const destination = new URL("/", url.origin);
  if (!code) return NextResponse.redirect(new URL("/auth?error=missing_code", url.origin));

  const supabase = await createClient();
  if (!supabase) return NextResponse.redirect(new URL("/auth?error=not_configured", url.origin));
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(error ? new URL("/auth?error=invalid_link", url.origin) : destination);
}
