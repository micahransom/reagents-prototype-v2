"use client";

import { useEffect, useState, useMemo } from "react";
import { Item } from "@/lib/types";
import { getAllItems } from "@/lib/mock-db/db-helpers";
import { TagInput } from "@/components/ui/tag-input";

interface TagOption {
  id: string;
  label: string;
}

interface ItemSelectProps {
  categoryIds?: string[];
  selectedItems?: TagOption[];
  onItemsChange?: (items: TagOption[]) => void;
  placeholder?: string;
  allowCreate?: boolean;
}

export function ItemSelect({
  categoryIds,
  selectedItems = [],
  onItemsChange,
  placeholder = "Type to search items...",
  allowCreate = false,
}: ItemSelectProps) {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Get all items, optionally filtered by category
        const allItemsData = await getAllItems();
        
        // Filter by categories if specified
        const items = categoryIds && categoryIds.length > 0
          ? allItemsData.filter(item => 
              item.categories.some(cat => categoryIds.includes(cat))
            )
          : allItemsData;
        
        setAllItems(items);
      } catch (error) {
        console.error("Error loading items:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [categoryIds]);

  const suggestions = useMemo(() => {
    if (loading) return [];
    
    return allItems.map(item => {
      return {
        id: item.id,
        label: item.name,
      };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }, [allItems, loading]);

  return (
    <TagInput
      suggestions={suggestions}
      selectedTags={selectedItems}
      onTagsChange={onItemsChange}
      placeholder={loading ? "Loading items..." : placeholder}
      allowCreate={allowCreate}
    />
  );
}
