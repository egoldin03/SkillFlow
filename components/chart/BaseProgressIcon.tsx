import React from "react";

interface BaseProgressIconProps {
  size?: number;
  progress?: number; // Progress value from 0 to 100
  total?: number;

  className?: string;
  image_path?: string;
  label?: string;
}

export const BaseProgressIcon: React.FC<BaseProgressIconProps> = ({
  size = 200,
  progress = 75, // Default to 75% progress as shown in the image
  total = 100,
  className = "",
  image_path = "",
  label = "",
}) => {
  const radius = 85;
  const strokeWidth = 10;
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
    >
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
      <image href={image_path} x="55" y="60" width="80" height="80" />

      {/* label text */}
      <text
        x="100"
        y="142"
        textAnchor="middle"
        fill="white"
        fontSize="18"
        fontFamily="Arial, sans-serif"
        fontWeight="500"
      >
        {label}
      </text>

      {/* progress text */}
      <text
        x="100"
        y="70"
        textAnchor="middle"
        fill="white"
        fontSize="18"
        fontFamily="Arial, sans-serif"
        fontWeight="500"
      >
        {progress}/{total}
      </text>
    </svg>
  );
};

export default BaseProgressIcon;
