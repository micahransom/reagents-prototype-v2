"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
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
            "h-4 w-4 shrink-0 rounded-[4px] border border-input bg-background ring-offset-background",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "peer-checked:bg-primary peer-checked:border-primary peer-checked:text-primary-foreground",
            "flex items-center justify-center transition-colors cursor-pointer",
            className
          )}
        >
          {checked && <Check className="h-3 w-3 stroke-[3px] text-primary-foreground" />}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };

