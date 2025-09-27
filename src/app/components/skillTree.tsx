"use client";
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";
import { SkillData } from "../types/skillData";
import { buildSkillTree } from "../utils/skillTreeUtils";

interface SkillTreeProps {
  skills: SkillData[];
  width?: number;
  height?: number;
}

// TODO: make size variable based on skill type
const NODE_WIDTH = 140;
const NODE_HEIGHT = 48;

//  should be variable??
const PADDING_X = 50;
const PADDING_Y = 100;


const SkillTree: React.FC<SkillTreeProps> = ({
  skills
}) => {
  // TODO: make variable based structure of tree
  var width = 1000;
  var height = 700;

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
      .nodeSize([NODE_WIDTH + PADDING_X, NODE_HEIGHT + PADDING_Y]);
      
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

    // Draw nodes
    const node = d3
      .select(gElement)
      .selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    node
      .append("rect")
      .attr("width", NODE_WIDTH)
      .attr("height", NODE_HEIGHT)
      .attr("x", -NODE_WIDTH / 2)
      .attr("y", -NODE_HEIGHT / 2)
      .attr("rx", 10)
      .attr("fill", d => d.data.Type === "Milestone Skill" ? "#f7d560" : "#fff")
      .attr("stroke", "#4287f5")
      .attr("stroke-width", 2);

    node
      .append("text")
      .attr("dy", 0)
      .attr("y", -8)
      .attr("text-anchor", "middle")
      .style("font-size", 15)
      .style("font-weight", d => d.data.Type === "Milestone Skill" ? "bold" : "normal")
      .text((d) => d.data.Name);

    node
      .append("text")
      .attr("dy", 16)
      .attr("text-anchor", "middle")
      .style("font-size", 11)
      .text((d) => d.data.Category);

    node.append("title").text((d) => d.data.Description || "");

  }, [skills, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ border: "1px solid #ccc", background: "#f8fafe" }}
    >
      <g ref={gRef} />
    </svg>
  );
};

export default SkillTree;