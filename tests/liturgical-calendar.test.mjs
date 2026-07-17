import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { Romcal } from "romcal";
import { UnitedStates_En } from "@romcal/calendar.united-states";

const referenceData = JSON.parse(
  await readFile(new URL("../app/src/data/lectionaryReferences.json", import.meta.url), "utf8"),
);

const calendarSource = await readFile(
  new URL("../app/src/data/liturgicalCalendar.ts", import.meta.url),
  "utf8",
);

const componentSource = await readFile(
  new URL("../app/src/components/LiturgicalCalendarSection.tsx", import.meta.url),
  "utf8",
);

const staticCalendars = Object.fromEntries(await Promise.all(
  ["en", "es", "fr", "pt"].map(async (language) => [
    language,
    JSON.parse(await readFile(new URL(`../app/src/data/liturgicalCalendars/${language}.json`, import.meta.url), "utf8")),
  ]),
));

const officialDates = {
  2026: {
    ash_wednesday: "2026-02-18",
    easter_sunday: "2026-04-05",
    pentecost_sunday: "2026-05-24",
    most_holy_body_and_blood_of_christ: "2026-06-07",
    advent_1_sunday: "2026-11-29",
  },
  2027: {
    ash_wednesday: "2027-02-10",
    easter_sunday: "2027-03-28",
    pentecost_sunday: "2027-05-16",
    most_holy_body_and_blood_of_christ: "2027-05-30",
    advent_1_sunday: "2027-11-28",
  },
  2028: {
    ash_wednesday: "2028-03-01",
    easter_sunday: "2028-04-16",
    pentecost_sunday: "2028-06-04",
    most_holy_body_and_blood_of_christ: "2028-06-18",
    advent_1_sunday: "2028-12-03",
  },
};

test("official USCCB editions provide a Lectionary reference for every date", () => {
  assert.deepEqual(Object.keys(referenceData.years), ["2026", "2027", "2028"]);
  assert.equal(Object.keys(referenceData.years["2026"]).length, 365);
  assert.equal(Object.keys(referenceData.years["2027"]).length, 365);
  assert.equal(Object.keys(referenceData.years["2028"]).length, 366);

  for (const [year, dates] of Object.entries(referenceData.years)) {
    for (const [date, references] of Object.entries(dates)) {
      assert.match(date, new RegExp(`^${year}-\\d{2}-\\d{2}$`));
      assert.ok(Array.isArray(references) && references.length > 0, `${date} must have a Lectionary reference`);
      assert.ok(references.every((reference) => /^\d{1,4}[A-Z]*(?:-\d{1,4}[A-Z]*)?$/.test(reference)));
    }
  }

  assert.deepEqual(referenceData.years["2026"]["2026-07-17"], ["393"]);
  assert.deepEqual(referenceData.years["2026"]["2026-12-25"], ["13", "14", "15", "16"]);
});

test("computed principal celebrations match the published 2026–2028 USCCB dates", async () => {
  const romcal = new Romcal({
    localizedCalendar: UnitedStates_En,
    scope: "gregorian",
    ascensionOnSunday: true,
    corpusChristiOnSunday: true,
    epiphanyOnSunday: true,
  });

  for (const [year, expected] of Object.entries(officialDates)) {
    const calendar = await romcal.generateCalendar(Number(year));
    for (const [id, date] of Object.entries(expected)) {
      assert.ok(calendar[date].some((day) => day.id === id), `${id} must occur on ${date}`);
    }
  }
});

test("all four static language calendars cover every official date and both Ascension observances", () => {
  for (const [language, data] of Object.entries(staticCalendars)) {
    assert.equal(data.metadata.romcal, "3.0.0-dev.125", `${language} must declare its pinned engine`);
    assert.equal(Object.keys(data.sunday["2026"]).length, 365);
    assert.equal(Object.keys(data.sunday["2027"]).length, 365);
    assert.equal(Object.keys(data.sunday["2028"]).length, 366);
    assert.deepEqual(Object.keys(data.thursdayOverrides["2026"]), ["2026-05-14", "2026-05-17"]);
    assert.deepEqual(Object.keys(data.thursdayOverrides["2027"]), ["2027-05-06", "2027-05-09"]);
    assert.deepEqual(Object.keys(data.thursdayOverrides["2028"]), ["2028-05-25", "2028-05-28"]);
  }
});

test("Ascension can follow either valid U.S. province observance", async () => {
  const sundayCalendar = await new Romcal({
    localizedCalendar: UnitedStates_En,
    ascensionOnSunday: true,
  }).generateCalendar(2026);
  const thursdayCalendar = await new Romcal({
    localizedCalendar: UnitedStates_En,
    ascensionOnSunday: false,
  }).generateCalendar(2026);

  assert.ok(sundayCalendar["2026-05-17"].some((day) => day.id === "ascension_of_the_lord"));
  assert.ok(thursdayCalendar["2026-05-14"].some((day) => day.id === "ascension_of_the_lord"));
});

test("the feature declares its modern scope, multilingual overrides, and accessible interaction model", () => {
  assert.match(calendarSource, /officialCalendarYears = \[2026, 2027, 2028\]/);
  assert.match(calendarSource, /localizedNameOverrides/);
  assert.match(calendarSource, /liturgicalCalendars\/pt\.json/);
  assert.match(componentSource, /data-calendar-scope="roman-rite-1969-us"/);
  assert.match(componentSource, /role="grid"/);
  assert.match(componentSource, /ArrowLeft/);
  assert.match(componentSource, /aria-label=\{calendarLabel/);
  assert.match(componentSource, /getUsccbReadingsUrl/);
});
