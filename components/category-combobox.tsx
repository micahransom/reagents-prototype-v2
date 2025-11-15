"use client";

import { useState, useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CategoryComboboxProps {
  value: string[]; // Selected categories
  onChange: (categories: string[]) => void;
  className?: string;
}

export default function CategoryCombobox({ value, onChange, className }: CategoryComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load available categories from all items
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        setAvailableCategories(categories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredCategories = availableCategories.filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !value.includes(cat)
  );

  const handleSelectCategory = (category: string) => {
    if (!value.includes(category)) {
      onChange([...value, category]);
    }
    setSearchQuery("");
  };

  const handleCreateNew = () => {
    if (searchQuery.trim() && !value.includes(searchQuery.trim())) {
      onChange([...value, searchQuery.trim()]);
      setSearchQuery("");
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    onChange(value.filter(cat => cat !== categoryToRemove));
  };

  const shouldShowCreateNew = searchQuery.trim() && 
    !availableCategories.some(cat => cat.toLowerCase() === searchQuery.toLowerCase()) &&
    !value.includes(searchQuery.trim());

  return (
    <div className={className} ref={dropdownRef}>
      <div className="flex flex-col gap-2">
        {/* Selected Categories as Badges */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((category) => (
              <Badge 
                key={category} 
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {category}
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(category)}
                  className="ml-1 hover:bg-slate-300 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Input Field */}
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={value.length === 0 ? "Type to search or create..." : "Add more categories..."}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full"
          />

          {/* Dropdown */}
          {isOpen && (searchQuery || filteredCategories.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-[300px] overflow-y-auto z-[9999]">
              <div className="p-1">
                {/* Create New Option */}
                {shouldShowCreateNew && (
                  <>
                    <button
                      type="button"
                      onClick={handleCreateNew}
                      className="w-full text-left px-2 py-1.5 hover:bg-slate-100 rounded-sm"
                    >
                      <p className="text-sm font-semibold text-slate-950">
                        Create &quot;{searchQuery}&quot;
                      </p>
                    </button>
                    
                    {filteredCategories.length > 0 && (
                      <div className="h-px bg-slate-300 my-1" />
                    )}
                  </>
                )}

                {/* Existing Categories */}
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleSelectCategory(category)}
                      className="w-full text-left px-2 py-1.5 text-sm text-slate-950 hover:bg-slate-100 rounded-md flex items-center justify-between"
                    >
                      <span>{category}</span>
                      {value.includes(category) && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))
                ) : (
                  !shouldShowCreateNew && (
                    <div className="px-2 py-2 text-xs text-slate-400">
                      No categories found
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

