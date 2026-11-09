import { afterEach, describe, expect, it } from "vitest";
import { getAdminData, saveAdminData, saveCountries } from "@/data/admin-data";
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  isAdminSignedIn,
  signInAdmin,
  signOutAdmin,
} from "@/data/admin-auth";
import { validateHealthRecordCsv } from "@/data/csv-import";

const initialData = structuredClone(getAdminData());

afterEach(() => {
  saveAdminData(structuredClone(initialData));
  window.localStorage.clear();
});

describe("prototype admin authentication", () => {
  it("accepts only the documented demo credentials and clears the session on logout", () => {
    expect(isAdminSignedIn()).toBe(false);
    expect(signInAdmin(DEMO_ADMIN_EMAIL, "incorrect")).toBe(false);
    expect(isAdminSignedIn()).toBe(false);
    expect(signInAdmin(DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD)).toBe(true);
    expect(isAdminSignedIn()).toBe(true);
    signOutAdmin();
    expect(isAdminSignedIn()).toBe(false);
  });
});

describe("browser data persistence", () => {
  it("persists country changes in local storage and shares them through public data arrays", () => {
    const newCountry = {
      id: "test-country",
      name: "Test Country",
      flag: "🌐",
      region: "Test region",
      intro: "A country used by the unit test.",
      isoCode: "TST",
      active: true,
    };
    saveCountries([...getAdminData().countries, newCountry]);

    expect(getAdminData().countries.some((country) => country.id === "test-country")).toBe(true);
    const persisted = JSON.parse(
      window.localStorage.getItem("global-health-explorer:data:v1") ?? "{}",
    ) as { countries: { id: string }[] };
    expect(persisted.countries.some((country) => country.id === "test-country")).toBe(true);
  });
});

describe("normalized CSV import validation", () => {
  it("accepts a valid observation using country code and indicator ID", () => {
    const result = validateHealthRecordCsv(
      'country,indicator,year,value,source,dimensions,notes\r\nJPN,depression,2024,4.4,our-world-in-data,"{""sex"":""female""}","Teaching note, with comma"',
      getAdminData(),
    );

    expect(result.valid).toHaveLength(1);
    expect(result.rejected).toHaveLength(0);
    expect(result.valid[0]?.record).toMatchObject({
      countryId: "japan",
      indicatorId: "depression",
      year: 2024,
      value: 4.4,
      sourceId: "our-world-in-data",
      dimensions: { sex: "female" },
      notes: "Teaching note, with comma",
    });
  });

  it("separates invalid and duplicate observations and reports the source row", () => {
    const result = validateHealthRecordCsv(
      [
        "country,indicator,year,value",
        "JPN,depression,2024,4.4",
        "Japan,depression,2024,4.4",
        "Atlantis,depression,2024,4.4",
        "Japan,depression,not-a-year,4.4",
      ].join("\n"),
      getAdminData(),
    );

    expect(result.valid).toHaveLength(1);
    expect(result.rejected).toHaveLength(3);
    expect(result.rejected[0]).toMatchObject({
      line: 3,
      reason: expect.stringContaining("Duplicate observation"),
    });
    expect(result.rejected[1]).toMatchObject({
      line: 4,
      reason: expect.stringContaining("Unknown country"),
    });
    expect(result.rejected[2]).toMatchObject({
      line: 5,
      reason: expect.stringContaining("Year must be an integer"),
    });
  });

  it("rejects CSV files with missing required columns and malformed quoting", () => {
    expect(() => validateHealthRecordCsv("country,year\nJapan,2024", getAdminData())).toThrow(
      "Missing required columns: indicator, value.",
    );
    expect(() =>
      validateHealthRecordCsv(
        'country,indicator,year,value\n"Japan,life-expectancy,2024,67',
        getAdminData(),
      ),
    ).toThrow("unclosed quoted field");
  });
});
