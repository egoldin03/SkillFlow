"use client";

import React from "react";

interface BaseNodeProps {
  size?: number;
  className?: string;
  label?: string;
  image_path?: string;
  onClick?: () => void;
  onHover?: () => void;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  size = 200,
  className = "cursor-pointer",
  label = "",
  image_path = "",
  onClick = () => {},
  onHover = () => {},
}) => {
    return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          className={className}
          onClick={onClick}
        >
          {/* Outer circles */}
          <circle cx="100" cy="100" r="100" fill="#57CC04" />
          <circle cx="100" cy="100" r="90" fill="white" />
          <circle cx="100" cy="100" r="80" fill="#47A30B" />
    
          {/* Pushup figure from /public/pushup.svg */}
          <image href={image_path} x="50" y="30" width="100" height="100" />
    
          {/* Text label */}
          <text
            x="100"
            y="150"
            textAnchor="middle"
            fill="white"
            fontSize="24"
            fontFamily="Arial, sans-serif"
          >
            {label}
          </text>
        </svg>
      );
};

export default BaseNode;