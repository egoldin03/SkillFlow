"use client";
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import ReactDOM from 'react-dom/client';
import { SkillData } from "../../types/skillData";
import { buildSkillTree } from "../../utils/benTreeUtils/skillTreeUtils";

import pushup from "@/public/pushup.svg"

import { BaseProgressIcon } from "../chart/BaseProgressIcon";

interface SkillTreeProps {
  skills: SkillData[];
}

// const NODE_WIDTH = 140;
// const NODE_HEIGHT = 48;

const pushupPath = "/pushup.svg";

const BASE_NODE_SIZE = 140;
const BASE_PADDING = 50;

const getSize = (type: string) => {
  if (type == "Milestone Skill") return BASE_NODE_SIZE * 1.5;
  if (type == "Variation") return BASE_NODE_SIZE * .7;
  return BASE_NODE_SIZE;
};

// Fixed Spacing (using max size for consistent tree layout spacing)
const MAX_NODE_SIZE = BASE_NODE_SIZE * 1.5;
const PADDING_X = BASE_PADDING;
const PADDING_Y = BASE_PADDING * 2;

const SkillTree: React.FC<SkillTreeProps> = ({
  skills
}) => {
  var width = 1200;
  var height = 900;

  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const svgElement = svgRef.current;
    const gElement = gRef.current;
    if (!svgElement || !gElement) return;

    // Build tree(s) from flat list
    const roots = buildSkillTree(skills);
    const rootData = roots[0];
    if (!rootData) return;

    const root = d3.hierarchy(rootData);

    const treeLayout = d3.tree<any>()
      .nodeSize([MAX_NODE_SIZE + PADDING_X, MAX_NODE_SIZE + PADDING_Y]);
      
    treeLayout(root);

    // Setup D3 zoom
    const svg = d3.select(svgElement);
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
      d3.select(gElement).attr("transform", event.transform);
    });
    svg.call(zoomBehavior as any);

    d3.select(gElement).selectAll("*").remove();
    
    // Calculate initial centering/translation for the root
    // This centers the root node horizontally and gives some top margin
    const initialTranslateX = width / 2;
    const initialTranslateY = 50; 
    
    // Apply the initial translation to gElement
    d3.select(gElement).attr("transform", `translate(${initialTranslateX},${initialTranslateY})`);


    // Draw links
    const linkGenerator = d3
      .link(d3.curveStepAfter)
      .x(d => d[0])
      .y(d => d[1]);

    const links: d3.HierarchyPointLink<any>[] = root.links().map(l => ({
      source: l.source as d3.HierarchyPointNode<any>,
      target: l.target as d3.HierarchyPointNode<any>,
    }));

    d3.select(gElement)
      .selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2)
      .attr("fill", "none")
      .attr("d", (d) => {
        const sourceX = d.source.x;
        const sourceY = d.source.y;

        const targetX = d.target.x;
        const targetY = d.target.y;

        const midY = sourceY + (targetY - sourceY) / 2;

        return `M ${sourceX}, ${sourceY} ` // Start at Parent center
             // Vertical line down to the halfway point (the single trunk)
             + `V ${midY} ` 
             // Horizontal line to the child's X coordinate (the branch split)
             + `H ${targetX} ` 
             // Vertical line down to the child's Y coordinate (the final drop)
             + `V ${targetY}`;
      });

      type D3Node = d3.HierarchyPointNode<SkillData & { children?: any[] }>;

      const nodeData: D3Node[] = root.descendants() as D3Node[];

    // Draw nodes
    const node = d3
      .select(gElement)
      .selectAll<SVGGElement, D3Node>(".node")
      .data(nodeData)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    node.each(function(d) {
      const g = d3.select(this);
      const size = getSize(d.data.Type);

      // 1. Append the <foreignObject> element
      const foreignObject = g
        .append("foreignObject")
        .attr("x", -size / 2) // Center foreignObject around (0,0)
        .attr("y", -size / 2)
        .attr("width", size)
        .attr("height", size)
        .attr("class", "node-foreign-object");

      // 2. Append a simple <div> container inside the foreignObject
      // This is where React will render.
      const reactContainer = foreignObject.append("xhtml:div")
        .style("width", `${size}px`)
        .style("height", `${size}px`)
        .node();
      
      // 3. Render the React Component (BaseNode) into the div
      // We are using ReactDOM to render the component from BaseNode.tsx here.
      if (reactContainer) {
        const container = reactContainer as Element;
        ReactDOM.createRoot(container).render(
          <BaseProgressIcon 
            size={size} // Pass the calculated size
            progress={d.data.Difficulty * 15}
            image_path={pushupPath}
          />
        );
      }
      // 4. Append a hidden title for tooltips (Still useful for native tooltips)
      g.append("title").text(d.data.Description || d.data.Name);
    });

  }, [skills]); // Updated dependencies


  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ border: "1px solid #ccc", background: "#021121" }}
    >
      <g ref={gRef} />
    </svg>
  );
};

export default SkillTree;