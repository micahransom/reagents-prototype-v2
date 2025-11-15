# Item Database

This directory contains a centralized database of all items used throughout the prototype.

## Data File

**`item-data.ts`** - Central source of truth for all item data

## Structure

The database includes 10 categories with 6-33 items each:

- **Buffer** (8 items) - pH buffers and solutions
- **Enzyme** (10 items) - DNA/RNA polymerases and enzymes
- **Oligonucleotide** (33 items) - Primers and probes
- **Preservatives** (6 items) - Antimicrobial agents
- **Primer Probe Pair** (10 items) - Paired primers with probes
- **Protocol** (8 items) - Experimental procedures
- **Salt** (8 items) - Ionic compounds
- **Stabilizers** (9 items) - Protein and sample stabilizers
- **Target** (10 items) - Detection targets (viral/bacterial)
- **Thermocycler** (8 items) - PCR instruments

## Usage Examples

### Import the data

```typescript
import { 
  buffers, 
  enzymes, 
  targets,
  getItemsByCategory,
  getItemOptions,
  getItemNames 
} from "@/lib/item-data";
```

### Get all items in a category

```typescript
const allBuffers = getItemsByCategory("buffer");
const allEnzymes = getItemsByCategory("enzyme");
```

### Get dropdown options (id + name pairs)

```typescript
const bufferOptions = getItemOptions("buffer");
// Returns: [{ id: "1", name: "Tris-HCl pH 8.0" }, ...]
```

### Get just the names for simple dropdowns

```typescript
const bufferNames = getItemNames("buffer");
// Returns: ["Tris-HCl pH 8.0", "PBS pH 7.4", ...]
```

### Find specific item by ID

```typescript
import { getItemById } from "@/lib/item-data";

const buffer = getItemById("buffer", "1");
// Returns: { id: "1", name: "Tris-HCl pH 8.0", ... }
```

### Search items

```typescript
import { searchItems } from "@/lib/item-data";

const results = searchItems("buffer", "tris");
// Returns all buffers containing "tris" in the name
```

## Item Selector Components

### ItemSelect Component

Use the provided `ItemSelect` component for multi-select with tags:

```typescript
import { ItemSelect } from "@/components/item-select";

interface TagOption {
  id: string;
  label: string;
}

// In your component
const [selectedItems, setSelectedItems] = useState<TagOption[]>([]);

<ItemSelect
  categoryIds={["cat-123-abc"]} // Optional: specific categories, or omit to load all
  selectedItems={selectedItems}
  onItemsChange={setSelectedItems}
  placeholder="Type to search items..."
  allowCreate={false}
/>
```

### IngredientSelect Component

Use the `IngredientSelect` component for ingredient selection:

```typescript
import { IngredientSelect } from "@/components/ingredient-select";

// In your component
const [selectedIngredients, setSelectedIngredients] = useState<TagOption[]>([]);

<IngredientSelect
  categoryIds={["cat-456-def"]} // Optional: specific categories, or omit to load all
  selectedIngredients={selectedIngredients}
  onIngredientsChange={setSelectedIngredients}
  placeholder="Type to search ingredients..."
  allowCreate={false}
/>
```

Both components use a tag-based interface that allows:
- Multiple selection
- Search/filter by typing
- Display selected items as removable tags
- Optional category filtering

## Available Categories

```typescript
type ItemCategory = 
  | "buffer" 
  | "enzyme" 
  | "oligonucleotide" 
  | "preservatives" 
  | "primer-probe-pair" 
  | "protocol" 
  | "salt" 
  | "stabilizers" 
  | "target" 
  | "thermocycler";
```

## Adding New Items

To add new items, edit `lib/item-data.ts` and add entries to the appropriate array:

```typescript
export const buffers: Buffer[] = [
  // ... existing buffers
  { 
    id: "9", 
    name: "New Buffer", 
    concentration: "50 mM", 
    ph: "7.0", 
    storage: "4°C", 
    lastEdited: "September 1, 2025" 
  },
];
```

The data will automatically propagate to:
- Listing pages
- Detail pages
- All dropdowns throughout the app

