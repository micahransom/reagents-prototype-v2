"use client";

import { useEffect, useState, useMemo } from "react";
import { Item } from "@/lib/types";
import { getAllCategories, getItemsByCategory } from "@/lib/mock-db/db-helpers";
import { TagInput } from "@/components/ui/tag-input";

interface TagOption {
  id: string;
  label: string;
}

interface IngredientSelectProps {
  categoryIds?: string[];
  selectedIngredients?: TagOption[];
  onIngredientsChange?: (items: TagOption[]) => void;
  placeholder?: string;
  inputClassName?: string;
  allowCreate?: boolean;
}

export function IngredientSelect({
  categoryIds,
  selectedIngredients = [],
  onIngredientsChange,
  placeholder = "Type to search ingredients...",
  inputClassName,
  allowCreate = false,
}: IngredientSelectProps) {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const cats = await getAllCategories();

        const targetCategories = categoryIds 
          ? cats.filter(c => categoryIds.includes(c.id))
          : cats;

        const itemsPromises = targetCategories.map(cat => 
          getItemsByCategory(cat.id)
        );
        const itemsArrays = await Promise.all(itemsPromises);
        const items = itemsArrays.flat();
        
        setAllItems(items);
      } catch (error) {
        console.error("Error loading ingredients:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [categoryIds]);

  const suggestions = useMemo(() => {
    if (loading) return [];
    
    return allItems.map(item => {
      // Item name is stored in formData._itemName
      const label = item.formData._itemName || item.id;
      
      return {
        id: item.id,
        label,
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [allItems, loading]);

  return (
    <TagInput
      suggestions={suggestions}
      selectedTags={selectedIngredients}
      onTagsChange={onIngredientsChange}
      placeholder={loading ? "Loading ingredients..." : placeholder}
      inputClassName={inputClassName}
      allowCreate={allowCreate}
    />
  );
}
