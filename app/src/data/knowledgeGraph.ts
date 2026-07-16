import { eras, events } from "./index";
import { sourceObjects } from "./livingAtlas";
import { atlasTranslate } from "./livingAtlasCopy";
import type { KnowledgeEdge, KnowledgeNode, Language } from "../types";
import { localize } from "../utils";

function personId(name: string): string {
  return `person:${name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export function buildKnowledgeGraph(selectedYear: number, language: Language): KnowledgeGraphData {
  const visibleEvents = events.filter((event) => event.year <= selectedYear);
  const nodes = new Map<string, KnowledgeNode>();
  const edges: KnowledgeEdge[] = [];

  for (const event of visibleEvents) {
    const eventNodeId = `event:${event.id}`;
    nodes.set(eventNodeId, {
      id: eventNodeId,
      type: "event",
      label: localize(event.title, language),
      year: event.year,
      eventId: event.id,
      eraId: event.era,
      evidence: localize(event.summary, language),
    });

    const era = eras.find((candidate) => candidate.id === event.era);
    const eraNodeId = `era:${event.era}`;
    if (era && !nodes.has(eraNodeId)) {
      nodes.set(eraNodeId, {
        id: eraNodeId,
        type: "era",
        label: localize(era.title, language),
        eraId: era.id,
        evidence: atlasTranslate(language, "graphEraEvidence"),
      });
    }
    edges.push({ id: `${eventNodeId}--${eraNodeId}`, source: eventNodeId, target: eraNodeId, relation: "belongs-to" });

    event.people.en.forEach((stableName, index) => {
      const id = personId(stableName);
      if (!nodes.has(id)) {
        nodes.set(id, {
          id,
          type: "person",
          label: event.people[language][index] ?? stableName,
          evidence: atlasTranslate(language, "graphNamedIn"),
        });
      }
      edges.push({ id: `${eventNodeId}--${id}`, source: eventNodeId, target: id, relation: "names" });
    });
  }

  for (const source of sourceObjects.filter((object) => object.startYear <= selectedYear)) {
    const sourceNodeId = `source:${source.id}`;
    nodes.set(sourceNodeId, {
      id: sourceNodeId,
      type: "source",
      label: localize(source.title, language),
      year: source.startYear,
      sourceId: source.id,
      evidence: localize(source.relationshipNote, language),
    });
    for (const eventId of source.relatedEventIds) {
      const eventNodeId = `event:${eventId}`;
      if (!nodes.has(eventNodeId)) continue;
      edges.push({ id: `${eventNodeId}--${sourceNodeId}`, source: eventNodeId, target: sourceNodeId, relation: "witnessed-by" });
    }
  }

  return { nodes: [...nodes.values()], edges };
}
