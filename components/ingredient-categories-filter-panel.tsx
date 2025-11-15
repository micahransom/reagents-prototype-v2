"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export interface CategoryFilterOptions {
  minItems?: number;
  maxItems?: number;
}

interface CategoryFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: CategoryFilterOptions;
  onFiltersChange: (filters: CategoryFilterOptions) => void;
}

export function ItemCategoriesFilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
}: CategoryFilterPanelProps) {
  if (!isOpen) return null;

  const appliedFiltersCount =
    (filters.minItems !== undefined ? 1 : 0) +
    (filters.maxItems !== undefined ? 1 : 0);

  const clearAllFilters = () => {
    onFiltersChange({
      minItems: undefined,
      maxItems: undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-[500px] h-full bg-background shadow-[0px_20px_25px_-5px_rgba(2,6,23,0.1),0px_8px_10px_-6px_rgba(2,6,23,0.1)] rounded-l-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-none px-6 py-10 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-medium text-foreground">Filter</h2>
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center hover:bg-accent rounded transition-colors"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* Applied Filters */}
        <div className="flex-none px-6 pt-6 pb-4 border-b border-border">
          <div className="mb-3">
            <p className="text-sm font-medium text-foreground">Applied Filters</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center min-h-[20px]">
            {appliedFiltersCount === 0 ? (
              <p className="text-sm font-medium text-muted-foreground">
                No filters applied
              </p>
            ) : (
              <>
                {filters.minItems !== undefined && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() =>
                      onFiltersChange({ ...filters, minItems: undefined })
                    }
                  >
                    Min: {filters.minItems}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                {filters.maxItems !== undefined && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() =>
                      onFiltersChange({ ...filters, maxItems: undefined })
                    }
                  >
                    Max: {filters.maxItems}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                {appliedFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground underline ml-2"
                  >
                    Clear all
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Scrollable Filters */}
        <div className="flex-1 overflow-y-auto">
          <Accordion type="multiple" defaultValue={["itemCount"]}>
            {/* Item Count */}
            <AccordionItem value="itemCount">
              <AccordionTrigger>Number of Items</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="minItems"
                      className="text-sm font-medium text-foreground"
                    >
                      Minimum Items
                    </label>
                    <Input
                      id="minItems"
                      type="number"
                      min="0"
                      placeholder="e.g., 5"
                      value={filters.minItems ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        onFiltersChange({
                          ...filters,
                          minItems: value ? parseInt(value) : undefined,
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="maxItems"
                      className="text-sm font-medium text-foreground"
                    >
                      Maximum Items
                    </label>
                    <Input
                      id="maxItems"
                      type="number"
                      min="0"
                      placeholder="e.g., 20"
                      value={filters.maxItems ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        onFiltersChange({
                          ...filters,
                          maxItems: value ? parseInt(value) : undefined,
                        });
                      }}
                    />
                  </div>
                  <div className="pt-2 text-xs text-muted-foreground">
                    <p>Filter categories by the number of items they contain.</p>
                    <p className="mt-1">
                      Range: 6 - 33 items per category
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

