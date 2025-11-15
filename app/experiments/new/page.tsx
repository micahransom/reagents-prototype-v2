"use client";

import { useState, useMemo, useRef } from "react";
import { History, Download, Upload, Save, CircleUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TagInput } from "@/components/ui/tag-input";
import { Tooltip } from "@/components/ui/tooltip";
import Link from "next/link";
import { 
  buffers, 
  enzymes, 
  oligonucleotides, 
  preservatives, 
  primerProbePairs, 
  protocols, 
  salts, 
  stabilizers, 
  targets, 
  thermocyclers 
} from "@/lib/ingredient-data";

type TabType = "conditions" | "test-tracking" | "visualizations";

interface Tag {
  id: string;
  label: string;
  count?: number;
}

interface TableRowData {
  id: string;
  ingredients: Tag[];
  concentration: string;
  unit: string;
  lotNumber: string;
}

export default function NewExperimentPage() {
  const [activeTab, setActiveTab] = useState<TabType>("conditions");
  
  // Editable title and objective
  const [experimentTitle, setExperimentTitle] = useState("New Experiment");
  const [objective, setObjective] = useState("Add objective...");
  
  // Counter for generating unique row IDs
  const rowIdCounter = useRef(100);
  
  // Generate ingredient suggestions from all categories
  const ingredientSuggestions = useMemo(() => {
    const allIngredients: Tag[] = [];
    
    // Add all buffers
    buffers.forEach(item => {
      allIngredients.push({ id: `buffer-${item.id}`, label: item.name });
    });
    
    // Add all enzymes
    enzymes.forEach(item => {
      allIngredients.push({ id: `enzyme-${item.id}`, label: item.name });
    });
    
    // Add all oligonucleotides
    oligonucleotides.forEach(item => {
      allIngredients.push({ id: `oligo-${item.id}`, label: item.name });
    });
    
    // Add all preservatives
    preservatives.forEach(item => {
      allIngredients.push({ id: `preservative-${item.id}`, label: item.name });
    });
    
    // Add all primer probe pairs
    primerProbePairs.forEach(item => {
      allIngredients.push({ id: `ppp-${item.id}`, label: item.name });
    });
    
    // Add all protocols
    protocols.forEach(item => {
      allIngredients.push({ id: `protocol-${item.id}`, label: item.name });
    });
    
    // Add all salts
    salts.forEach(item => {
      allIngredients.push({ id: `salt-${item.id}`, label: item.name });
    });
    
    // Add all stabilizers
    stabilizers.forEach(item => {
      allIngredients.push({ id: `stabilizer-${item.id}`, label: item.name });
    });
    
    // Add all targets
    targets.forEach(item => {
      allIngredients.push({ id: `target-${item.id}`, label: item.name });
    });
    
    // Add all thermocyclers
    thermocyclers.forEach(item => {
      allIngredients.push({ id: `thermocycler-${item.id}`, label: `${item.name} (${item.serial})` });
    });
    
    // Sort alphabetically by label
    return allIngredients.sort((a, b) => a.label.localeCompare(b.label));
  }, []);
  
  // Table data for Materials (formerly Cartridge)
  const [materialsRows, setMaterialsRows] = useState<TableRowData[]>([
    { id: "mat-1", ingredients: [], concentration: "", unit: "mM", lotNumber: "" },
  ]);

  // Helper function to check if a row is empty
  const isRowEmpty = (row: TableRowData) => {
    return row.ingredients.length === 0 && row.concentration === "" && row.lotNumber === "";
  };

  // Helper function to add a new row if the last row has data
  const addNewRowIfNeeded = (rows: TableRowData[]) => {
    const lastRow = rows[rows.length - 1];
    if (!isRowEmpty(lastRow)) {
      rowIdCounter.current += 1;
      return [...rows, { id: `mat-${rowIdCounter.current}`, ingredients: [], concentration: "", unit: "mM", lotNumber: "" }];
    }
    return rows;
  };

  const updateRowIngredients = (rowId: string, tags: Tag[]) => {
    setMaterialsRows(rows => {
      const updatedRows = rows.map(row =>
        row.id === rowId ? { ...row, ingredients: tags } : row
      );
      return addNewRowIfNeeded(updatedRows);
    });
  };

  const updateRowConcentration = (rowId: string, concentration: string) => {
    setMaterialsRows(rows => {
      const updatedRows = rows.map(row =>
        row.id === rowId ? { ...row, concentration } : row
      );
      return addNewRowIfNeeded(updatedRows);
    });
  };

  const updateRowLotNumber = (rowId: string, lotNumber: string) => {
    setMaterialsRows(rows => {
      const updatedRows = rows.map(row =>
        row.id === rowId ? { ...row, lotNumber } : row
      );
      return addNewRowIfNeeded(updatedRows);
    });
  };
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
                <span className="text-sm font-medium text-foreground">
                  Experiments
                </span>
              </Link>
              <Link href="/reagents">
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Reagents
                </span>
              </Link>
              <Link href="/admin">
                <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Admin Tools
                </span>
              </Link>
            </div>
          </div>
          <button className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shadow-sm">
            <CircleUser className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-medium flex-wrap">
          <Link href="/experiments" className="text-muted-foreground hover:text-foreground">
            Experiments
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground break-words">New Experiment</span>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Main Content */}
      <main className="bg-background flex flex-col items-center px-8 py-16 gap-8">
        <div className="flex flex-col gap-6 w-[600px]">
          {/* Header Section */}
          <div className="flex flex-col gap-6">
            {/* Action Buttons Row */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Tooltip content="Not Yet Built" side="bottom">
                  <Button variant="outline" size="sm">
                    <History className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <Tooltip content="Not Yet Built" side="bottom">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </div>
              <div className="flex gap-2">
                <Tooltip content="Not Yet Built" side="bottom">
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Experiment
                  </Button>
                </Tooltip>
                <Tooltip content="Not Yet Built" side="bottom">
                  <Button variant="outline" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </Tooltip>
              </div>
            </div>

            {/* Title - Editable */}
            <input
              type="text"
              value={experimentTitle}
              onChange={(e) => setExperimentTitle(e.target.value)}
              className="text-5xl font-bold text-accent-foreground leading-tight bg-transparent border-none outline-none focus:ring-0 p-0 w-full break-words"
            />

            {/* Objective - Editable */}
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                onFocus={(e) => {
                  if (e.target.value === "Add objective...") {
                    setObjective("");
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    setObjective("Add objective...");
                  }
                }}
                className="text-base text-foreground bg-transparent border-none outline-none focus:ring-0 p-0 w-full placeholder:text-foreground"
                placeholder="Add objective..."
              />
            </div>

            {/* Meta Information Table */}
            <div className="flex items-center">
              <div className="flex-1 overflow-clip px-px">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col w-32">
                    <div className="flex items-center py-2">
                      <p className="text-base text-muted-foreground">Last edited by</p>
                    </div>
                    <div className="flex items-center py-2">
                      <p className="text-base text-muted-foreground">Last edited time</p>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 h-10 p-2 min-w-[85px]">
                      <p className="text-sm text-muted-foreground">—</p>
                    </div>
                    <div className="flex items-center h-10 p-2 min-w-[85px]">
                      <p className="text-sm text-muted-foreground">—</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-muted p-[3px] rounded-lg flex h-9">
              <button 
                onClick={() => setActiveTab("conditions")}
                className={`flex-1 rounded-md px-2 py-1 flex items-center justify-center ${
                  activeTab === "conditions" ? "bg-background border border-transparent" : ""
                }`}
              >
                <span className="text-sm font-medium text-foreground text-center">Conditions</span>
              </button>
              <button 
                onClick={() => setActiveTab("test-tracking")}
                className={`flex-1 rounded-md px-2 py-1 flex items-center justify-center ${
                  activeTab === "test-tracking" ? "bg-background border border-transparent" : ""
                }`}
              >
                <span className="text-sm font-medium text-foreground text-center">Test Tracking</span>
              </button>
              <button 
                onClick={() => setActiveTab("visualizations")}
                className={`flex-1 rounded-md px-2 py-1 flex items-center justify-center ${
                  activeTab === "visualizations" ? "bg-background border border-transparent" : ""
                }`}
              >
                <span className="text-sm font-medium text-foreground text-center">Visualizations</span>
              </button>
            </div>
          </div>

          {/* Conditions Tab Content */}
          {activeTab === "conditions" && (
          <>
          <div className="flex flex-col gap-6">
            <div className="border-b border-border pb-2 pt-4">
              <h2 className="text-3xl font-semibold text-foreground">Conditions</h2>
            </div>

            <div className="flex items-center">
              <div className="flex-1 overflow-clip px-px">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 w-[180px]">
                    <div className="flex items-center py-2">
                      <p className="text-base text-muted-foreground">Instrument</p>
                    </div>
                    <div className="flex items-center py-2">
                      <p className="text-base text-muted-foreground">Operators</p>
                    </div>
                    <div className="flex items-center py-2">
                      <p className="text-base text-muted-foreground">Cartridge LN</p>
                    </div>
                    <div className="flex items-center py-2">
                      <p className="text-base text-muted-foreground">Buffer Pack</p>
                    </div>
                    <div className="flex items-center py-2">
                      <p className="text-base text-muted-foreground">Lyo Composition</p>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2 h-10 p-2 min-w-[85px]">
                      <p className="text-sm text-muted-foreground">—</p>
                    </div>
                    <div className="flex items-center gap-2 h-10 p-2 min-w-[85px]">
                      <p className="text-sm text-muted-foreground">—</p>
                    </div>
                    <div className="flex items-center gap-2 h-10 p-2 min-w-[85px]">
                      <p className="text-sm text-muted-foreground">—</p>
                    </div>
                    <div className="flex items-center gap-2 h-10 p-2 min-w-[85px]">
                      <p className="text-sm text-muted-foreground">—</p>
                    </div>
                    <div className="flex items-center gap-2 h-10 p-2 min-w-[85px]">
                      <p className="text-sm text-muted-foreground">—</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Materials Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between h-10">
              <h3 className="text-2xl font-semibold text-foreground pt-2">Materials</h3>
            </div>

            <div className="overflow-x-auto">
              <div className="bg-white border rounded-lg w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[280px]">Ingredient Name</TableHead>
                      <TableHead className="w-[240px]">LN#</TableHead>
                      <TableHead className="w-[200px]">Aliquot</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materialsRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="w-[280px] align-top">
                          <TagInput
                            suggestions={ingredientSuggestions}
                            selectedTags={row.ingredients}
                            onTagsChange={(tags) => updateRowIngredients(row.id, tags)}
                            placeholder="Type ingredient..."
                            allowCreate={true}
                          />
                        </TableCell>
                        <TableCell className="w-[240px] align-top">
                          <input
                            type="text"
                            value={row.concentration}
                            onChange={(e) => updateRowConcentration(row.id, e.target.value)}
                            placeholder="LN#"
                            className="w-full text-sm text-foreground bg-transparent border-none outline-none focus:outline-none py-0.5"
                          />
                        </TableCell>
                        <TableCell className="w-[200px] align-top">
                          <input
                            type="text"
                            value={row.lotNumber}
                            onChange={(e) => updateRowLotNumber(row.id, e.target.value)}
                            placeholder="Aliquot..."
                            className="w-full text-sm text-foreground bg-transparent border-none outline-none focus:outline-none py-0.5"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold text-foreground pt-2">Attachments</h3>
              <Tooltip content="Not Yet Built" side="bottom">
                <Button variant="outline" size="sm">
                  Upload
                </Button>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground">No attachments yet.</p>
          </div>
          </>
          )}

          {/* Test Tracking Tab Content */}
          {activeTab === "test-tracking" && (
          <>
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-2 pt-4">
                <h2 className="text-3xl font-semibold text-foreground">Test Tracking Table</h2>
              </div>
            </div>
          </>
          )}

          {/* Visualizations Tab Content */}
          {activeTab === "visualizations" && (
          <>
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-2 pt-2">
                <h2 className="text-3xl font-semibold text-foreground">Visualizations</h2>
              </div>
            </div>
          </>
          )}
        </div>

        {/* Test Tracking Table - Full Width Section */}
        {activeTab === "test-tracking" && (
          <div className="w-full px-8 flex flex-col gap-8">
            {/* Action Buttons */}
            <div className="flex items-center justify-between w-full">
              <Tooltip content="Not Yet Built" side="bottom">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </Tooltip>
            </div>

            {/* Test Tracking Table */}
            <div className="bg-white border rounded-lg overflow-x-auto w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-accent">
                    <TableHead className="text-center font-medium text-foreground min-w-[120px]">Test Date</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[80px]">Samples</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[120px]">Sample ID</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[150px]">Sample Description</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[120px]">Cartridge Lot #</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[150px]">PCR MM Lyo Lot #</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[100px]">IC Lot #</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[100px]">XML</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[120px]">Pass through filter</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[130px]">Load Volume (uL)</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[150px]">Instrument Serial #</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[120px]">Target Amount</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[80px]">IC</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[80px]">cRNA</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[120px]">Target Matrix</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[100px]">Operator</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[120px]">COVID (Orangeboy)</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[120px]">PSA (Orangeboy)</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[100px]">ATTOM 16s</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[120px]">Quasar 670(s)</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[100px]">Fuji RSV</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[300px]">Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="min-w-[120px]"></TableCell>
                    <TableCell className="min-w-[80px]"></TableCell>
                    <TableCell className="min-w-[120px]"></TableCell>
                    <TableCell className="min-w-[150px]"></TableCell>
                    <TableCell className="min-w-[120px]"></TableCell>
                    <TableCell className="min-w-[150px]"></TableCell>
                    <TableCell className="min-w-[100px]"></TableCell>
                    <TableCell className="min-w-[100px]"></TableCell>
                    <TableCell className="min-w-[120px]"></TableCell>
                    <TableCell className="min-w-[130px]"></TableCell>
                    <TableCell className="min-w-[150px]"></TableCell>
                    <TableCell className="min-w-[120px]"></TableCell>
                    <TableCell className="min-w-[80px]"></TableCell>
                    <TableCell className="min-w-[80px]"></TableCell>
                    <TableCell className="min-w-[120px]"></TableCell>
                    <TableCell className="min-w-[100px]"></TableCell>
                    <TableCell className="min-w-[120px]"></TableCell>
                    <TableCell className="min-w-[120px]"></TableCell>
                    <TableCell className="min-w-[100px]"></TableCell>
                    <TableCell className="min-w-[120px]"></TableCell>
                    <TableCell className="min-w-[100px]"></TableCell>
                    <TableCell className="min-w-[300px]"></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Files Section */}
            <div className="flex flex-col gap-6 mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-foreground pt-2">Files</h3>
                <Tooltip content="Not Yet Built" side="bottom">
                  <Button variant="outline" size="sm">
                    Upload
                  </Button>
                </Tooltip>
              </div>

              {/* Files Table */}
              <div className="bg-white border rounded-lg overflow-x-auto w-full">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-accent">
                      <TableHead className="font-medium text-foreground">File</TableHead>
                      <TableHead className="text-center font-medium text-foreground">Category</TableHead>
                      <TableHead className="text-center font-medium text-foreground">Sample ID</TableHead>
                      <TableHead className="text-center font-medium text-foreground">Cleaned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}

        {/* Test Tracking Attachments - Centered */}
        {activeTab === "test-tracking" && (
          <div className="w-[600px]">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-foreground pt-2">Attachments</h3>
                <Tooltip content="Not Yet Built" side="bottom">
                  <Button variant="outline" size="sm">
                    Upload
                  </Button>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground">No attachments yet.</p>
            </div>
          </div>
        )}

        {/* Visualizations - Full Width Section */}
        {activeTab === "visualizations" && (
          <div className="w-full px-8 flex flex-col gap-8">
            {/* Empty visualization message */}
            <div className="w-full py-16 flex items-center justify-center">
              <p className="text-muted-foreground">No visualizations available yet.</p>
            </div>
          </div>
        )}

        {/* Visualizations Attachments - Centered */}
        {activeTab === "visualizations" && (
          <div className="w-[600px]">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-foreground pt-2">Attachments</h3>
                <Tooltip content="Not Yet Built" side="bottom">
                  <Button variant="outline" size="sm">
                    Upload
                  </Button>
                </Tooltip>
              </div>
              <p className="text-sm text-muted-foreground">No attachments yet.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
