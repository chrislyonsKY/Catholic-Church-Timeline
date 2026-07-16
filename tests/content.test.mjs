import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const content = JSON.parse(
  await readFile(new URL("../app/src/data/content.json", import.meta.url), "utf8"),
);
const additionalContent = JSON.parse(
  await readFile(new URL("../app/src/data/content-extra.json", import.meta.url), "utf8"),
);

const languages = ["en", "es"];
const additionalLanguages = ["fr", "pt"];
const categories = new Set([
  "apostles",
  "saints",
  "popes",
  "councils",
  "turning-points",
  "documents",
]);
const eras = new Set([
  "apostolic",
  "imperial",
  "medieval",
  "reformation",
  "modern",
  "contemporary",
]);
const saintPeriods = new Set(["early", "founders", "medieval", "renewal", "modern"]);

function assertLocalizedText(value, label) {
  assert.equal(typeof value, "object", `${label} must be localized`);
  for (const language of languages) {
    assert.equal(typeof value[language], "string", `${label}.${language} must be text`);
    assert.ok(value[language].trim(), `${label}.${language} cannot be empty`);
  }
}

test("the exhibition contains the complete curated record", () => {
  assert.equal(content.events.length, 52);
  assert.equal(content.saints.length, 26);
});

test("timeline event IDs and base translations satisfy the data contract", () => {
  const ids = new Set();

  for (const event of content.events) {
    assert.ok(event.id && !ids.has(event.id), `event ID must be unique: ${event.id}`);
    ids.add(event.id);
    assert.equal(typeof event.year, "number", `${event.id}.year must be numeric`);
    assert.ok(categories.has(event.category), `${event.id} has an unknown category`);
    assert.ok(eras.has(event.era), `${event.id} has an unknown era`);

    for (const field of ["yearLabel", "title", "summary", "detail"]) {
      assertLocalizedText(event[field], `${event.id}.${field}`);
    }

    for (const language of languages) {
      assert.ok(Array.isArray(event.people[language]), `${event.id}.people.${language} must be a list`);
      assert.ok(event.people[language].every((person) => typeof person === "string" && person.trim()));
    }

    if (event.source) {
      const url = new URL(event.source);
      assert.equal(url.protocol, "https:", `${event.id}.source must use HTTPS`);
    }
  }
});

test("saint profiles have unique IDs and complete base translations", () => {
  const ids = new Set();

  for (const saint of content.saints) {
    assert.ok(saint.id && !ids.has(saint.id), `saint ID must be unique: ${saint.id}`);
    ids.add(saint.id);
    assert.ok(saintPeriods.has(saint.period), `${saint.id} has an unknown period`);

    for (const field of ["name", "dates", "place", "note"]) {
      assertLocalizedText(saint[field], `${saint.id}.${field}`);
    }
  }
});

test("French and Portuguese editions cover every event and saint", () => {
  const eventIds = new Set(content.events.map(({ id }) => id));
  const saintIds = new Set(content.saints.map(({ id }) => id));

  for (const language of additionalLanguages) {
    const edition = additionalContent[language];
    assert.ok(edition, `${language} edition must exist`);
    assert.deepEqual(new Set(Object.keys(edition.events)), eventIds, `${language} must translate every event exactly once`);
    assert.deepEqual(new Set(Object.keys(edition.saints)), saintIds, `${language} must translate every saint exactly once`);

    for (const [id, event] of Object.entries(edition.events)) {
      for (const field of ["title", "summary", "detail"]) {
        assert.equal(typeof event[field], "string", `${language}.${id}.${field} must be text`);
        assert.ok(event[field].trim(), `${language}.${id}.${field} cannot be empty`);
      }
    }

    for (const [id, saint] of Object.entries(edition.saints)) {
      for (const field of ["name", "dates", "place", "note"]) {
        assert.equal(typeof saint[field], "string", `${language}.${id}.${field} must be text`);
        assert.ok(saint[field].trim(), `${language}.${id}.${field} cannot be empty`);
      }
    }
  }
});
