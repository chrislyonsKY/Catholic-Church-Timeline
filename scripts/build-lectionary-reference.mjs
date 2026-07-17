import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repositoryRoot = new URL("../", import.meta.url);
const outputUrl = new URL("../app/src/data/lectionaryReferences.json", import.meta.url);

const editions = [
  { year: 2026, url: "https://www.usccb.org/resources/2026cal.pdf" },
  { year: 2027, url: "https://www.usccb.org/resources/2027cal.pdf" },
  { year: 2028, url: "https://www.usccb.org/resources/2028cal.pdf" },
];

const monthNumbers = new Map([
  ["JANUARY", 1], ["FEBRUARY", 2], ["MARCH", 3], ["APRIL", 4],
  ["MAY", 5], ["JUNE", 6], ["JULY", 7], ["AUGUST", 8],
  ["SEPTEMBER", 9], ["OCTOBER", 10], ["NOVEMBER", 11], ["DECEMBER", 12],
]);

function isoDate(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseEdition(text, editionYear) {
  const references = {};
  let month = null;
  let year = null;
  let currentDate = null;
  let inFootnotes = false;

  for (const line of text.split(/\r?\n/)) {
    const monthHeading = line.match(/^\s*(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+(\d{4})\s*$/);
    if (monthHeading) {
      month = monthNumbers.get(monthHeading[1]);
      year = Number(monthHeading[2]);
      currentDate = null;
      inFootnotes = false;
      continue;
    }

    if (year !== editionYear || month === null) continue;

    const dayHeading = line.match(/^\s*(\d{1,2})\s+(?:SUN|Mon|Tue|Wed|Thu|Fri|Sat)\b/);
    if (dayHeading) {
      currentDate = isoDate(year, month, Number(dayHeading[1]));
      references[currentDate] ??= [];
      inFootnotes = false;
      continue;
    }

    if (!currentDate) continue;

    if (/^\s*\d{1,2}\s*$/.test(line) && references[currentDate].length > 0) {
      inFootnotes = true;
      continue;
    }
    if (inFootnotes) continue;

    for (const match of line.matchAll(/\((\d{1,4}[A-Z]*(?:-\d{1,4}[A-Z]*)?)(?:,[^)]*)?\)/g)) {
      if (!references[currentDate].includes(match[1])) references[currentDate].push(match[1]);
    }
  }

  const expectedDays = editionYear % 4 === 0 ? 366 : 365;
  if (Object.keys(references).length !== expectedDays) {
    throw new Error(`Expected ${expectedDays} dated entries for ${editionYear}, found ${Object.keys(references).length}.`);
  }

  const missing = Object.entries(references).filter(([, values]) => values.length === 0).map(([date]) => date);
  if (missing.length) {
    throw new Error(`Missing Lectionary references for ${editionYear}: ${missing.join(", ")}`);
  }

  return references;
}

const workDirectory = await mkdtemp(join(tmpdir(), "historia-lectionary-"));
const years = {};

for (const edition of editions) {
  const pdfPath = join(workDirectory, `${edition.year}.pdf`);
  const textPath = join(workDirectory, `${edition.year}.txt`);
  const response = await fetch(edition.url);
  if (!response.ok) throw new Error(`Could not download ${edition.url}: ${response.status}`);
  await writeFile(pdfPath, Buffer.from(await response.arrayBuffer()));
  await execFileAsync("pdftotext", ["-layout", pdfPath, textPath]);
  years[String(edition.year)] = parseEdition(await readFile(textPath, "utf8"), edition.year);
}

const payload = {
  source: "USCCB Liturgical Calendar for the Dioceses of the United States of America",
  sourcePage: "https://www.usccb.org/resources/liturgical-calendar-dioceses-united-states-america",
  editions: Object.fromEntries(editions.map(({ year, url }) => [String(year), url])),
  verifiedOn: "2026-07-17",
  years,
};

await writeFile(outputUrl, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${outputUrl.pathname.replace(repositoryRoot.pathname, "")} from ${editions.length} official editions.`);
