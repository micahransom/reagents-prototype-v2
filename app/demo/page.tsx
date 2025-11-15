"use client";

import { useState, useEffect } from "react";
import { TagInput } from "@/components/ui/tag-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { CircleUser, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ItemSelect } from "@/components/item-select";
import { IngredientSelect } from "@/components/ingredient-select";

const ingredientSuggestions = [
  { id: "1", label: "12X Alinity Buffer" },
  { id: "2", label: "1 M Tris-HCl" },
  { id: "3", label: "1% SDS" },
  { id: "4", label: "1-Butanol" },
  { id: "5", label: "1-Propanol" },
  { id: "6", label: "Brij-58" },
  { id: "7", label: "Proclin 950" },
  { id: "8", label: "dNTPs" },
  { id: "9", label: "Dextran" },
  { id: "10", label: "KCl" },
  { id: "11", label: "NaCl" },
  { id: "12", label: "MgCl2" },
];

const targetSuggestions = [
  { id: "t1", label: "Trichomoniasis", count: 4 },
  { id: "t2", label: "Strep A", count: 12 },
  { id: "t3", label: "RSV A", count: 8 },
  { id: "t4", label: "RSV B", count: 6 },
  { id: "t5", label: "Influenza A", count: 15 },
  { id: "t6", label: "Influenza B", count: 10 },
];

interface TagOption {
  id: string;
  label: string;
  count?: number;
}

interface TableRowData {
  id: string;
  ingredients: TagOption[];
  concentration: string;
  unit: string;
  lotNumber: string;
}

export default function TagInputDemo() {
  const [ingredientTags, setIngredientTags] = useState<TagOption[]>([]);
  const [targetTags, setTargetTags] = useState<TagOption[]>([
    { id: "t1", label: "Trichomoniasis", count: 4 }
  ]);
  
  // For database-backed selectors
  const [selectedItems, setSelectedItems] = useState<TagOption[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<TagOption[]>([]);

  // Table data
  const [tableRows, setTableRows] = useState<TableRowData[]>([
    { id: "row-1", ingredients: [], concentration: "100", unit: "mM", lotNumber: "" },
    { id: "row-2", ingredients: [], concentration: "0.05", unit: "%", lotNumber: "" },
    { id: "row-3", ingredients: [], concentration: "0.75", unit: "mM", lotNumber: "" },
  ]);

  // Available concentration units
  const concentrationUnits = ["X", "mM", "%", "ng", "μM", "mg/mL", "μg/mL"];

  // Track which unit dropdown is open
  const [openUnitDropdown, setOpenUnitDropdown] = useState<string | null>(null);

  const updateRowIngredients = (rowId: string, tags: TagOption[]) => {
    setTableRows(rows =>
      rows.map(row =>
        row.id === rowId ? { ...row, ingredients: tags } : row
      )
    );
  };

  const updateRowConcentration = (rowId: string, concentration: string) => {
    setTableRows(rows =>
      rows.map(row =>
        row.id === rowId ? { ...row, concentration } : row
      )
    );
  };

  const updateRowUnit = (rowId: string, unit: string) => {
    setTableRows(rows =>
      rows.map(row =>
        row.id === rowId ? { ...row, unit } : row
      )
    );
    setOpenUnitDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openUnitDropdown) {
        setOpenUnitDropdown(null);
      }
    };

    if (openUnitDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openUnitDropdown]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-6">
            <Link href="/">
              <div className="w-6 h-3 bg-foreground rounded-sm" />
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/">
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </span>
              </Link>
              <Link href="/experiments">
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Experiments
                </span>
              </Link>
              <Link href="/reagents">
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Reagents
                </span>
              </Link>
              <span className="text-sm font-medium text-foreground">
                Tag Input Demo
              </span>
            </div>
          </div>
          <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shadow-sm">
            <CircleUser className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="bg-background flex flex-col items-center px-8 py-16 gap-12">
        <div className="w-[600px] flex flex-col gap-12">
          <div>
            <h1 className="text-5xl font-bold text-accent-foreground leading-none mb-6">
              Tag Input Component Demo
            </h1>
            <p className="text-base text-muted-foreground">
              Notion-style typeahead that converts selections into tags
            </p>
          </div>

          {/* Example 1: Ingredients */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-foreground">Add Ingredients</h2>
            <p className="text-sm text-muted-foreground">
              Type to search ingredients or create new ones
            </p>
            <TagInput
              suggestions={ingredientSuggestions}
              selectedTags={ingredientTags}
              onTagsChange={setIngredientTags}
              placeholder="Type ingredient name..."
              allowCreate={true}
            />
          </div>

          {/* Example 2: Targets with Counts */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-foreground">Select Targets</h2>
            <p className="text-sm text-muted-foreground">
              Tags can include counts (e.g., number of associated primers)
            </p>
            <TagInput
              suggestions={targetSuggestions}
              selectedTags={targetTags}
              onTagsChange={setTargetTags}
              placeholder="Type target name..."
              allowCreate={false}
            />
          </div>

          {/* Example 2.5: Database Items Selector */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-foreground">Select Items from Database</h2>
            <p className="text-sm text-muted-foreground">
              ItemSelect component loads items from all categories or specific ones
            </p>
            <ItemSelect
              selectedItems={selectedItems}
              onItemsChange={setSelectedItems}
              placeholder="Type to search items from database..."
              allowCreate={false}
            />
          </div>

          {/* Example 2.6: Database Ingredients Selector */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-foreground">Select Ingredients from Database</h2>
            <p className="text-sm text-muted-foreground">
              IngredientSelect component with the same functionality for ingredients
            </p>
            <IngredientSelect
              selectedIngredients={selectedIngredients}
              onIngredientsChange={setSelectedIngredients}
              placeholder="Type to search ingredients from database..."
              allowCreate={true}
            />
          </div>

          {/* Example 3: Table with Tag Input */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Ingredients Table</h2>
              <Button variant="outline" size="sm">
                Expand
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              The concentration column includes an inline text input with a unit dropdown selector
            </p>

            <div className="bg-white border rounded-lg min-w-[356px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient Name</TableHead>
                    <TableHead>Final Concentration</TableHead>
                    <TableHead>Lot Number (optional)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="min-w-[200px]">
                        <TagInput
                          suggestions={ingredientSuggestions}
                          selectedTags={row.ingredients}
                          onTagsChange={(tags) => updateRowIngredients(row.id, tags)}
                          placeholder="Type ingredient..."
                          allowCreate={true}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={row.concentration}
                            onChange={(e) => updateRowConcentration(row.id, e.target.value)}
                            placeholder="0"
                            className="flex-1 min-w-0 text-sm text-foreground bg-transparent border-none outline-none focus:outline-none"
                          />
                          <div className="relative">
                            <button
                              onClick={() => setOpenUnitDropdown(openUnitDropdown === row.id ? null : row.id)}
                              className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-secondary-foreground bg-secondary border border-transparent rounded-md hover:bg-secondary/80 transition-colors"
                            >
                              {row.unit}
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            {openUnitDropdown === row.id && (
                              <div className="absolute right-0 top-full mt-1 z-10 min-w-[80px] bg-popover border border-border rounded-md shadow-md overflow-hidden">
                                {concentrationUnits.map((unit) => (
                                  <button
                                    key={unit}
                                    onClick={() => updateRowUnit(row.id, unit)}
                                    className="w-full px-3 py-2 text-xs text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                                  >
                                    {unit}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <input
                          type="text"
                          value={row.lotNumber}
                          onChange={(e) => {
                            const value = e.target.value;
                            setTableRows(rows =>
                              rows.map(r =>
                                r.id === row.id ? { ...r, lotNumber: value } : r
                              )
                            );
                          }}
                          placeholder="Optional..."
                          className="w-full text-sm text-foreground bg-transparent border-none outline-none focus:outline-none"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Usage Instructions */}
          <div className="border border-border rounded-lg p-6 bg-muted/50">
            <h3 className="text-lg font-semibold text-foreground mb-4">How to Use</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Tag Input:</h4>
                <ul className="text-sm text-foreground space-y-1">
                  <li>• <strong>Type</strong> to search and filter suggestions</li>
                  <li>• <strong>Click</strong> a suggestion or press <strong>Enter</strong> to add it as a tag</li>
                  <li>• <strong>&quot;Create new&quot;</strong> option appears when typing (if enabled)</li>
                  <li>• <strong>Click X</strong> on a tag to remove it</li>
                  <li>• <strong>Backspace</strong> with empty input removes the last tag</li>
                  <li>• <strong>Escape</strong> closes the dropdown</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Concentration Column:</h4>
                <ul className="text-sm text-foreground space-y-1">
                  <li>• <strong>Type</strong> directly in the cell to edit the numeric value</li>
                  <li>• <strong>Click</strong> the unit badge to open the dropdown</li>
                  <li>• <strong>Select</strong> a unit from the dropdown (X, mM, %, ng, etc.)</li>
                  <li>• Dropdown closes automatically when selecting a unit or clicking outside</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Code Example */}
          <div className="border border-border rounded-lg p-6 bg-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Code Example</h3>
            <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
{`// Tag Input Usage
import { TagInput } from "@/components/ui/tag-input";

const suggestions = [
  { id: "1", label: "12X Alinity Buffer" },
  { id: "2", label: "Trichomoniasis", count: 4 },
];

const [tags, setTags] = useState([]);

<TagInput
  suggestions={suggestions}
  selectedTags={tags}
  onTagsChange={setTags}
  placeholder="Type to search..."
  allowCreate={true}
/>

// Database Items Selector
import { ItemSelect } from "@/components/item-select";
import { IngredientSelect } from "@/components/ingredient-select";

const [selectedItems, setSelectedItems] = useState<TagOption[]>([]);
const [selectedIngredients, setSelectedIngredients] = useState<TagOption[]>([]);

// Load all items from all categories
<ItemSelect
  selectedItems={selectedItems}
  onItemsChange={setSelectedItems}
  placeholder="Type to search items..."
  allowCreate={false}
/>

// Load items from specific categories
<ItemSelect
  categoryIds={["cat-123-abc", "cat-456-def"]}
  selectedItems={selectedItems}
  onItemsChange={setSelectedItems}
  placeholder="Type to search items..."
  allowCreate={false}
/>

// Ingredients with create option
<IngredientSelect
  selectedIngredients={selectedIngredients}
  onIngredientsChange={setSelectedIngredients}
  placeholder="Type to search ingredients..."
  allowCreate={true}
/>

// Concentration Column with Unit Dropdown
interface RowData {
  concentration: string;
  unit: string;
}

const concentrationUnits = ["X", "mM", "%", "ng", "μM"];
const [row, setRow] = useState({ concentration: "100", unit: "mM" });

<div className="flex items-center justify-between gap-2">
  <input
    type="text"
    value={row.concentration}
    onChange={(e) => setRow({ ...row, concentration: e.target.value })}
    className="flex-1 min-w-0 text-sm bg-transparent"
  />
  <button className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-secondary rounded-md">
    {row.unit}
    <ChevronDown className="w-3 h-3" />
  </button>
</div>`}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}

