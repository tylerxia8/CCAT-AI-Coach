import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    status: "ok",
    mode: isSupabaseConfigured() ? "cloud" : "local",
    services: { application: "ready", persistence: isSupabaseConfigured() ? "configured" : "local_fallback" },
    checkedAt: new Date().toISOString(),
  }, {
    headers: { "cache-control": "no-store, max-age=0", pragma: "no-cache" },
  });
}
