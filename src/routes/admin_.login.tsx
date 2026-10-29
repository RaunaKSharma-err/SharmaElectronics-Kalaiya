import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/layout/Logo";

export const Route = createFileRoute("/admin_/login")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s["redirect"] === "string" && s["redirect"].startsWith("/admin") ? (s["redirect"] as string) : undefined,
    denied: s["denied"] ? 1 : undefined,
  }),
  head: () => ({ meta: [{ title: "Admin sign in — Sharma Electronics" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Login,
});

function Login() {
  const { redirect, denied } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(denied ? "This account doesn't have admin access." : null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) { setError("Incorrect email or password."); return; }
    navigate({ to: (redirect ?? "/admin") as "/admin", replace: true });
  };

  const field = "w-full rounded-lg border border-ink-border bg-ink-3 px-3 py-2.5 text-ink-foreground placeholder:text-ink-muted focus:border-primary focus:outline-none";
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-3xl border border-ink-border bg-ink-2 p-8">
        <Logo />
        <div>
          <h1 className="font-serif text-3xl text-ink-foreground">Admin sign in</h1>
          <p className="mt-1 text-sm text-ink-muted">For shop staff only.</p>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm text-ink-muted">Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="pw" className="text-sm text-ink-muted">Password</label>
          <input id="pw" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
