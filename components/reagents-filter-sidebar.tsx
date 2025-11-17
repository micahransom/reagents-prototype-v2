"use client";

import { useState, useEffect } from "react";
import { X, Search, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { getCategoriesWithCounts, CategoryWithCount } from "@/lib/mock-db/db-helpers";

interface ReagentsFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  editedBefore: Date | undefined;
  onEditedBeforeChange: (date: Date | undefined) => void;
  editedAfter: Date | undefined;
  onEditedAfterChange: (date: Date | undefined) => void;
}

export default function ReagentsFilterSidebar({
  isOpen,
  onClose,
  selectedCategories,
  onCategoriesChange,
  editedBefore,
  onEditedBeforeChange,
  editedAfter,
  onEditedAfterChange,
}: ReagentsFilterSidebarProps) {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const cats = await getCategoriesWithCounts();
      setCategories(cats);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleCategoryToggle = (categoryName: string) => {
    if (selectedCategories.includes(categoryName)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== categoryName));
    } else {
      onCategoriesChange([...selectedCategories, categoryName]);
    }
  };

  const handleRemoveCategory = (categoryName: string) => {
    onCategoriesChange(selectedCategories.filter((c) => c !== categoryName));
  };

  const handleClearDateBefore = () => {
    onEditedBeforeChange(undefined);
  };

  const handleClearDateAfter = () => {
    onEditedAfterChange(undefined);
  };

  const hasActiveFilters = 
    selectedCategories.length > 0 || 
    editedBefore !== undefined || 
    editedAfter !== undefined;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[520px] bg-white border-l border-border shadow-xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="flex flex-col gap-6 py-10">
          {/* Header */}
          <div className="flex flex-col gap-2.5 px-6">
          <div className="flex items-center justify-between h-8">
            <h2 className="text-2xl font-medium text-foreground">
              Filter
            </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-accent rounded-sm transition-colors"
              >
                <X className="w-6 h-6 text-foreground" />
              </button>
            </div>
          </div>

          {/* Applied Filters */}
          {hasActiveFilters && (
            <div className="flex flex-col gap-4 px-6">
              <p className="text-sm font-medium text-foreground">
                Applied Filters
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="gap-1 px-2 py-1 h-9 text-xs font-semibold"
                  >
                    <button
                      onClick={() => handleRemoveCategory(category)}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {category}
                  </Badge>
                ))}
                {editedBefore && (
                  <Badge
                    variant="secondary"
                    className="gap-1 px-2 py-1 h-9 text-xs font-semibold"
                  >
                    <button
                      onClick={handleClearDateBefore}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    Before {editedBefore.toLocaleDateString()}
                  </Badge>
                )}
                {editedAfter && (
                  <Badge
                    variant="secondary"
                    className="gap-1 px-2 py-1 h-9 text-xs font-semibold"
                  >
                    <button
                      onClick={handleClearDateAfter}
                      className="hover:opacity-70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    After {editedAfter.toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Accordion Sections */}
          <Accordion type="multiple" defaultValue={["categories", "dates"]}>
            {/* Categories */}
            <AccordionItem value="categories">
              <AccordionTrigger>Categories</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-9 h-9"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                    />
                  </div>

                  {/* Category List */}
                  <div className="flex flex-col gap-3">
                    {loadingCategories ? (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : filteredCategories.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No categories found</p>
                    ) : (
                      filteredCategories.map((category) => (
                        <div key={category.name} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedCategories.includes(category.name)}
                            onCheckedChange={() => handleCategoryToggle(category.name)}
                          />
                          <Badge
                            variant="secondary"
                            className="text-xs font-semibold"
                          >
                            {category.name}
                          </Badge>
                          <span className="text-xs font-semibold text-foreground">
                            ({category.count})
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Last Edited */}
            <AccordionItem value="dates">
              <AccordionTrigger>Last Edited</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4">
                  {/* Edited Before */}
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-foreground px-1">
                      Edited Before
                    </label>
                    <DatePicker
                      value={editedBefore}
                      onChange={onEditedBeforeChange}
                      placeholder="Pick a date"
                    />
                  </div>

                  {/* Edited After */}
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-medium text-foreground px-1">
                      Edited After
                    </label>
                    <DatePicker
                      value={editedAfter}
                      onChange={onEditedAfterChange}
                      placeholder="Pick a date"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
}

