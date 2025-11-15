// Type definitions for the reagents system

export type ItemType = 'BASE_REAGENT' | 'COMPOSITE_REAGENT' | 'THERMOCYCLER';

export interface ReagentRow {
  reagentId: string;  // reference to base reagent Item
  lotNumber?: string;
  concentration?: string;
  volume?: string;
  notes?: string;
}

// Internal UI state for managing reagent rows (includes temporary ID)
export interface ReagentRowWithId extends ReagentRow {
  id: string;
}

export interface Item {
  id: string;
  type: ItemType;
  name: string;
  categories: string[];  // array of category names
  timesReferenced: number;
  
  // Type-specific fields
  lotNumber?: string;  // composite reagents only
  reagents?: ReagentRow[];  // composite reagents only
  instrumentId?: string;  // thermocyclers only
  model?: string;  // thermocyclers only
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  items: Item[];
}

