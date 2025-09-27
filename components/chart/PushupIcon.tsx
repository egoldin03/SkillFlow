import React from "react";

interface PushupIconProps {
  size?: number;
  className?: string;
}

export const PushupIcon: React.FC<PushupIconProps> = ({
  size = 200,
  className = "",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
    >
      {/* Outer circles */}
      <circle cx="100" cy="100" r="100" fill="#57CC04" />
      <circle cx="100" cy="100" r="85" fill="white" />
      <circle cx="100" cy="100" r="75" fill="#47A30B" />

      {/* Pushup figure from /public/pushup.svg */}
      <image href="/pushup.svg" x="50" y="50" width="100" height="100" />

      {/* Text label */}
      <text
        x="100"
        y="150"
        textAnchor="middle"
        fill="white"
        fontSize="16"
        fontFamily="Arial, sans-serif"
      >
        Pushup
      </text>
    </svg>
  );
};

export default PushupIcon;
