"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, checked, onCheckedChange, onChange, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    React.useImperativeHandle(ref, () => inputRef.current!);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    const handleClick = () => {
      inputRef.current?.click();
    };

    return (
      <div className="relative inline-flex">
        <input
          type="checkbox"
          className="peer sr-only"
          ref={inputRef}
          checked={checked}
          onChange={handleChange}
          {...props}
        />
        <div
          onClick={handleClick}
          className={cn(
            "h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "peer-checked:bg-primary",
            "bg-input cursor-pointer",
            className
          )}
        >
          <div
            className={cn(
              "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
              checked ? "translate-x-4" : "translate-x-0"
            )}
          />
        </div>
      </div>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };

