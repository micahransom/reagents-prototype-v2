"use client";

import * as React from "react";
import { X, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export interface AnalysisFilterOptions {
  targets: string[];
  items: string[];
  editedBefore?: Date;
  editedAfter?: Date;
}

interface AnalysisFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AnalysisFilterOptions;
  onFiltersChange: (filters: AnalysisFilterOptions) => void;
  availableTargets: Array<{ name: string; count: number }>;
  availableItems: Array<{ name: string; count: number }>;
}

export function AnalysisFilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableTargets,
  availableItems,
}: AnalysisFilterPanelProps) {
  const [targetSearch, setTargetSearch] = React.useState("");
  const [itemSearch, setItemSearch] = React.useState("");

  if (!isOpen) return null;

  const filteredTargets = availableTargets.filter((target) =>
    target.name.toLowerCase().includes(targetSearch.toLowerCase())
  );

  const filteredItems = availableItems
    .filter((item) => item.count > 0)
    .filter((item) =>
      item.name.toLowerCase().includes(itemSearch.toLowerCase())
    );

  const toggleTarget = (target: string) => {
    const newTargets = filters.targets.includes(target)
      ? filters.targets.filter((t) => t !== target)
      : [...filters.targets, target];
    onFiltersChange({ ...filters, targets: newTargets });
  };

  const toggleItem = (item: string) => {
    const newItems = filters.items.includes(item)
      ? filters.items.filter((i) => i !== item)
      : [...filters.items, item];
    onFiltersChange({ ...filters, items: newItems });
  };

  const appliedFiltersCount =
    filters.targets.length +
    filters.items.length +
    (filters.editedBefore ? 1 : 0) +
    (filters.editedAfter ? 1 : 0);

  const clearAllFilters = () => {
    onFiltersChange({
      targets: [],
      items: [],
      editedBefore: undefined,
      editedAfter: undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-[500px] h-full bg-background border border-border rounded-l-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-none px-6 py-10 border-b border-border">
          <div className="flex items-center justify-between">
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
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground">Applied Filters</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center min-h-[20px]">
            {appliedFiltersCount === 0 ? (
              <p className="text-sm font-medium text-muted-foreground">
                No filters applied
              </p>
            ) : (
              <>
                {filters.targets.map((target) => (
                  <Badge
                    key={target}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 h-9 gap-1 px-2"
                    onClick={() => toggleTarget(target)}
                  >
                    <X className="w-3 h-3" />
                    {target}
                  </Badge>
                ))}
                {filters.items.map((item) => (
                  <Badge
                    key={item}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 h-9 gap-1 px-2"
                    onClick={() => toggleItem(item)}
                  >
                    <X className="w-3 h-3" />
                    {item}
                  </Badge>
                ))}
                {(filters.editedBefore || filters.editedAfter) && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 h-9 gap-1 px-2"
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        editedBefore: undefined,
                        editedAfter: undefined,
                      })
                    }
                  >
                    <X className="w-3 h-3" />
                    Date Range
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
          <Accordion type="multiple" defaultValue={["target", "lastEdited"]}>
            {/* Target */}
            <AccordionItem value="target">
              <AccordionTrigger>Target</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      value={targetSearch}
                      onChange={(e) => setTargetSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Target List */}
                  <div className="space-y-3">
                    {filteredTargets.map((target) => (
                      <div key={target.name} className="flex items-center gap-2">
                        <Checkbox
                          id={`target-${target.name}`}
                          checked={filters.targets.includes(target.name)}
                          onCheckedChange={() => toggleTarget(target.name)}
                        />
                        <label
                          htmlFor={`target-${target.name}`}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <Badge variant="secondary">{target.name}</Badge>
                          <span className="text-xs font-semibold text-foreground">
                            ({target.count})
                          </span>
                        </label>
                      </div>
                    ))}
                    {filteredTargets.length === 0 && (
                      <p className="text-sm text-muted-foreground">No targets found</p>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Items */}
            <AccordionItem value="items">
              <AccordionTrigger>Items</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    {filteredItems.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <Checkbox
                          id={`item-${item.name}`}
                          checked={filters.items.includes(item.name)}
                          onCheckedChange={() => toggleItem(item.name)}
                        />
                        <label
                          htmlFor={`item-${item.name}`}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <Badge variant="secondary">{item.name}</Badge>
                          <span className="text-xs font-semibold text-foreground">
                            ({item.count})
                          </span>
                        </label>
                      </div>
                    ))}
                    {filteredItems.length === 0 && (
                      <p className="text-sm text-muted-foreground">No items found</p>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Last Edited */}
            <AccordionItem value="lastEdited">
              <AccordionTrigger>Last Edited</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Edited Before</label>
                    <DatePicker
                      placeholder="Select date"
                      value={filters.editedBefore}
                      onChange={(date) =>
                        onFiltersChange({ ...filters, editedBefore: date })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Edited After</label>
                    <DatePicker
                      placeholder="Select date"
                      value={filters.editedAfter}
                      onChange={(date) =>
                        onFiltersChange({ ...filters, editedAfter: date })
                      }
                    />
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

