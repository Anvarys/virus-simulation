// D3Graph.tsx
import { useRef, useEffect } from "react";
import * as d3 from "d3";

type NodeDatum = { 
  id: number; r?: number; group?: number 

  // not real
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
};
type LinkDatum = { source: number; target: number; value?: number };

interface D3GraphProps {
  nodes: NodeDatum[];
  links: LinkDatum[];
  width?: number;
  height?: number;
}

export default function D3Graph({
  nodes,
  links,
  width = 800,
  height = 600,
}: D3GraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simRef = useRef<d3.Simulation<any, undefined> | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const nodesData = nodes.map((n) => ({ ...n }));
    const linksData = links.map((l) => ({ ...l }));

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg.selectAll("*").remove();

    const container = svg.append("g").attr("class", "zoom-container");
    
    const linkG = container.append("g").attr("class", "links");
    const nodeG = container.append("g").attr("class", "nodes");

    const link = linkG
      .selectAll("line")
      .data(linksData, (d: any) => `${d.source}->${d.target}`)
      .join("line")
      .attr("stroke-width", (d: any) => Math.max(1, (d.value ?? 1)))
      .attr("stroke-opacity", 0.6)
      .attr("stroke", "white");

    const node = nodeG
      .selectAll<SVGCircleElement, NodeDatum>("circle")
      .data(nodesData, (d: any) => d.id)
      .join("circle")
      .attr("r", (d) => d.r ?? 8)
      .attr("stroke", "#ffffff")
      .attr("fill", (d) => (d.group != null ? d3.schemeCategory10[(d.group % 10)] : "#69b3a2"));

    node.append("title").text((d: any) => d.id);

    const sim = d3
      .forceSimulation(nodesData as any)
      .force(
        "link",
        d3.forceLink(linksData as any).id((d: any) => d.id).distance(80).strength(0.7)
      )
      .force("charge", d3.forceManyBody().strength(-150))
      .force("center", d3.forceCenter(width / 2, height / 2));

    simRef.current = sim;

    const dragBehavior = d3
      .drag<SVGCircleElement, NodeDatum, NodeDatum>()
      .on("start", (event, d) => {
        if (!simRef.current) return;
        if (!event.active) simRef.current.alphaTarget(0.3).restart();
        d.fx = d.x ?? event.x;
        d.fy = d.y ?? event.y;
        d3.select(event.sourceEvent.currentTarget)
          .style("cursor", "grabbing");
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!simRef.current) return;
        if (!event.active) simRef.current.alphaTarget(0);
        d.fx = null;
        d.fy = null;

        d3.select(event.sourceEvent.currentTarget).style("cursor", "grab"); 
      });

    node.call(dragBehavior);

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 5])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoomBehavior as any);

    sim.on("tick", () => {
      link
        .attr("x1", (d: any) => (d.source as any).x)
        .attr("y1", (d: any) => (d.source as any).y)
        .attr("x2", (d: any) => (d.target as any).x)
        .attr("y2", (d: any) => (d.target as any).y);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
    });

    return () => {
      sim.stop();
      simRef.current = null;
      svg.selectAll("*").remove();
    };
  }, [nodes, links, width, height]);

  return (
    <div className="w-full h-full">
      <svg ref={svgRef} className="w-full h-full text-blue-600" />
    </div>
  );
}

export type { LinkDatum, NodeDatum }