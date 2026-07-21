"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { clearUserData, collectUserData, countStoredDataGroups } from "@/lib/user-data";
import { deleteCloudLearningData } from "@/lib/supabase/delete-data";
import { buildTestProgram, TEST_DATE_KEY } from "@/lib/test-program";

export function SettingsPanel() {
  const [storedGroups, setStoredGroups] = useState(0);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [cloudConfigured, setCloudConfigured] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmCloudDelete, setConfirmCloudDelete] = useState(false);
  const [cloudDeleteStatus, setCloudDeleteStatus] = useState<"idle" | "deleting" | "deleted" | "error">("idle");
  const [testDate, setTestDate] = useState("");

  useEffect(() => {
    setStoredGroups(countStoredDataGroups(window.localStorage));
    setTestDate(window.localStorage.getItem(TEST_DATE_KEY) ?? "");
    const supabase = createClient();
    setCloudConfigured(Boolean(supabase));
    supabase?.auth.getUser().then(({ data }) => setAccountEmail(data.user?.email ?? null));
  }, []);

  function downloadExport() {
    const payload = collectUserData(window.localStorage);
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `aptitude-coach-data-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function clearDevice() {
    if (!confirmClear) return;
    clearUserData(window.localStorage);
    setStoredGroups(0);
    setConfirmClear(false);
  }

  function saveTestDate(value: string) { setTestDate(value); if (value) window.localStorage.setItem(TEST_DATE_KEY, value); else window.localStorage.removeItem(TEST_DATE_KEY); setStoredGroups(countStoredDataGroups(window.localStorage)); }

  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setAccountEmail(null);
  }

  async function deleteCloudData() {
    if (!confirmCloudDelete || !accountEmail) return;
    setCloudDeleteStatus("deleting");
    const result = await deleteCloudLearningData();
    if (result.status === "deleted") {
      setCloudDeleteStatus("deleted");
      setConfirmCloudDelete(false);
    } else {
      setCloudDeleteStatus("error");
    }
  }

  return (
    <main className="settings-shell">
      <nav className="nav"><Link className="brand brand-link" href="/"><span>AC</span>Aptitude Coach</Link><div className="nav-actions"><Link className="nav-text-link" href="/practice/topics">Choose topics</Link><Link className="nav-text-link" href="/plan">Study plan</Link><Link className="nav-text-link" href="/progress">Progress</Link></div></nav>
      <section className="settings-head"><div className="eyebrow">Data & account</div><h1>Your work belongs to you.</h1><p>Review what is stored, take a portable copy, or clear this device without affecting the application itself.</p></section>
      <section className="settings-grid">
        <article><div className="section-label">Assessment date</div><h2>{testDate ? buildTestProgram(testDate)?.title ?? "Set your schedule" : "When is your test?"}</h2><p>{testDate ? `${buildTestProgram(testDate)?.daysRemaining} days remaining · ${buildTestProgram(testDate)?.cadence}` : "Your training volume and simulation schedule will adapt to the time available."}</p><label className="date-setting">Test date<input type="date" value={testDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => saveTestDate(event.target.value)} /></label></article>
        <article><div className="section-label">This device</div><h2>{storedGroups} stored data {storedGroups === 1 ? "group" : "groups"}</h2><p>Diagnostic state and history, practice state and history, and study-plan completion are stored in this browser.</p><button className="secondary" disabled={!storedGroups} onClick={downloadExport}>Export JSON copy</button></article>
        <article><div className="section-label">Cloud account</div><h2>{accountEmail ?? (cloudConfigured ? "Not signed in" : "Local preview mode")}</h2><p>{accountEmail ? "Completed diagnostics can synchronize across devices. Clearing browser data does not remove cloud records." : cloudConfigured ? "Sign in to synchronize completed diagnostic history." : "Supabase credentials have not been configured, so no data leaves this browser."}</p>{accountEmail ? <button className="settings-link-button" onClick={signOut}>Sign out</button> : <Link className="settings-link-button" href="/auth">Open sign in →</Link>}</article>
      </section>
      <section className="danger-zone"><div><div className="section-label">Clear this device</div><h2>Remove locally stored learning data</h2><p>This deletes diagnostic history, active sessions, drill history, and study-plan completion from this browser. Export first if you want a copy.</p></div><div className="clear-controls"><label><input type="checkbox" checked={confirmClear} onChange={(event) => setConfirmClear(event.target.checked)} /> I understand this cannot be undone.</label><button disabled={!confirmClear || !storedGroups} onClick={clearDevice}>Clear device data</button></div></section>
      {accountEmail && <section className="danger-zone cloud-delete"><div><div className="section-label">Delete synchronized learning data</div><h2>Remove cloud scores and activity</h2><p>This permanently deletes your synchronized sessions, attempts, telemetry, result summaries, and profile. It keeps your sign-in identity active and does not clear this browser.</p>{cloudDeleteStatus === "deleted" && <p className="deletion-success">Cloud learning data deleted.</p>}{cloudDeleteStatus === "error" && <p className="deletion-error">Cloud deletion could not be completed. No local data was changed.</p>}</div><div className="clear-controls"><label><input type="checkbox" checked={confirmCloudDelete} onChange={(event) => setConfirmCloudDelete(event.target.checked)} /> Delete all synchronized learning records.</label><button disabled={!confirmCloudDelete || cloudDeleteStatus === "deleting"} onClick={deleteCloudData}>{cloudDeleteStatus === "deleting" ? "Deleting…" : "Delete cloud learning data"}</button></div></section>}
      <section className="privacy-note"><h2>Data boundary</h2><p>The application uses minimal account information. Scores and behavioral timing are learning signals, not medical, psychological, or employment decisions. Deleting cloud learning data leaves the sign-in identity active; deleting the identity itself requires a separate privileged account-deletion workflow.</p></section>
    </main>
  );
}
