import { useEffect, useMemo, useState } from "react";
import { eras, events } from "../data";
import { buildKnowledgeGraph } from "../data/knowledgeGraph";
import { atlasTranslate } from "../data/livingAtlasCopy";
import { useLanguage } from "../hooks/useLanguage";
import type { EraId, KnowledgeEdge, KnowledgeNode, TimelineEvent } from "../types";
import { localize } from "../utils";

type BrowserMode = "area" | "path";
type EvidenceFilter = "all" | "person" | "source";

interface KnowledgeConstellationProps {
  selectedYear: number;
  selectedEventId: string;
  onFocusEvent: (event: TimelineEvent) => void;
  onOpenEvent: (event: TimelineEvent) => void;
  onSelectSource: (sourceId: string) => void;
}

interface PositionedNode {
  node: KnowledgeNode;
  x: number;
  y: number;
  column: "area" | "topic" | "evidence";
}

interface PositionedEdge {
  edge: KnowledgeEdge;
  source: PositionedNode;
  target: PositionedNode;
}

function shorten(value: string, length: number): string {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

function distribute(index: number, count: number, height: number): number {
  if (count <= 1) return height / 2;
  const top = 84;
  const bottom = height - 58;
  return top + (index * (bottom - top)) / (count - 1);
}

function relationKey(relation: KnowledgeEdge["relation"]): "graphRelationNames" | "graphRelationBelongs" | "graphRelationWitnessed" {
  if (relation === "belongs-to") return "graphRelationBelongs";
  if (relation === "witnessed-by") return "graphRelationWitnessed";
  return "graphRelationNames";
}

export function KnowledgeConstellation({
  selectedYear,
  selectedEventId,
  onFocusEvent,
  onOpenEvent,
  onSelectSource,
}: KnowledgeConstellationProps) {
  const { language } = useLanguage();
  const a = (key: Parameters<typeof atlasTranslate>[1]) => atlasTranslate(language, key);
  const selectedEvent = events.find((event) => event.id === selectedEventId) ?? events[0];
  const [mode, setMode] = useState<BrowserMode>("area");
  const [activeEraId, setActiveEraId] = useState<EraId>(selectedEvent.era);
  const [selectedNodeId, setSelectedNodeId] = useState(`event:${selectedEventId}`);
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceFilter>("all");
  const [query, setQuery] = useState("");
  const fullGraph = useMemo(() => buildKnowledgeGraph(selectedYear, language), [language, selectedYear]);

  useEffect(() => {
    const event = events.find((candidate) => candidate.id === selectedEventId);
    if (!event) return;
    setActiveEraId(event.era);
    setSelectedNodeId(`event:${event.id}`);
  }, [selectedEventId]);

  const areaCounts = useMemo(() => new Map(eras.map((era) => [
    era.id,
    fullGraph.nodes.filter((node) => node.type === "event" && node.eraId === era.id).length,
  ])), [fullGraph.nodes]);

  const activeEra = eras.find((era) => era.id === activeEraId) ?? eras[0];
  const areaEventNodes = fullGraph.nodes
    .filter((node) => node.type === "event" && node.eraId === activeEra.id)
    .sort((left, right) => (left.year ?? 0) - (right.year ?? 0));
  const focusEventNode = areaEventNodes.find((node) => node.id === `event:${selectedEventId}`) ?? areaEventNodes.at(-1);

  const browserGraph = useMemo(() => {
    const eraNode = fullGraph.nodes.find((node) => node.id === `era:${activeEra.id}`);
    const topicNodes = mode === "path" && focusEventNode ? [focusEventNode] : areaEventNodes;
    const topicIds = new Set(topicNodes.map((node) => node.id));
    const evidenceEdges = fullGraph.edges.filter((edge) => {
      if (!topicIds.has(edge.source) || edge.relation === "belongs-to") return false;
      const target = fullGraph.nodes.find((node) => node.id === edge.target);
      return Boolean(target && (evidenceFilter === "all" || target.type === evidenceFilter));
    });
    const evidenceIds = new Set(evidenceEdges.map((edge) => edge.target));
    const evidenceNodes = fullGraph.nodes
      .filter((node) => evidenceIds.has(node.id))
      .sort((left, right) => left.type.localeCompare(right.type) || left.label.localeCompare(right.label));
    const hierarchyEdges = fullGraph.edges.filter((edge) => topicIds.has(edge.source) && edge.target === eraNode?.id);
    const nodes = [...(eraNode ? [eraNode] : []), ...topicNodes, ...evidenceNodes];
    return { nodes, edges: [...hierarchyEdges, ...evidenceEdges], topicNodes, evidenceNodes };
  }, [activeEra.id, areaEventNodes, evidenceFilter, focusEventNode, fullGraph.edges, fullGraph.nodes, mode]);

  const layout = useMemo(() => {
    const height = Math.max(620, browserGraph.topicNodes.length * 70 + 120, browserGraph.evidenceNodes.length * 48 + 120);
    const positioned: PositionedNode[] = browserGraph.nodes.map((node) => {
      if (node.type === "era") return { node, x: 118, y: height / 2, column: "area" };
      const topicIndex = browserGraph.topicNodes.findIndex((candidate) => candidate.id === node.id);
      if (topicIndex >= 0) return { node, x: 445, y: distribute(topicIndex, browserGraph.topicNodes.length, height), column: "topic" };
      const evidenceIndex = browserGraph.evidenceNodes.findIndex((candidate) => candidate.id === node.id);
      return { node, x: 805, y: distribute(evidenceIndex, browserGraph.evidenceNodes.length, height), column: "evidence" };
    });
    const byId = new Map(positioned.map((item) => [item.node.id, item]));
    const edges = browserGraph.edges
      .map((edge) => edge.relation === "belongs-to"
        ? { edge, source: byId.get(edge.target)!, target: byId.get(edge.source)! }
        : { edge, source: byId.get(edge.source)!, target: byId.get(edge.target)! })
      .filter((edge): edge is PositionedEdge => Boolean(edge.source && edge.target));
    return { nodes: positioned, edges, height };
  }, [browserGraph]);

  const selectedNode = fullGraph.nodes.find((node) => node.id === selectedNodeId)
    ?? focusEventNode
    ?? fullGraph.nodes.find((node) => node.id === `era:${activeEra.id}`);
  const connectedEdges = selectedNode
    ? fullGraph.edges.filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
    : [];
  const connectedNodes = connectedEdges
    .map((edge) => fullGraph.nodes.find((node) => node.id === (edge.source === selectedNode?.id ? edge.target : edge.source)))
    .filter((node): node is KnowledgeNode => Boolean(node));
  const connectedIds = new Set([selectedNode?.id, ...connectedNodes.map((node) => node.id)]);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(language);
    if (normalized.length < 2) return [];
    return fullGraph.nodes
      .filter((node) => node.label.toLocaleLowerCase(language).includes(normalized))
      .sort((left, right) => Number(right.type === "event") - Number(left.type === "event") || (right.year ?? 0) - (left.year ?? 0))
      .slice(0, 8);
  }, [fullGraph.nodes, language, query]);

  function nodeTypeLabel(node: KnowledgeNode): string {
    if (node.type === "event") return a("graphEvent");
    if (node.type === "person") return a("graphPerson");
    if (node.type === "era") return a("graphEra");
    return a("graphSource");
  }

  function eraForNode(node: KnowledgeNode): EraId | undefined {
    if (node.eraId) return node.eraId;
    const linkedEventId = fullGraph.edges.find((edge) =>
      (edge.source === node.id && edge.target.startsWith("event:"))
      || (edge.target === node.id && edge.source.startsWith("event:")),
    );
    const eventNodeId = linkedEventId?.source.startsWith("event:") ? linkedEventId.source : linkedEventId?.target;
    return fullGraph.nodes.find((candidate) => candidate.id === eventNodeId)?.eraId;
  }

  function selectNode(node: KnowledgeNode) {
    const eraId = eraForNode(node);
    if (eraId) setActiveEraId(eraId);
    setSelectedNodeId(node.id);
    setQuery("");
    if (node.eventId) {
      const event = events.find((candidate) => candidate.id === node.eventId);
      if (event) onFocusEvent(event);
    }
    if (node.sourceId) onSelectSource(node.sourceId);
  }

  function openSource(sourceId: string) {
    onSelectSource(sourceId);
    window.requestAnimationFrame(() => document.getElementById("reading-room")?.scrollIntoView({
      behavior: document.documentElement.dataset.motion === "reduced" ? "auto" : "smooth",
      block: "start",
    }));
  }

  function selectArea(eraId: EraId) {
    setActiveEraId(eraId);
    setSelectedNodeId(`era:${eraId}`);
    setQuery("");
  }

  return (
    <section className="knowledge-constellation" aria-labelledby="constellation-title">
      <header className="atlas-panel-heading atlas-panel-heading--dark">
        <span className="atlas-eyebrow">03 · {a("graphKicker")}</span>
        <h3 id="constellation-title">{a("graphTitle")}</h3>
        <p>{a("graphBody")}</p>
      </header>

      <div className="constellation-toolbar">
        <div className="constellation-search">
          <label htmlFor="constellation-search">{a("graphSearch")}</label>
          <input
            id="constellation-search"
            type="search"
            value={query}
            placeholder={a("graphSearchPlaceholder")}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setQuery("");
            }}
          />
          {query.trim().length >= 2 && (
            <div className="constellation-search__results" aria-live="polite">
              <strong>{searchResults.length ? a("graphSearchResults") : a("graphNoResults")}</strong>
              {searchResults.length > 0 && (
                <ul>
                  {searchResults.map((node) => (
                    <li key={node.id}>
                      <button type="button" onClick={() => selectNode(node)}>
                        <i data-node-type={node.type} />
                        <span><b>{node.label}</b><small>{nodeTypeLabel(node)}{node.year ? ` · ${node.year}` : ""}</small></span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <div className="constellation-toolbar__controls">
          <div role="group" aria-label={a("graphMode")}>
            <button type="button" aria-pressed={mode === "area"} onClick={() => setMode("area")}>{a("areaMode")}</button>
            <button type="button" aria-pressed={mode === "path"} onClick={() => setMode("path")}>{a("pathMode")}</button>
          </div>
          <div role="group" aria-label={a("graphEvidenceFilter")}>
            <button type="button" aria-pressed={evidenceFilter === "all"} onClick={() => setEvidenceFilter("all")}>{a("showAll")}</button>
            <button type="button" aria-pressed={evidenceFilter === "person"} onClick={() => setEvidenceFilter("person")}>{a("showPeople")}</button>
            <button type="button" aria-pressed={evidenceFilter === "source"} onClick={() => setEvidenceFilter("source")}>{a("showSources")}</button>
          </div>
        </div>
        <p>{browserGraph.nodes.length} {a("graphNodeCount")} · {browserGraph.edges.length} {a("graphLinkCount")}</p>
      </div>

      <nav className="constellation-breadcrumb" aria-label={a("graphBreadcrumbRoot")}>
        <span>{a("graphBreadcrumbRoot")}</span><i aria-hidden="true">/</i><strong>{localize(activeEra.title, language)}</strong>
        {selectedNode && selectedNode.type !== "era" && <><i aria-hidden="true">/</i><b>{selectedNode.label}</b></>}
      </nav>

      <div className="constellation-layout">
        <nav className="constellation-areas" aria-label={a("knowledgeAreas")}>
          <header><span>{a("knowledgeAreas")}</span><small>{a("graphSelectArea")}</small></header>
          <ol>
            {eras.map((era) => {
              const count = areaCounts.get(era.id) ?? 0;
              return (
                <li key={era.id}>
                  <button type="button" className={era.id === activeEra.id ? "is-active" : undefined} aria-current={era.id === activeEra.id ? "true" : undefined} disabled={count === 0} onClick={() => selectArea(era.id)}>
                    <span>{era.number}</span>
                    <strong>{localize(era.title, language)}</strong>
                    <small>{localize(era.years, language)} · {count}</small>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="constellation-stage">
          <div className="constellation-columns" aria-hidden="true">
            <span>{a("knowledgeAreas")}</span><span>{a("knowledgeTopics")}</span><span>{a("knowledgeEvidence")}</span>
          </div>
          {layout.nodes.length > 0 ? (
            <svg viewBox={`0 0 1000 ${layout.height}`} role="group" aria-labelledby="constellation-svg-title constellation-svg-description">
              <title id="constellation-svg-title">{a("graphTitle")}</title>
              <desc id="constellation-svg-description">{a("graphHint")}</desc>
              <g className="constellation-edges" aria-hidden="true">
                {layout.edges.map(({ edge, source, target }) => {
                  const selected = Boolean(selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id));
                  const sourceX = source.column === "area" ? source.x + 82 : source.x + 132;
                  const targetX = target.column === "topic" ? target.x - 132 : target.x - 16;
                  const bend = (sourceX + targetX) / 2;
                  return <path key={edge.id} d={`M ${sourceX} ${source.y} C ${bend} ${source.y}, ${bend} ${target.y}, ${targetX} ${target.y}`} data-relation={edge.relation} className={selected ? "is-selected" : undefined} />;
                })}
              </g>
              <g className="constellation-nodes">
                {layout.nodes.map(({ node, x, y, column }) => {
                  const selected = node.id === selectedNode?.id;
                  const muted = Boolean(selectedNode && selectedNode.type !== "era" && !connectedIds.has(node.id));
                  return (
                    <g
                      key={node.id}
                      className={`${selected ? "is-selected" : ""}${muted ? " is-muted" : ""}`.trim() || undefined}
                      data-node-type={node.type}
                      data-node-column={column}
                      transform={`translate(${x} ${y})`}
                      role="button"
                      tabIndex={0}
                      aria-label={`${nodeTypeLabel(node)}: ${node.label}`}
                      onClick={() => selectNode(node)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectNode(node);
                        }
                      }}
                    >
                      <title>{node.label}</title>
                      {column === "area" && <rect x="-82" y="-37" width="164" height="74" rx="2" />}
                      {column === "topic" && <rect x="-132" y="-24" width="264" height="48" rx="24" />}
                      {column === "evidence" && node.type === "source" && <path d="M -13 0 L 0 -13 L 13 0 L 0 13 Z" />}
                      {column === "evidence" && node.type !== "source" && <circle r="11" />}
                      {column === "area" && <text textAnchor="middle" y="-3"><tspan>{shorten(node.label, 22)}</tspan><tspan x="0" dy="17">{areaCounts.get(activeEra.id) ?? 0} {a("knowledgeTopics")}</tspan></text>}
                      {column === "topic" && <text textAnchor="middle" y="-2"><tspan>{shorten(node.label, 35)}</tspan><tspan x="0" dy="15">{node.year}</tspan></text>}
                      {column === "evidence" && <text x="20" y="4">{shorten(node.label, 25)}</text>}
                    </g>
                  );
                })}
              </g>
            </svg>
          ) : <p className="constellation-empty">{a("graphEmpty")}</p>}
          <div className="constellation-legend" aria-hidden="true">
            {(["event", "person", "era", "source"] as const).map((type) => (
              <span key={type}><i data-node-type={type} />{type === "event" ? a("graphEvent") : type === "person" ? a("graphPerson") : type === "era" ? a("graphEra") : a("graphSource")}</span>
            ))}
          </div>
        </div>

        <aside className="constellation-inspector" aria-live="polite">
          {selectedNode ? (
            <>
              <span>{nodeTypeLabel(selectedNode)}{selectedNode.year ? ` · ${selectedNode.year}` : ""}</span>
              <h4>{selectedNode.label}</h4>
              <div>
                <strong>{a("graphEvidence")}</strong>
                <p>{selectedNode.evidence}</p>
              </div>
              {selectedNode.eventId && (() => {
                const event = events.find((candidate) => candidate.id === selectedNode.eventId);
                return event ? <button className="constellation-inspector__primary" type="button" onClick={() => onOpenEvent(event)}>{a("openRecord")} ↗</button> : null;
              })()}
              {selectedNode.sourceId && <button className="constellation-inspector__primary" type="button" onClick={() => openSource(selectedNode.sourceId!)}>{a("readingTitle")} →</button>}
              {connectedNodes.length > 0 && (
                <div className="constellation-inspector__connected">
                  <strong>{a("graphConnected")}</strong>
                  <ul>
                    {connectedNodes.slice(0, 14).map((node) => {
                      const relation = connectedEdges.find((edge) => edge.source === node.id || edge.target === node.id)?.relation ?? "names";
                      return (
                        <li key={node.id}>
                          <button type="button" onClick={() => selectNode(node)}>
                            <i data-node-type={node.type} />
                            <span>{node.label}<small>{a(relationKey(relation))}</small></span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {selectedNode.eraId && <small>{localize(eras.find((era) => era.id === selectedNode.eraId)?.years ?? { en: "", es: "", fr: "", pt: "" }, language)}</small>}
            </>
          ) : <p>{a("graphHint")}</p>}
        </aside>
      </div>
    </section>
  );
}
