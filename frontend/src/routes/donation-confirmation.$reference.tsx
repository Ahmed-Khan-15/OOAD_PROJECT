import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Printer } from "lucide-react";
import { PublicLayout } from "@/components/public-shell";
import type { DonationReceiptApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/donation-confirmation/$reference")({
  head: () => ({ meta: [{ title: "Donation Receipt | Global Health Explorer" }] }),
  component: DonationReceipt,
});

function DonationReceipt() {
  const { reference } = Route.useParams();
  const [ready, setReady] = useState(false);
  const [donation, setDonation] = useState<DonationReceiptApi | null>(null);
  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(`ghe:receipt:${reference}`);
      setDonation(stored ? (JSON.parse(stored) as DonationReceiptApi) : null);
    } catch {
      setDonation(null);
    }
    setReady(true);
  }, [reference]);
  if (!ready)
    return (
      <PublicLayout>
        <main className="page-wrap py-20">
          <p className="text-sm text-muted-foreground">Loading your demonstration receipt…</p>
        </main>
      </PublicLayout>
    );
  if (!donation)
    return (
      <PublicLayout>
        <main className="page-wrap py-20">
          <h1 className="font-display text-3xl font-bold">Receipt not available</h1>
          <p className="mt-3 text-muted-foreground">
            This demonstration receipt is kept for the current browser session. Submit a new
            simulated contribution to receive another.
          </p>
          <Link to="/donate" className="mt-5 inline-flex text-primary">
            Return to donations
          </Link>
        </main>
      </PublicLayout>
    );
  return (
    <PublicLayout>
      <main className="page-wrap py-16">
        <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-7 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
            <Check size={25} />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-wider text-primary">
            Demonstration receipt
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">Thank you for your support</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {donation.receiptMessage} No payment was made and no money changed hands.
          </p>
          <dl className="mt-7 divide-y divide-border rounded-xl border border-border text-left">
            <ReceiptRow label="Reference" value={donation.reference} />
            <ReceiptRow
              label="Amount"
              value={`${donation.amount.toFixed(2)} ${donation.currency}`}
            />
            <ReceiptRow
              label="Frequency"
              value={
                donation.frequency.toUpperCase() === "MONTHLY"
                  ? "Monthly commitment (simulation only)"
                  : "One time"
              }
            />
            <ReceiptRow label="Status" value={donation.status} />
            <ReceiptRow label="Date" value={new Date(donation.createdAt).toLocaleString()} />
          </dl>
          <p className="mt-4 text-xs text-muted-foreground">
            No receipt email was sent. Donor contact details are not included on this public
            receipt.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer size={15} /> Print receipt
            </Button>
            <Button asChild>
              <Link to="/">
                <ArrowLeft size={15} /> Back to explorer
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-3 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
