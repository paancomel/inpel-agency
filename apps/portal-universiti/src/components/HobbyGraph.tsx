import {
  drag,
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  select,
  zoom,
  type D3DragEvent,
  type D3ZoomEvent,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3";
import { useEffect, useRef } from "react";

interface HobbyGraphProps {
  selected: string[];
  onToggle: (hobby: string) => void;
}

interface HobbyNode extends SimulationNodeDatum {
  id: string;
  label: string;
  group: "digital" | "creative" | "people" | "active";
}

const hobbies: HobbyNode[] = [
  { id: "coding", label: "Coding", group: "digital" },
  { id: "gaming", label: "Gaming", group: "digital" },
  { id: "robotics", label: "Robotics", group: "digital" },
  { id: "writing", label: "Writing", group: "creative" },
  { id: "design", label: "Design", group: "creative" },
  { id: "music", label: "Music", group: "creative" },
  { id: "volunteering", label: "Volunteering", group: "people" },
  { id: "debate", label: "Debate", group: "people" },
  { id: "business", label: "Business", group: "people" },
  { id: "sports", label: "Sports", group: "active" },
  { id: "nature", label: "Nature", group: "active" },
  { id: "building", label: "Building", group: "active" },
];

const links: Array<SimulationLinkDatum<HobbyNode>> = [
  { source: "coding", target: "gaming" }, { source: "coding", target: "robotics" },
  { source: "design", target: "writing" }, { source: "design", target: "music" },
  { source: "volunteering", target: "debate" }, { source: "debate", target: "business" },
  { source: "sports", target: "nature" }, { source: "nature", target: "building" },
  { source: "robotics", target: "building" }, { source: "design", target: "business" },
  { source: "music", target: "volunteering" }, { source: "gaming", target: "sports" },
];

const groupColors = { digital: "#247158", creative: "#d98b3d", people: "#3973a4", active: "#7a6843" };

export function HobbyGraph({ selected, onToggle }: HobbyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const nodes = hobbies.map((node) => ({ ...node }));
    const graphLinks = links.map((link) => ({ ...link }));
    const svg = select(svgRef.current);
    svg.selectAll("*").remove();
    const canvas = svg.append("g");

    svg.call(
      zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.75, 2.25])
        .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
          canvas.attr("transform", event.transform.toString());
        }),
    );

    const linkLines = canvas
      .append("g")
      .attr("stroke", "#b7c8c1")
      .attr("stroke-width", 1.5)
      .selectAll("line")
      .data(graphLinks)
      .join("line");

    const nodeGroups = canvas
      .append("g")
      .selectAll<SVGGElement, HobbyNode>("g")
      .data(nodes)
      .join("g")
      .attr("role", "button")
      .attr("tabindex", 0)
      .attr("aria-label", (node) => `${node.label} hobby node`)
      .attr("aria-pressed", (node) => String(selected.includes(node.label)))
      .style("cursor", "pointer")
      .on("click", (_event, node) => onToggle(node.label))
      .on("keydown", (event: KeyboardEvent, node) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onToggle(node.label);
        }
      });

    nodeGroups
      .append("circle")
      .attr("r", (node) => selected.includes(node.label) ? 30 : 25)
      .attr("fill", (node) => selected.includes(node.label) ? groupColors[node.group] : "#ffffff")
      .attr("stroke", (node) => groupColors[node.group])
      .attr("stroke-width", (node) => selected.includes(node.label) ? 4 : 2);

    nodeGroups
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 45)
      .attr("fill", "#10231d")
      .attr("font-size", 12)
      .attr("font-weight", 700)
      .text((node) => node.label);

    const simulation = forceSimulation(nodes)
      .force("link", forceLink<HobbyNode, SimulationLinkDatum<HobbyNode>>(graphLinks).id((node) => node.id).distance(92))
      .force("charge", forceManyBody().strength(-210))
      .force("center", forceCenter(360, 190))
      .force("collision", forceCollide(47))
      .on("tick", () => {
        linkLines
          .attr("x1", (link) => (link.source as HobbyNode).x ?? 0)
          .attr("y1", (link) => (link.source as HobbyNode).y ?? 0)
          .attr("x2", (link) => (link.target as HobbyNode).x ?? 0)
          .attr("y2", (link) => (link.target as HobbyNode).y ?? 0);
        nodeGroups.attr("transform", (node) => `translate(${node.x ?? 0},${node.y ?? 0})`);
      });

    nodeGroups.call(
      drag<SVGGElement, HobbyNode>()
        .on("start", (event: D3DragEvent<SVGGElement, HobbyNode, HobbyNode>, node) => {
          if (!event.active) simulation.alphaTarget(0.25).restart();
          node.fx = node.x;
          node.fy = node.y;
        })
        .on("drag", (event: D3DragEvent<SVGGElement, HobbyNode, HobbyNode>, node) => {
          node.fx = event.x;
          node.fy = event.y;
        })
        .on("end", (event: D3DragEvent<SVGGElement, HobbyNode, HobbyNode>, node) => {
          if (!event.active) simulation.alphaTarget(0);
          node.fx = null;
          node.fy = null;
        }),
    );

    return () => {
      simulation.stop();
    };
  }, [onToggle, selected]);

  return (
    <div>
      <div className="overflow-hidden border border-slate-200 bg-white">
        <svg ref={svgRef} viewBox="0 0 720 390" className="h-auto min-h-72 w-full" aria-label="Interactive hobby relationship graph" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Accessible hobby choices">
        {hobbies.map((hobby) => {
          const isSelected = selected.includes(hobby.label);
          return (
            <button
              key={hobby.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(hobby.label)}
              className={`border px-3 py-2 text-sm font-bold transition ${isSelected ? "border-forest bg-forest text-white" : "border-slate-300 bg-white text-slate-600 hover:border-leaf"}`}
            >
              {hobby.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
