// Database helpers - Now using API routes
import { Item, ItemType } from "@/lib/types";

const API_BASE = '/api';

// ============================================================================
// ITEM CRUD OPERATIONS
// ============================================================================

export interface ItemFilters {
  type?: ItemType;
  categories?: string[];
  search?: string;
  dateAfter?: string;
  dateBefore?: string;
}

export async function getAllItems(filters?: ItemFilters): Promise<Item[]> {
  const params = new URLSearchParams();
  
  if (filters?.type) {
    params.append('type', filters.type);
  }
  if (filters?.categories && filters.categories.length > 0) {
    params.append('categories', filters.categories.join(','));
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }
  if (filters?.dateAfter) {
    params.append('dateAfter', filters.dateAfter);
  }
  if (filters?.dateBefore) {
    params.append('dateBefore', filters.dateBefore);
  }
  
  const url = params.toString() ? `${API_BASE}/items?${params}` : `${API_BASE}/items`;
  
  const response = await fetch(url, {
    cache: 'no-store',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  
  return response.json();
}

export async function getItemById(id: string): Promise<Item | null> {
  const response = await fetch(`${API_BASE}/items/${id}`, {
    cache: 'no-store',
  });
  
  if (response.status === 404) {
    return null;
  }
  
  if (!response.ok) {
    throw new Error('Failed to fetch item');
  }
  
  return response.json();
}

export async function createItem(item: Omit<Item, "id" | "createdAt" | "updatedAt" | "timesReferenced">): Promise<Item> {
  const response = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create item');
  }
  
  return response.json();
}

export async function createMultipleItems(items: Omit<Item, "id" | "createdAt" | "updatedAt" | "timesReferenced">[]): Promise<Item[]> {
  const response = await fetch(`${API_BASE}/items/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create items');
  }
  
  return response.json();
}

export async function updateItem(id: string, updates: Partial<Omit<Item, "id" | "createdAt">>): Promise<Item> {
  const response = await fetch(`${API_BASE}/items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update item');
  }
  
  return response.json();
}

export async function deleteItem(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/items/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete item');
  }
  
  return true;
}

// ============================================================================
// CATEGORY HELPERS
// ============================================================================

export async function getUniqueCategoriesFromItems(): Promise<string[]> {
  const items = await getAllItems();
  const categoriesSet = new Set<string>();
  
  items.forEach(item => {
    item.categories.forEach(category => {
      categoriesSet.add(category);
    });
  });
  
  return Array.from(categoriesSet).sort();
}

export interface CategoryWithCount {
  name: string;
  count: number;
}

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const items = await getAllItems();
  const categoryCounts = new Map<string, number>();
  
  items.forEach(item => {
    item.categories.forEach(category => {
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    });
  });
  
  return Array.from(categoryCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ============================================================================
// BASE REAGENT HELPERS (for composite reagent selection)
// ============================================================================

export async function getBaseReagents(): Promise<Item[]> {
  return getAllItems({ type: 'BASE_REAGENT' });
}

// ============================================================================
// THERMOCYCLER MODELS
// ============================================================================

export const THERMOCYCLER_MODELS = [
  'Oscar',
  'Quant Studio',
] as const;

export type ThermocyclerModel = typeof THERMOCYCLER_MODELS[number];
