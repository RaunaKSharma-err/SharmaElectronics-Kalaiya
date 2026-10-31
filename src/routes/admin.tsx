import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Boxes, LayoutDashboard, LogOut, Menu, Package, Plus, Store, X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { checkAdmin } from "@/lib/admin.functions";
import { Logo } from "@/components/layout/Logo";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — Sharma Electronics" }, { name: "robots", content: "noindex, nofollow" }] }),
  beforeLoad: async ({ location }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login", search: { redirect: location.href } });
    const { isAdmin } = await checkAdmin();
    if (!isAdmin) throw redirect({ to: "/admin/login", search: { denied: 1 } });
    return { email: data.user.email ?? "" };
  },
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", icon: Package, exact: false },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes, exact: false },
] as const;

function AdminLayout() {
  const { email } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const signOut = async () => {
    await qc.cancelQueries(); qc.removeQueries({ queryKey: ["admin"] });
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  };
  const side = (
    <div className="flex h-full flex-col gap-6 p-5">
      <Logo />
      <nav className="grid gap-1" aria-label="Admin">
        {nav.map(({ to, label, icon: I, exact }) => (
          <Link key={to} to={to} activeOptions={{ exact }} onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-muted transition hover:bg-ink-3 hover:text-ink-foreground data-[status=active]:bg-ink-3 data-[status=active]:text-ink-foreground">
            <I className="h-4 w-4" /> {label}
          </Link>
        ))}
        <Link to="/admin/products/new" onClick={() => setOpen(false)} className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" /> Add product
        </Link>
      </nav>
      <div className="mt-auto grid gap-2 border-t border-ink-border pt-4 text-sm">
        <p className="truncate text-xs text-ink-muted">{email}</p>
        <Link to="/" className="flex items-center gap-2 text-ink-muted hover:text-ink-foreground"><Store className="h-4 w-4" /> View store</Link>
        <button type="button" onClick={signOut} className="flex items-center gap-2 text-left text-ink-muted hover:text-ink-foreground"><LogOut className="h-4 w-4" /> Sign out</button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen bg-ink lg:block">{side}</aside>
      <div className="flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
        <Logo />
        <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 text-ink-foreground"><Menu className="h-6 w-6" /></button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-ink/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-ink">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-3 p-2 text-ink-foreground"><X className="h-5 w-5" /></button>
            {side}
          </div>
        </div>
      )}
      <main className="min-w-0 p-4 sm:p-8"><Outlet /></main>
    </div>
  );
}
