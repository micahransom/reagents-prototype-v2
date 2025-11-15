"use client";

import * as React from "react";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export interface ItemFilterOptions {
  categories: string[];
  storageConditions: string[];
  editedBefore?: Date;
  editedAfter?: Date;
}

interface ItemFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ItemFilterOptions;
  onFiltersChange: (filters: ItemFilterOptions) => void;
  availableCategories: Array<{ name: string; count: number }>;
  availableStorageConditions: Array<{ name: string; count: number }>;
}

export function ItemsFilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableCategories,
  availableStorageConditions,
}: ItemFilterPanelProps) {
  const [categorySearch, setCategorySearch] = React.useState("");
  const [storageSearch, setStorageSearch] = React.useState("");

  if (!isOpen) return null;

  const filteredCategories = availableCategories
    .filter((cat) => cat.count > 0)
    .filter((cat) =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

  const filteredStorageConditions = availableStorageConditions
    .filter((storage) => storage.count > 0)
    .filter((storage) =>
      storage.name.toLowerCase().includes(storageSearch.toLowerCase())
    );

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const toggleStorageCondition = (storage: string) => {
    const newStorage = filters.storageConditions.includes(storage)
      ? filters.storageConditions.filter((s) => s !== storage)
      : [...filters.storageConditions, storage];
    onFiltersChange({ ...filters, storageConditions: newStorage });
  };

  const appliedFiltersCount =
    filters.categories.length +
    filters.storageConditions.length +
    (filters.editedBefore ? 1 : 0) +
    (filters.editedAfter ? 1 : 0);

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      storageConditions: [],
      editedBefore: undefined,
      editedAfter: undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

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
                {filters.categories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => toggleCategory(category)}
                  >
                    {category}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {filters.storageConditions.map((storage) => (
                  <Badge
                    key={storage}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => toggleStorageCondition(storage)}
                  >
                    {storage}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {(filters.editedBefore || filters.editedAfter) && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        editedBefore: undefined,
                        editedAfter: undefined,
                      })
                    }
                  >
                    Date Range
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
          <Accordion type="multiple" defaultValue={["category", "lastEdited"]}>
            {/* Category */}
            <AccordionItem value="category">
              <AccordionTrigger>Category</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Category List */}
                  <div className="space-y-3">
                    {filteredCategories.map((category) => (
                      <div key={category.name} className="flex items-center gap-2">
                        <Checkbox
                          id={`category-${category.name}`}
                          checked={filters.categories.includes(category.name)}
                          onCheckedChange={() => toggleCategory(category.name)}
                        />
                        <label
                          htmlFor={`category-${category.name}`}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <Badge variant="secondary">{category.name}</Badge>
                          <span className="text-xs font-semibold text-foreground">
                            ({category.count})
                          </span>
                        </label>
                      </div>
                    ))}
                    {filteredCategories.length === 0 && (
                      <p className="text-sm text-muted-foreground">No categories found</p>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Storage Conditions */}
            <AccordionItem value="storage">
              <AccordionTrigger>Storage Conditions</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      value={storageSearch}
                      onChange={(e) => setStorageSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Storage List */}
                  <div className="space-y-3">
                    {filteredStorageConditions.map((storage) => (
                      <div key={storage.name} className="flex items-center gap-2">
                        <Checkbox
                          id={`storage-${storage.name}`}
                          checked={filters.storageConditions.includes(storage.name)}
                          onCheckedChange={() => toggleStorageCondition(storage.name)}
                        />
                        <label
                          htmlFor={`storage-${storage.name}`}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <Badge variant="secondary">{storage.name}</Badge>
                          <span className="text-xs font-semibold text-foreground">
                            ({storage.count})
                          </span>
                        </label>
                      </div>
                    ))}
                    {filteredStorageConditions.length === 0 && (
                      <p className="text-sm text-muted-foreground">No storage conditions found</p>
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

