import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/public-shell";
import { countries } from "@/data/health";

export const Route = createFileRoute("/countries/")({
  head: () => ({
    meta: [
      { title: "Countries | Global Health Explorer" },
      {
        name: "description",
        content:
          "Browse health profiles for countries across Asia, Europe, Africa, North America, South America, and Oceania.",
      },
      { property: "og:title", content: "Countries | Global Health Explorer" },
      {
        property: "og:description",
        content: "Compare country profiles and health context across regions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CountriesPage,
});

function CountriesPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return countries.filter((country) => {
      if (country.active === false) return false;
      if (!normalized) return true;
      return (
        country.name.toLowerCase().includes(normalized) ||
        country.region.toLowerCase().includes(normalized)
      );
    });
  }, [query]);

  const grouped = filtered.reduce<Record<string, typeof countries>>((accumulator, country) => {
    const key = country.region;
    accumulator[key] = accumulator[key] ? [...accumulator[key], country] : [country];
    return accumulator;
  }, {});

  return (
    <PublicLayout>
      <main className="page-wrap py-12 md:py-16">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Country explorer
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold">
              Explore health across {countries.filter((country) => country.active !== false).length}{" "}
              countries
            </h1>
          </div>
          <Button asChild variant="outline">
            <Link to="/compare">
              Compare countries <ArrowRight size={15} />
            </Link>
          </Button>
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
          <Search className="ml-2 text-muted-foreground" size={18} />
          <input
            aria-label="Search countries"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by country or region"
            className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-8 space-y-8">
          {Object.entries(grouped).map(([region, regionCountries]) => (
            <section key={region}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-bold">{region}</h2>
                <span className="text-sm text-muted-foreground">
                  {regionCountries.length} countries
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {regionCountries.map((country) => (
                  <article
                    key={country.id}
                    className="rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-3xl">{country.flag}</div>
                        <h3 className="mt-3 font-display text-xl font-bold">{country.name}</h3>
                      </div>
                      <span className="rounded-full border border-border bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground">
                        {country.region}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{country.intro}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Country profile</span>
                      <Link
                        to="/countries/$countryId"
                        params={{ countryId: country.id }}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                      >
                        View profile <ArrowRight size={15} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No country matches your search. Try another name or a broader region.
          </div>
        )}
      </main>
    </PublicLayout>
  );
}
