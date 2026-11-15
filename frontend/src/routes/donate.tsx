import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Heart, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/public-shell";
import { api } from "@/lib/api";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Support the Explorer | Global Health Explorer" },
      {
        name: "description",
        content:
          "Support free, accessible global health learning. Demonstration checkout only; no payment is processed.",
      },
    ],
  }),
  component: DonationPage,
});

function DonationPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("25");
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const value = amount === "custom" ? Number(customAmount) : Number(amount);
    if (!Number.isFinite(value) || value < 1 || value > 10000) {
      setError("Choose an amount between $1 and $10,000.");
      return;
    }
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter your name and a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const receipt = await api.donate({
        donorName: name.trim(),
        email: email.trim(),
        amount: value,
        frequency: frequency === "monthly" ? "MONTHLY" : "ONCE",
        anonymous,
      });
      window.sessionStorage.setItem(`ghe:receipt:${receipt.reference}`, JSON.stringify(receipt));
      void navigate({
        to: "/donation-confirmation/$reference",
        params: { reference: receipt.reference },
      });
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "The simulated donation could not be recorded.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <PublicLayout>
      <main className="page-wrap grid gap-10 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <section className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Keep knowledge open
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Support a clearer view of global health.
          </h1>
          <p className="mt-5 text-base leading-7 text-muted-foreground">
            Your support helps sustain free, accessible explanations of health measures, careful
            data notes, and educational resources for curious readers everywhere.
          </p>
          <div className="mt-7 grid gap-4">
            <div className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <BookIcon />
              </span>
              <p className="text-sm leading-6">
                <strong>Open learning</strong>
                <br />
                Keep educational material accessible without a paywall.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                <ShieldCheck size={17} />
              </span>
              <p className="text-sm leading-6">
                <strong>Careful context</strong>
                <br />
                Support transparent sourcing and clear caveats.
              </p>
            </div>
          </div>
          <p className="mt-8 rounded-xl border border-primary/20 bg-secondary/50 p-4 text-sm leading-6 text-secondary-foreground">
            Academic demonstration only. No payment gateway is contacted, no money is charged, and
            no real transaction takes place. Use fictional test details only.
          </p>
        </section>
        <form
          onSubmit={submit}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary">
              <Heart size={19} />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold">Make a simulated contribution</h2>
              <p className="text-xs text-muted-foreground">
                Simulated demonstration only · no payment is taken
              </p>
            </div>
          </div>
          <fieldset className="mt-6">
            <legend className="text-sm font-semibold">Choose an amount</legend>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[10, 25, 50].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAmount(String(value))}
                  aria-pressed={amount === String(value)}
                  className={`rounded-lg border px-2 py-3 text-sm font-semibold ${amount === String(value) ? "border-primary bg-secondary text-primary" : "border-border hover:border-primary/40"}`}
                >
                  ${value}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount("custom")}
                aria-pressed={amount === "custom"}
                className={`rounded-lg border px-2 py-3 text-sm font-semibold ${amount === "custom" ? "border-primary bg-secondary text-primary" : "border-border hover:border-primary/40"}`}
              >
                Custom
              </button>
            </div>
            {amount === "custom" && (
              <label className="mt-3 grid gap-1.5 text-sm font-medium">
                Custom amount (USD)
                <input
                  type="number"
                  min="1"
                  max="10000"
                  step="0.01"
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3"
                />
              </label>
            )}
          </fieldset>
          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Frequency</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  ["once", "One time"],
                  ["monthly", "Monthly"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFrequency(value)}
                  aria-pressed={frequency === value}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${frequency === value ? "border-primary bg-secondary text-primary" : "border-border"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium">
              Donor name
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Email for demonstration receipt
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3"
              />
            </label>
          </div>
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(event) => setAnonymous(event.target.checked)}
              className="mt-1 accent-primary"
            />
            <span>List my contribution as anonymous in the private prototype record</span>
          </label>
          <div className="my-6 rounded-lg bg-wash p-4 text-sm leading-6 text-muted-foreground">
            This demonstration records your contribution intent only. No card information is
            requested, no payment is processed, and monthly amounts are not charged repeatedly.
          </div>
          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button type="submit" disabled={submitting} className="mt-6 w-full">
            {submitting ? "Recording demonstration…" : "Record simulated donation"}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <LockKeyhole size={12} /> Donation data is stored for this academic demonstration.
          </p>
        </form>
      </main>
    </PublicLayout>
  );
}

function BookIcon() {
  return (
    <span aria-hidden="true" className="text-base font-bold">
      Aa
    </span>
  );
}
