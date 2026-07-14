import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AuthPage() {
  return (
    <main className="auth-shell">
      <Link className="back-link" href="/">← Back to diagnostic</Link>
      <section className="auth-card">
        <div className="brand"><span>AC</span>Aptitude Coach</div>
        <div className="eyebrow">Save your progress</div>
        <h1>Continue across devices.</h1>
        <p>Sign in with a secure email link. No password to remember.</p>
        <AuthForm configured={isSupabaseConfigured()} />
      </section>
    </main>
  );
}
