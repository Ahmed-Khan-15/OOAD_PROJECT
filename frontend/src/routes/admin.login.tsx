import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, HeartPulse, LockKeyhole } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  isAdminSignedIn,
  signInAdmin,
} from "@/data/admin-auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Administrator Sign In | Global Health Explorer" },
      {
        name: "description",
        content: "Prototype administrator sign in for Global Health Explorer.",
      },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_ADMIN_EMAIL);
  const [password, setPassword] = useState(DEMO_ADMIN_PASSWORD);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdminSignedIn()) void navigate({ to: "/admin", replace: true });
  }, [navigate]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter the demo password.");
      return;
    }
    if (!signInAdmin(email, password)) {
      setError("The email or password does not match the documented demo credentials.");
      return;
    }
    void navigate({ to: "/admin", replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-wash px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary"
        >
          <ArrowLeft size={15} /> Return to the public site
        </Link>
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <HeartPulse size={22} />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-wider text-primary">
            Prototype workspace
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold">Administrator sign in</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Use the demo credentials to manage locally stored project data. This prototype does not
            provide production authentication or security.
          </p>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <label className="grid gap-1.5 text-sm font-semibold">
              Email
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Password
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-md border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            {error && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                {error}
              </p>
            )}
            <Button type="submit" className="mt-1 w-full">
              <LockKeyhole size={16} /> Sign in
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-border bg-wash p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Documented demo credentials
            </p>
            <dl className="mt-2 grid gap-1 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{DEMO_ADMIN_EMAIL}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Password</dt>
                <dd className="font-medium">{DEMO_ADMIN_PASSWORD}</dd>
              </div>
            </dl>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            Sign-in is stored in this browser only and can be replaced with a Spring Boot
            authentication API later.
          </p>
        </section>
      </div>
    </main>
  );
}
