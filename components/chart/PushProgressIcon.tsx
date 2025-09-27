import React from "react";

interface PushProgressIconProps {
  size?: number;
  progress?: number; // Progress value from 0 to 100
  className?: string;
}

export const PushProgressIcon: React.FC<PushProgressIconProps> = ({
  size = 200,
  progress = 75, // Default to 75% progress as shown in the image
  className = "",
}) => {
  const radius = 85;
  const strokeWidth = 5;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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

      {/* Background progress circle (dark) */}
      <circle
        cx="100"
        cy="100"
        r={normalizedRadius}
        stroke="#2d3748"
        strokeWidth={strokeWidth}
        fill="transparent"
      />

      {/* Progress circle (cyan/blue) */}
      <circle
        cx="100"
        cy="100"
        r={normalizedRadius}
        stroke="#00bcd4"
        strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        transform="rotate(-90 100 100)"
      />

      {/* Pushup stick figure */}
      {/* Pushup figure from /public/pushup.svg */}
      <image href="/pushup.svg" x="50" y="50" width="100" height="100" />

      {/* "Push" text */}
      <text
        x="100"
        y="165"
        textAnchor="middle"
        fill="white"
        fontSize="18"
        fontFamily="Arial, sans-serif"
        fontWeight="500"
      >
        Push
      </text>
    </svg>
  );
};

export default PushProgressIcon;
