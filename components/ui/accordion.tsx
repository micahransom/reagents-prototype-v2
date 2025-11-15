"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  openItems: string[];
  toggleItem: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue>({
  openItems: [],
  toggleItem: () => {},
});

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple";
  defaultValue?: string | string[];
  children: React.ReactNode;
}

export function Accordion({
  type = "multiple",
  defaultValue = [],
  children,
  className,
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>(
    Array.isArray(defaultValue) ? defaultValue : defaultValue ? [defaultValue] : []
  );

  const toggleItem = React.useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        if (type === "single") {
          return prev.includes(value) ? [] : [value];
        }
        return prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value];
      });
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ openItems, toggleItem }}>
      <div className={cn("", className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
}

export function AccordionItem({ value, children, className, ...props }: AccordionItemProps) {
  return (
    <div className={cn("border-b border-border", className)} {...props}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { value })
          : child
      )}
    </div>
  );
}

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value?: string;
  children: React.ReactNode;
}

export function AccordionTrigger({
  value = "",
  children,
  className,
  ...props
}: AccordionTriggerProps) {
  const { openItems, toggleItem } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between px-6 py-4 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors",
        className
      )}
      onClick={() => toggleItem(value)}
      {...props}
    >
      <span className="flex-1 text-left">{children}</span>
      <ChevronDown
        className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
}

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  children: React.ReactNode;
}

export function AccordionContent({
  value = "",
  children,
  className,
  ...props
}: AccordionContentProps) {
  const { openItems } = React.useContext(AccordionContext);
  const isOpen = openItems.includes(value);

  if (!isOpen) return null;

  return (
    <div className={cn("px-6 py-4 bg-background", className)} {...props}>
      {children}
    </div>
  );
}

