import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { Romcal } from "romcal";
import {
  UnitedStates_En,
  UnitedStates_Es,
  UnitedStates_Fr,
  UnitedStates_PtBr,
} from "@romcal/calendar.united-states";

const outputDirectory = new URL("../app/src/data/liturgicalCalendars/", import.meta.url);
const years = [2026, 2027, 2028];
const languages = {
  en: UnitedStates_En,
  es: UnitedStates_Es,
  fr: UnitedStates_Fr,
  pt: UnitedStates_PtBr,
};

function serializeCalendar(calendar) {
  return Object.fromEntries(Object.entries(calendar).map(([date, days]) => [
    date,
    days.map((day) => ({
      i: day.id,
      n: day.name,
      r: day.rank,
      c: day.colors,
      s: day.seasons,
      y: [
        day.cycles.properCycle,
        day.cycles.sundayCycle,
        day.cycles.weekdayCycle,
        day.cycles.psalterWeek,
      ],
      h: day.isHolyDayOfObligation,
      o: day.isOptional,
    })),
  ]));
}

await mkdir(outputDirectory, { recursive: true });

for (const [language, localizedCalendar] of Object.entries(languages)) {
  const sunday = {};
  const thursdayOverrides = {};

  for (const year of years) {
    const commonConfig = {
      localizedCalendar,
      scope: "gregorian",
      corpusChristiOnSunday: true,
      epiphanyOnSunday: true,
    };
    const sundayCalendar = serializeCalendar(await new Romcal({
      ...commonConfig,
      ascensionOnSunday: true,
    }).generateCalendar(year));
    const thursdayCalendar = serializeCalendar(await new Romcal({
      ...commonConfig,
      ascensionOnSunday: false,
    }).generateCalendar(year));

    sunday[String(year)] = sundayCalendar;
    thursdayOverrides[String(year)] = Object.fromEntries(
      Object.keys(sundayCalendar)
        .filter((date) => JSON.stringify(sundayCalendar[date]) !== JSON.stringify(thursdayCalendar[date]))
        .map((date) => [date, thursdayCalendar[date]]),
    );
  }

  const payload = {
    metadata: {
      rite: "Roman Rite after the 1969 reform",
      calendar: "General Roman Calendar with the Proper Calendar for the United States",
      romcal: "3.0.0-dev.125",
      calendarBundle: "@romcal/calendar.united-states@3.0.0-dev.125",
      generatedOn: "2026-07-17",
    },
    sunday,
    thursdayOverrides,
  };

  const outputUrl = new URL(`${language}.json`, outputDirectory);
  await writeFile(outputUrl, `${JSON.stringify(payload)}\n`);
  console.log(`Wrote ${fileURLToPath(outputUrl)}.`);
}
