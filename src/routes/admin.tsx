import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Package, Tag } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [ready, setReady] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      setAuthed(!!session);
      if (session) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);
        setIsAdmin(!!roles?.some((r) => r.role === "admin"));
      }
      setReady(true);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => check());
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando…</div>;
  if (!authed) return <AuthScreen />;
  if (!isAdmin) return <NoAccess onLogout={async () => { await supabase.auth.signOut(); }} />;

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/5 sticky top-0 z-30 glass-strong">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-display tracking-[0.25em] font-semibold">VAPE·HOUSE</Link>
            <nav className="flex gap-1">
              <NavLink to="/admin"><Package className="size-4" /> Productos</NavLink>
              <NavLink to="/admin/categorias"><Tag className="size-4" /> Categorías</NavLink>
            </nav>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/admin" }); }}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
          >
            <LogOut className="size-4" /> Salir
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: true }}
      activeProps={{ className: "bg-white/10 text-white" }}
      className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-white inline-flex items-center gap-2"
    >
      {children}
    </Link>
  );
}

function AuthScreen() {
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="glass-strong rounded-2xl p-8 w-full max-w-sm space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Vape House</p>
          <h1 className="font-display text-2xl font-semibold mt-1">Panel de admin</h1>
        </div>
        <div className="space-y-3">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="email@vapehouse.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[oklch(0.62_0.18_320)]"
          />
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[oklch(0.62_0.18_320)]"
          />
        </div>
        {err && <p className="text-sm text-[oklch(0.7_0.2_25)]">{err}</p>}
        <button disabled={loading} className="btn-premium w-full">
          {loading ? "..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
        </button>
        <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="w-full text-xs text-muted-foreground hover:text-white">
          {mode === "login" ? "¿No tenés cuenta? Registrate" : "Ya tengo cuenta"}
        </button>
      </form>
    </div>
  );
}

function NoAccess({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-strong rounded-2xl p-8 max-w-md text-center">
        <h1 className="font-display text-xl font-semibold">Sin acceso</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Tu cuenta no tiene rol de administrador. Pedile a un admin que te asigne el rol
          <code className="mx-1 px-1.5 py-0.5 rounded bg-white/10 text-xs">admin</code>
          desde la base de datos.
        </p>
        <button onClick={onLogout} className="mt-6 btn-premium">Salir</button>
      </div>
    </div>
  );
}
