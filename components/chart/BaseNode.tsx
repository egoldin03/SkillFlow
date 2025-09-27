"use client";

import React, { useState } from "react";

interface BaseNodeProps {
  size?: number;
  difficulty?: number;
  className?: string;
  label?: string;
  image_path?: string;
  onClick?: () => void;
  onHover?: () => void;
  achieved?: boolean;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  size = 200,
  className = "",
  difficulty = 1,
  label = "",
  image_path = "",
  onClick = () => {},
  onHover = () => {},
  achieved = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getOpacity = () => {
    if (achieved) return 1;
    return isHovered ? 1 : 0.15;
  };

  return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 200 200"
          className={`${className} cursor-pointer`}
          onClick={onClick}
          onMouseEnter={() => {
            setIsHovered(true);
            onHover();
          }}
          onMouseLeave={() => setIsHovered(false)}
          style={{ 
            opacity: getOpacity(),
            transition: 'opacity 0.2s ease-in-out'
          }}
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