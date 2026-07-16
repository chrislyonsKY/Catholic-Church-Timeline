import { useEffect, useMemo, useState } from "react";
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from "d3-force";
import type { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import { eras, events } from "../data";
import { buildKnowledgeGraph } from "../data/knowledgeGraph";
import { atlasTranslate } from "../data/livingAtlasCopy";
import { useLanguage } from "../hooks/useLanguage";
import type { KnowledgeEdge, KnowledgeNode, TimelineEvent } from "../types";
import { localize } from "../utils";

type ConstellationMode = "focus" | "galaxy";

interface LayoutNode extends KnowledgeNode, SimulationNodeDatum {}
interface LayoutLink extends SimulationLinkDatum<LayoutNode>, Omit<KnowledgeEdge, "source" | "target"> {
  source: string | LayoutNode;
  target: string | LayoutNode;
}

interface KnowledgeConstellationProps {
  selectedYear: number;
  selectedEventId: string;
  onFocusEvent: (event: TimelineEvent) => void;
  onOpenEvent: (event: TimelineEvent) => void;
  onSelectSource: (sourceId: string) => void;
}

function seedPosition(id: string, index: number, count: number): { x: number; y: number } {
  let hash = 0;
  for (const character of id) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  const angle = ((hash % 360) * Math.PI) / 180 + index * 2.39996;
  const radius = 65 + ((hash % 1000) / 1000) * Math.min(245, 34 * Math.sqrt(count));
  return { x: 500 + Math.cos(angle) * radius, y: 300 + Math.sin(angle) * radius };
}

function endpointId(endpoint: string | LayoutNode): string {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

function nodeRadius(node: KnowledgeNode): number {
  if (node.type === "event") return 9;
  if (node.type === "era") return 15;
  if (node.type === "source") return 12;
  return 5;
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
  const [mode, setMode] = useState<ConstellationMode>("focus");
  const [selectedNodeId, setSelectedNodeId] = useState(`event:${selectedEventId}`);
  const fullGraph = useMemo(() => buildKnowledgeGraph(selectedYear, language), [language, selectedYear]);

  useEffect(() => setSelectedNodeId(`event:${selectedEventId}`), [selectedEventId]);

  const graph = useMemo(() => {
    if (mode === "galaxy") return fullGraph;
    const selected = events.find((event) => event.id === selectedEventId && event.year <= selectedYear);
    if (!selected) return { nodes: [], edges: [] };
    const people = new Set(selected.people.en);
    const relatedEventIds = events
      .filter((event) => event.year <= selectedYear && event.id !== selected.id)
      .map((event) => ({
        id: event.id,
        shared: event.people.en.filter((person) => people.has(person)).length,
        distance: Math.abs(event.year - selected.year),
      }))
      .filter((event) => event.shared > 0)
      .sort((left, right) => right.shared - left.shared || left.distance - right.distance)
      .slice(0, 7)
      .map((event) => event.id);
    const includedEvents = new Set([selected.id, ...relatedEventIds].map((id) => `event:${id}`));
    const includedNodes = new Set(includedEvents);
    for (const edge of fullGraph.edges) {
      if (includedEvents.has(edge.source)) includedNodes.add(edge.target);
    }
    return {
      nodes: fullGraph.nodes.filter((node) => includedNodes.has(node.id)),
      edges: fullGraph.edges.filter((edge) => includedNodes.has(edge.source) && includedNodes.has(edge.target)),
    };
  }, [fullGraph, mode, selectedEventId, selectedYear]);

  const layout = useMemo(() => {
    const nodes: LayoutNode[] = graph.nodes.map((node, index) => ({ ...node, ...seedPosition(node.id, index, graph.nodes.length) }));
    const links: LayoutLink[] = graph.edges.map((edge) => ({ ...edge }));
    if (nodes.length === 0) return { nodes, links };
    const simulation = forceSimulation(nodes)
      .force("link", forceLink<LayoutNode, LayoutLink>(links).id((node) => node.id).distance((link) => link.relation === "belongs-to" ? 82 : link.relation === "witnessed-by" ? 100 : 58).strength(0.42))
      .force("charge", forceManyBody<LayoutNode>().strength(mode === "galaxy" ? -72 : -125))
      .force("collision", forceCollide<LayoutNode>().radius((node) => nodeRadius(node) + (node.type === "event" ? 8 : 4)).iterations(2))
      .force("center", forceCenter(500, 300))
      .force("x", forceX<LayoutNode>(500).strength(0.035))
      .force("y", forceY<LayoutNode>(300).strength(0.05))
      .stop();
    for (let index = 0; index < (mode === "galaxy" ? 260 : 190); index += 1) simulation.tick();
    simulation.stop();
    nodes.forEach((node) => {
      node.x = Math.max(35, Math.min(965, node.x ?? 500));
      node.y = Math.max(35, Math.min(565, node.y ?? 300));
    });
    return { nodes, links };
  }, [graph, mode]);

  const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId)
    ?? graph.nodes.find((node) => node.id === `event:${selectedEventId}`)
    ?? graph.nodes[0];
  const connectedNodes = selectedNode ? graph.edges
    .filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
    .map((edge) => graph.nodes.find((node) => node.id === (edge.source === selectedNode.id ? edge.target : edge.source)))
    .filter((node): node is KnowledgeNode => Boolean(node)) : [];

  function selectNode(node: KnowledgeNode) {
    setSelectedNodeId(node.id);
    if (node.eventId) {
      const event = events.find((candidate) => candidate.id === node.eventId);
      if (event) onFocusEvent(event);
    }
    if (node.sourceId) onSelectSource(node.sourceId);
  }

  function nodeTypeLabel(node: KnowledgeNode): string {
    if (node.type === "event") return a("graphEvent");
    if (node.type === "person") return a("graphPerson");
    if (node.type === "era") return a("graphEra");
    return a("graphSource");
  }

  function openSource(sourceId: string) {
    onSelectSource(sourceId);
    window.requestAnimationFrame(() => document.getElementById("reading-room")?.scrollIntoView({
      behavior: document.documentElement.dataset.motion === "reduced" ? "auto" : "smooth",
      block: "start",
    }));
  }

  return (
    <section className="knowledge-constellation" aria-labelledby="constellation-title">
      <header className="atlas-panel-heading atlas-panel-heading--dark">
        <span className="atlas-eyebrow">03 · {a("graphKicker")}</span>
        <h3 id="constellation-title">{a("graphTitle")}</h3>
        <p>{a("graphBody")}</p>
      </header>

      <div className="constellation-toolbar">
        <div role="group" aria-label={a("graphMode")}>
          <button type="button" aria-pressed={mode === "focus"} onClick={() => setMode("focus")}>{a("focusMode")}</button>
          <button type="button" aria-pressed={mode === "galaxy"} onClick={() => setMode("galaxy")}>{a("galaxyMode")}</button>
        </div>
        <p>{graph.nodes.length} {a("graphNodeCount")} · {graph.edges.length} {a("graphLinkCount")}</p>
      </div>

      <div className="constellation-layout">
        <div className="constellation-stage">
          {layout.nodes.length > 0 ? (
            <svg viewBox="0 0 1000 600" role="img" aria-labelledby="constellation-svg-title constellation-svg-description">
              <title id="constellation-svg-title">{a("graphTitle")}</title>
              <desc id="constellation-svg-description">{a("graphHint")}</desc>
              <g className="constellation-edges" aria-hidden="true">
                {layout.links.map((link) => {
                  const source = link.source as LayoutNode;
                  const target = link.target as LayoutNode;
                  return <line key={link.id} x1={source.x} y1={source.y} x2={target.x} y2={target.y} data-relation={link.relation} />;
                })}
              </g>
              <g className="constellation-nodes">
                {layout.nodes.map((node) => {
                  const selected = node.id === selectedNode?.id;
                  const showLabel = selected || mode === "focus" && node.type !== "person" || node.type === "era";
                  const shortLabel = node.label.length > 27 ? `${node.label.slice(0, 25)}…` : node.label;
                  return (
                    <g
                      key={node.id}
                      className={selected ? "is-selected" : undefined}
                      data-node-type={node.type}
                      transform={`translate(${node.x ?? 500} ${node.y ?? 300})`}
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
                      <circle r={nodeRadius(node)} />
                      {showLabel && <text x={nodeRadius(node) + 7} y="4">{shortLabel}</text>}
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
                    {connectedNodes.slice(0, 12).map((node) => (
                      <li key={node.id}>
                        <button type="button" onClick={() => selectNode(node)}>
                          <i data-node-type={node.type} />
                          <span>{node.label}</span>
                        </button>
                      </li>
                    ))}
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
