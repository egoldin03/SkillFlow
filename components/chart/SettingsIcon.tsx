"use client";

import React from "react";
import Image from "next/image";

interface SettingsIconProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const SettingsIcon: React.FC<SettingsIconProps> = ({
  size = 200,
  className = "cursor-pointer",
  onClick,
}) => {
  return (
    <Image
      src="/settings.svg"
      alt="Settings"
      width={size}
      height={size}
      className={className}
      onClick={onClick}
    />
  );
};

export default SettingsIcon;
