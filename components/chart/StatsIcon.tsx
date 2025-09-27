import React from "react";

interface StatsIconProps {
  size?: number;
  className?: string;
  barValues?: number[]; // Array of values for each bar (0-100)
}

export const StatsIcon: React.FC<StatsIconProps> = ({
  size = 200,
  className = "",
  barValues = [40, 60, 80, 100], // Default values matching the image
}) => {
  const centerX = 100;
  const barWidth = 12;
  const maxBarHeight = 45;
  const baseY = 125; // Base line for the bars

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Dark background circle */}
      <circle cx="100" cy="100" r="100" fill="#1a2332" />

      {/* White border circle */}
      <circle
        cx="100"
        cy="100"
        r="85"
        fill="none"
        stroke="white"
        strokeWidth="6"
      />

      {/* Bar chart bars */}
      {barValues.map((value, index) => {
        const barHeight = (value / 100) * maxBarHeight;
        const x =
          centerX -
          (barValues.length * barWidth + (barValues.length - 1) * 4) / 2 +
          index * (barWidth + 4);

        return (
          <rect
            key={index}
            x={x}
            y={baseY - barHeight}
            width={barWidth}
            height={barHeight}
            fill="#ffc107" // Yellow/amber color
            rx="2" // Slightly rounded corners
          />
        );
      })}

      {/* Base line for the chart */}
      <line
        x1={centerX - 35}
        y1={baseY}
        x2={centerX + 35}
        y2={baseY}
        stroke="white"
        strokeWidth="1.5"
        opacity="0.3"
      />
    </svg>
  );
};

export default StatsIcon;
