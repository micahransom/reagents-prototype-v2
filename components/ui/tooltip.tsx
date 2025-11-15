"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
  trigger?: "hover" | "click";
}

export function Tooltip({ children, content, side = "top", className, trigger = "click" }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const handleClick = () => {
    if (trigger === "click") {
      setIsVisible(!isVisible);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") {
      setIsVisible(false);
    }
  };

  // Close tooltip when clicking outside
  React.useEffect(() => {
    if (trigger === "click" && isVisible) {
      const handleClickOutside = () => setIsVisible(false);
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [trigger, isVisible]);

  return (
    <div
      className={cn("relative inline-block", className)}
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm whitespace-nowrap pointer-events-none",
            sideClasses[side]
          )}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              "absolute w-2 h-2 bg-gray-900 rotate-45",
              side === "top" && "bottom-[-4px] left-1/2 -translate-x-1/2",
              side === "bottom" && "top-[-4px] left-1/2 -translate-x-1/2",
              side === "left" && "right-[-4px] top-1/2 -translate-y-1/2",
              side === "right" && "left-[-4px] top-1/2 -translate-y-1/2"
            )}
          />
        </div>
      )}
    </div>
  );
}

