import { Link, useLocation } from "@tanstack/react-router";
import { ArrowUpRight, Menu, Search, HeartPulse } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { countries, topics } from "@/data/health";

const primaryLinks = [
  { to: "/topics", label: "Explore topics" },
  { to: "/countries", label: "Countries" },
  { to: "/compare", label: "Compare" },
  { to: "/about", label: "About" },
] as const;

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="page-wrap flex h-[72px] items-center justify-between gap-4">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Global Health Explorer home"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <HeartPulse size={19} />
          </span>
          <span className="font-display text-base font-bold leading-tight text-foreground">
            Global Health
            <br className="sm:hidden" /> Explorer
          </span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${location.pathname.startsWith(item.to) ? "bg-secondary font-semibold text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/countries"
            className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            <Search size={15} /> Find a country
          </Link>
          <Button asChild size="sm" className="rounded-full">
            <Link to="/topics">
              Start exploring <ArrowUpRight size={15} />
            </Link>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMobileOpen((value) => !value)}
        >
          <Menu size={20} />
        </Button>
      </div>
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-border bg-background px-4 py-3 lg:hidden"
        >
          <div className="page-wrap flex flex-col gap-1">
            {primaryLinks.map((item) => (
              <Link
                key={item.to}
                onClick={() => setMobileOpen(false)}
                to={item.to}
                className="rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
            <Link
              onClick={() => setMobileOpen(false)}
              to="/countries"
              className="rounded-lg px-3 py-3 text-sm font-medium text-primary"
            >
              Find a country
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="page-wrap grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 font-display font-bold">
            <HeartPulse className="text-primary" size={19} /> Global Health Explorer
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            An approachable place to learn how health is changing around the world. Data shown here
            is illustrative for learning.
          </p>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Explore
          </p>
          <div className="grid gap-2 text-sm">
            {[
              { to: "/topics", label: "All health topics" },
              { to: "/countries", label: "Countries" },
              { to: "/compare", label: "Compare countries" },
              { to: "/about", label: "About this project" },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="text-foreground/80 hover:text-primary">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Topics
          </p>
          <div className="grid gap-2 text-sm">
            {topics
              .filter((topic) => topic.active !== false)
              .slice(1, 5)
              .map((topic) => (
                <Link
                  key={topic.slug}
                  to="/topics/$slug"
                  params={{ slug: topic.slug }}
                  className="text-foreground/80 hover:text-primary"
                >
                  {topic.title}
                </Link>
              ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="page-wrap flex flex-col justify-between gap-2 py-4 text-xs text-muted-foreground sm:flex-row">
          <span>© 2026 Global Health Explorer · Educational prototype</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>Sample values are not verified real-world statistics.</span>
            <Link
              to="/admin/login"
              className="font-medium text-muted-foreground/80 hover:text-primary"
            >
              Admin sign in
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      {children}
      <PublicFooter />
    </>
  );
}

export function TopicLink({ slug, children }: { slug: string; children: React.ReactNode }) {
  return (
    <Link to="/topics/$slug" params={{ slug }}>
      {children}
    </Link>
  );
}

export function CountryLink({ id, children }: { id: string; children?: React.ReactNode }) {
  const country = countries.find((item) => item.id === id);
  if (!country) return null;
  return (
    <Link to="/countries/$countryId" params={{ countryId: id }}>
      {children ?? country.name}
    </Link>
  );
}
