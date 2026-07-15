"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StoredDiagnosticSession } from "@/lib/session-store";
import type { ScoredDiagnosticResult } from "@/lib/diagnostic";
import { syncCompletedSession, type SyncResult } from "@/lib/supabase/sync-session";

export function CloudSyncStatus({ session, diagnosticResult }: { session: StoredDiagnosticSession | null; diagnosticResult: ScoredDiagnosticResult }) {
  const [result, setResult] = useState<SyncResult | { status: "syncing" }>({ status: "syncing" });

  useEffect(() => {
    if (!session || session.status !== "completed") return;
    let active = true;
    syncCompletedSession(session, diagnosticResult).then((value) => { if (active) setResult(value); });
    return () => { active = false; };
  }, [diagnosticResult, session]);

  if (!session || session.status !== "completed") return null;
  if (result.status === "syncing") return <span className="sync-status">Saving…</span>;
  if (result.status === "synced") return <span className="sync-status success">✓ Saved to your account</span>;
  if (result.status === "signed_out") return <Link className="sync-status action" href="/auth">Sign in to save across devices</Link>;
  if (result.status === "error") return <span className="sync-status error" title={result.message}>Cloud save needs attention</span>;
  return <span className="sync-status">Saved in this browser</span>;
}
