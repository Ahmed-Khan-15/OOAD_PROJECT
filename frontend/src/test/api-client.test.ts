import { afterEach, describe, expect, it, vi } from "vitest";
import { api, type DatasetWrite } from "@/lib/api";
import { parseDatasetMappingLines } from "@/lib/dataset-mappings";

afterEach(() => vi.unstubAllGlobals());

describe("frontend API client", () => {
  it("uses CSRF and backend cookies and submits no payment card fields", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push({ url, ...(init ? { init } : {}) });
        if (url.endsWith("/csrf")) {
          return new Response(JSON.stringify({ headerName: "X-CSRF-TOKEN", token: "test-token" }), {
            status: 200,
          });
        }
        if (url.endsWith("/login")) {
          return new Response(
            JSON.stringify({ email: "admin@example.test", displayName: "Admin" }),
            { status: 200 },
          );
        }
        if (url.endsWith("/donations")) {
          return new Response(
            JSON.stringify({
              reference: "GHE-2026-ABC12345",
              amount: 10,
              currency: "USD",
              frequency: "ONCE",
              status: "SIMULATED_SUCCESS",
              createdAt: "2026-11-15T00:00:00Z",
              simulated: true,
              receiptMessage: "Simulated only.",
            }),
            { status: 201 },
          );
        }
        if (url.endsWith("/logout")) return new Response(null, { status: 204 });
        return new Response(JSON.stringify({ email: "admin@example.test", displayName: "Admin" }), {
          status: 200,
        });
      }),
    );

    await api.login("admin@example.test", "password");
    await api.session();
    await api.donate({
      donorName: "Test Donor",
      email: "test@example.test",
      amount: 10,
      frequency: "ONCE",
      anonymous: false,
    });
    await api.logout();

    const donation = calls.find((call) => call.url.endsWith("/donations"));
    const donationBody = JSON.parse(String(donation?.init?.body)) as Record<string, unknown>;
    expect(Object.keys(donationBody).sort()).toEqual([
      "amount",
      "anonymous",
      "donorName",
      "email",
      "frequency",
    ]);
    expect(calls.every((call) => call.init?.credentials === "include")).toBe(true);
    expect(
      new Headers(calls.find((call) => call.url.endsWith("/login"))?.init?.headers).get(
        "X-CSRF-TOKEN",
      ),
    ).toBe("test-token");
    expect(
      new Headers(calls.find((call) => call.url.endsWith("/logout"))?.init?.headers).get(
        "X-CSRF-TOKEN",
      ),
    ).toBe("test-token");
    expect(window.localStorage.length).toBe(0);
  });

  it("calls categorized unified search with encoded query text", async () => {
    let requested = "";
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        requested = String(input);
        return new Response(
          JSON.stringify({
            query: "life expectancy",
            minimumQueryLength: 2,
            perCategoryLimit: 8,
            totalResults: 0,
            countries: [],
            topics: [],
            indicators: [],
            articles: [],
            glossary: [],
            datasets: [],
            sources: [],
          }),
          { status: 200 },
        );
      }),
    );
    const response = await api.search("life expectancy");
    expect(requested).toContain("/search?q=life+expectancy");
    expect(response.minimumQueryLength).toBe(2);
    expect(response.sources).toEqual([]);
  });

  it("submits source indicator codes in authenticated dataset requests", async () => {
    const calls: { url: string; init?: RequestInit }[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push({ url, ...(init ? { init } : {}) });
        if (url.endsWith("/csrf")) {
          return new Response(
            JSON.stringify({ headerName: "X-CSRF-TOKEN", token: "dataset-token" }),
            {
              status: 200,
            },
          );
        }
        if (url.endsWith("/login")) {
          return new Response(
            JSON.stringify({ email: "admin@example.test", displayName: "Admin" }),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({ slug: "wdi-health" }), { status: 201 });
      }),
    );

    await api.login("admin@example.test", "password");
    const indicators = parseDatasetMappingLines(
      [
        "life-expectancy-birth-total | SP.DYN.LE00.IN | Life expectancy | years",
        "under-five-mortality-rate | SH.DYN.MORT | Under-five mortality | deaths per 1,000 live births",
        "infant-mortality-rate | SP.DYN.IMRT.IN | Infant mortality | deaths per 1,000 live births",
        "neonatal-mortality-rate | SH.DYN.NMRT | Neonatal mortality | deaths per 1,000 live births",
        "maternal-mortality-ratio | SH.STA.MMRT | Maternal mortality | deaths per 100,000 live births",
        "births-attended-skilled-personnel | SH.STA.BRTC.ZS | Skilled birth attendance | %",
      ].join("\n"),
    );
    const dataset: DatasetWrite = {
      name: "WDI health series",
      slug: "wdi-health",
      sourceId: "world-bank",
      description: "",
      sourceUrl: "",
      citation: "",
      licenseName: "",
      licenseUrl: "",
      methodology: "",
      frequency: "",
      publishedAt: null,
      coverageStartYear: 1960,
      coverageEndYear: 2024,
      active: true,
      indicators,
    };

    await api.saveDataset(dataset);

    const request = calls.find((call) => call.url.endsWith("/admin/datasets"));
    const submitted = JSON.parse(String(request?.init?.body)) as DatasetWrite;
    expect(submitted.indicators.map((mapping) => mapping.originalIndicatorCode)).toEqual([
      "SP.DYN.LE00.IN",
      "SH.DYN.MORT",
      "SP.DYN.IMRT.IN",
      "SH.DYN.NMRT",
      "SH.STA.MMRT",
      "SH.STA.BRTC.ZS",
    ]);
    expect(request?.init?.credentials).toBe("include");
    expect(new Headers(request?.init?.headers).get("X-CSRF-TOKEN")).toBe("dataset-token");
  });
});
