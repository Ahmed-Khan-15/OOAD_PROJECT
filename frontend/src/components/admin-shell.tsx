import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  BookOpen,
  ChevronLeft,
  FileUp,
  Globe2,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  Database,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { isAdminSignedIn, signOutAdmin } from "@/data/admin-auth";
import { Button } from "@/components/ui/button";

const navigation = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/countries", label: "Countries", icon: Globe2 },
  { to: "/admin/topics", label: "Topics", icon: BookOpen },
  { to: "/admin/indicators", label: "Indicators", icon: Activity },
  { to: "/admin/records", label: "Health records", icon: BarChart3 },
  { to: "/admin/sources", label: "Data sources", icon: Database },
  { to: "/admin/import", label: "CSV import", icon: FileUp },
] as const;

export function AdminLayout({
  children,
  title,
  description,
  action,
}: {
  children: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const signedIn = isAdminSignedIn();
    setAuthorized(signedIn);
    if (!signedIn) {
      void navigate({ to: "/admin/login", replace: true });
    }
  }, [navigate, location.pathname]);

  const logout = () => {
    signOutAdmin();
    setAuthorized(false);
    void navigate({ to: "/admin/login", replace: true });
  };

  if (authorized !== true) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <p className="rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          Checking prototype administrator session…
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-wash/50 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      {menuOpen && (
        <button
          aria-label="Close admin navigation"
          className="fixed inset-0 z-40 bg-foreground/30 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-card transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-auto lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-border px-5">
          <Link to="/admin" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <HeartPulse size={20} />
            </span>
            <span>
              <strong className="block font-display text-sm">Health Explorer</strong>
              <span className="text-xs text-muted-foreground">Admin workspace</span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Close admin navigation"
            onClick={() => setMenuOpen(false)}
          >
            <X size={18} />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin navigation">
          <p className="px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            Workspace
          </p>
          {navigation.map(({ to, label, icon: Icon }) => {
            const active =
              to === "/admin" ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${active ? "bg-secondary font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft size={17} />
            View public website
          </Link>
          <Button
            variant="ghost"
            className="mt-1 w-full justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
            onClick={logout}
          >
            <LogOut size={17} />
            Sign out
          </Button>
          <p className="px-3 pb-1 pt-3 text-[10px] leading-4 text-muted-foreground">
            Prototype only · changes stay in this browser
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-4 border-b border-border/70 bg-background/95 px-4 backdrop-blur sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-label="Open admin navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={18} />
            </Button>
            <div className="min-w-0">
              <p className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-primary sm:block">
                Global Health Explorer
              </p>
              <h1 className="truncate font-display text-lg font-bold sm:text-xl">{title}</h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/"
              className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground sm:inline-flex"
            >
              Public site <ChevronLeft className="rotate-180" size={14} />
            </Link>
            {action}
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8">
          <p className="mb-6 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
          {children}
          <footer className="mt-10 border-t border-border py-5 text-xs text-muted-foreground">
            Prototype administration · No changes are sent to a server.
          </footer>
        </main>
      </div>
    </div>
  );
}

export function AdminPageHeading({
  eyebrow = "Management",
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-primary">{eyebrow}</p>
        <h2 className="mt-1 font-display text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
