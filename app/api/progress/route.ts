import { NextResponse } from "next/server";
import { mapCloudHistory, type CloudDiagnosticRow } from "@/lib/cloud-history";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const responseHeaders = { "cache-control": "private, no-store, max-age=0", pragma: "no-cache" };
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ entries: [], source: "local" }, { headers: responseHeaders });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  if (!user) return NextResponse.json({ entries: [], source: "signed_out" }, { headers: responseHeaders });

  const { data, error } = await supabase
    .from("diagnostic_results")
    .select("session_id,completed_at,correct,total,accuracy,average_seconds,pace_score,confidence_score,category_results,bottleneck,coaching_title")
    .order("completed_at", { ascending: true })
    .limit(100);
  if (error) return NextResponse.json({ error: "Progress unavailable" }, { status: 503 });
  return NextResponse.json({ entries: mapCloudHistory((data ?? []) as CloudDiagnosticRow[]), source: "cloud" }, { headers: responseHeaders });
}
