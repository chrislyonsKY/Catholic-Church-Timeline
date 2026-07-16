import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const content = JSON.parse(await readFile(new URL("../app/src/data/content.json", import.meta.url), "utf8"));
const atlasSource = await readFile(new URL("../app/src/data/livingAtlas.ts", import.meta.url), "utf8");
const placeBlock = atlasSource.match(/export const atlasPlaces[\s\S]+?export const sourceObjects/)?.[0] ?? "";
const sourceBlock = atlasSource.match(/export const sourceObjects[\s\S]+?export function placesForEvent/)?.[0] ?? "";
const eventIds = new Set(content.events.map((event) => event.id));

function extractQuotedList(value) {
  return [...value.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

test("every curated event has a documented atlas location", () => {
  const mappedIds = new Set();
  const placeIds = new Set();
  const placeLines = placeBlock.split("\n").filter((line) => line.trim().startsWith("place("));
  assert.ok(placeLines.length >= 25, "the atlas should contain a substantive place register");

  for (const line of placeLines) {
    const id = line.match(/place\("([^"]+)"/)?.[1];
    assert.ok(id && !placeIds.has(id), `place ID must be unique: ${id}`);
    placeIds.add(id);

    const coordinates = line.match(/,\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?),\s*"(site|city|region)",\s*(\[[^\]]+\])\),?\s*$/);
    assert.ok(coordinates, `${id} must expose coordinates, precision, and event IDs`);
    const longitude = Number(coordinates[1]);
    const latitude = Number(coordinates[2]);
    assert.ok(longitude >= -180 && longitude <= 180, `${id} longitude is invalid`);
    assert.ok(latitude >= -90 && latitude <= 90, `${id} latitude is invalid`);

    for (const eventId of extractQuotedList(coordinates[4])) {
      assert.ok(eventIds.has(eventId), `${id} references unknown event ${eventId}`);
      mappedIds.add(eventId);
    }
  }

  assert.deepEqual(mappedIds, eventIds, "the mapped event set must exactly cover the curated chronology");
});

test("IIIF reading-room records expose traceable services and rights", () => {
  const sourceIds = [...sourceBlock.matchAll(/^\s+id:\s+"([^"]+)",$/gm)].map((match) => match[1]);
  assert.equal(sourceIds.length, 4);
  assert.equal(new Set(sourceIds).size, sourceIds.length, "source object IDs must be unique");

  const manifests = [...sourceBlock.matchAll(/manifestUrl:\s+"([^"]+)"/g)].map((match) => match[1]);
  const services = [...sourceBlock.matchAll(/imageService:\s+"([^"]+)"/g)].map((match) => match[1]);
  const rights = [...sourceBlock.matchAll(/rights:\s+"([^"]+)"/g)].map((match) => match[1]);
  assert.equal(manifests.length, sourceIds.length);
  assert.equal(services.length, sourceIds.length);
  assert.equal(rights.length, sourceIds.length);
  assert.ok(manifests.every((url) => url.startsWith("https://digi.vatlib.it/iiif/") && url.endsWith("/manifest.json")));
  assert.ok(services.every((url) => url.startsWith("https://digi.vatlib.it/iiifimage/") && url.endsWith(".jp2")));
  assert.ok(rights.every((statement) => statement === "Images Copyright Biblioteca Apostolica Vaticana"));

  for (const list of sourceBlock.matchAll(/relatedEventIds:\s*(\[[^\]]+\])/g)) {
    for (const eventId of extractQuotedList(list[1])) assert.ok(eventIds.has(eventId), `source references unknown event ${eventId}`);
  }
});
