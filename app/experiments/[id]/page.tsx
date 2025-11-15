"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { History, Download, Upload, Save, ChevronDown, CircleUser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const concentrationUnits = ["X", "mM", "%", "ng", "μM", "mg/mL", "μg/mL"];

// Generate realistic fluorescence curve data (sharp rise then gradual decrease)
const generateFluorescenceData = (seed: number) => {
  const timePoints = Array.from({ length: 60 }, (_, i) => i); // 60 cycles, 0 to 59
  const samples = 3; // 3 samples/wells

  const data = [];
  for (let sample = 0; sample < samples; sample++) {
    const baseline = 2500 + (seed * 60 + sample * 100);
    const peakValue = 20000 + (seed * 250 + sample * 600);
    const riseStartCycle = 8 + (seed * 0.3); // Curve starts rising after ~8 cycles
    const peakCycle = 25 + (seed * 0.6 + sample * 0.7); // Peak occurs between cycles 25-35
    const riseRate = 2.2 + (sample * 0.15); // Smoother rise (lower value = smoother)
    const decayRate = 0.015 + (sample * 0.001); // Gradual decay

    for (const cycle of timePoints) {
      let fluorescence;
      if (cycle < riseStartCycle) {
        // Stay at baseline before rise starts
        fluorescence = baseline;
      } else if (cycle < peakCycle) {
        // Smoother exponential rise
        const progress = (cycle - riseStartCycle) / (peakCycle - riseStartCycle);
        fluorescence = baseline + (peakValue - baseline) * Math.pow(progress, 1 / riseRate);
      } else {
        // Gradual exponential decay towards baseline
        const cyclesSincePeak = cycle - peakCycle;
        const decayProgress = Math.exp(-decayRate * cyclesSincePeak);
        fluorescence = baseline + (peakValue - baseline) * decayProgress;
      }

      // Add small scatter for realism - controlled magnitude
      const scatter = (Math.sin(seed * sample + cycle * 0.8) * 0.5 + (Math.random() - 0.5)) * 150;
      // Ensure all points stay within bounds with padding
      fluorescence = Math.max(baseline * 0.98, Math.min(28000, fluorescence + scatter));

      data.push({
        time: cycle,
        fluorescence,
        sample,
      });
    }
  }

  return data;
};

const FluorescencePlot = ({ seed }: { seed: number }) => {
  const data = generateFluorescenceData(seed);
  const curveColor = "#3b82f6"; // Single blue color for all curves

  return (
    <div className="relative w-full aspect-[1364/1224] bg-white">
      {/* Chart area */}
      <div className="absolute inset-0 border border-border">
        {/* Y-axis label */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <div className="-rotate-90 whitespace-nowrap">
            <span className="text-xs text-foreground">Fluorescence</span>
          </div>
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-12 top-2 bottom-10 w-12 flex flex-col justify-between text-[10px] text-muted-foreground text-right pr-2">
          <span>30000</span>
          <span>25000</span>
          <span>20000</span>
          <span>15000</span>
          <span>10000</span>
          <span>5000</span>
          <span>0</span>
        </div>

        {/* SVG for fluorescence curves */}
        <svg
          className="absolute left-24 right-2 top-2 bottom-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 16.67, 33.33, 50, 66.67, 83.33, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.2"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Draw curves as dots */}
          {data.map((point, idx) => {
            const x = (point.time / 60) * 100;
            const y = 100 - ((point.fluorescence / 30000) * 100);
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r="0.6"
                fill={curveColor}
                opacity="0.7"
              />
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="absolute bottom-2 left-24 right-2 h-8 flex justify-between text-[10px] text-muted-foreground items-start">
          <span>0</span>
          <span>10</span>
          <span>20</span>
          <span>30</span>
          <span>40</span>
          <span>50</span>
          <span>60</span>
        </div>

        {/* X-axis label */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <span className="text-xs text-foreground whitespace-nowrap">Time (cycles)</span>
        </div>
      </div>
    </div>
  );
};

export default function ExperimentDetailPage() {
  const [activeTab, setActiveTab] = useState<TabType>("conditions");
  
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
  
  // Table data for Cartridge - populated with existing data
  const [cartridgeRows, setCartridgeRows] = useState<TableRowData[]>([
    { id: "cart-1", ingredients: [{ id: "strep-buffer", label: "Strep A Elution Buffer EH-9 0.1%" }], concentration: "2025.05.14", unit: "mM", lotNumber: "N/A" },
    { id: "cart-2", ingredients: [{ id: "pbs", label: "PBS" }], concentration: "206698", unit: "mM", lotNumber: "20250527" },
    { id: "cart-3", ingredients: [{ id: "strep-cells", label: "Strep A Cells F811 1E+04 cps/uL (50uL)" }], concentration: "ATCC19615", unit: "mM", lotNumber: "20250527" },
    { id: "cart-4", ingredients: [], concentration: "", unit: "mM", lotNumber: "" },
  ]);

  // Table data for Sample Prep - populated with existing data
  const [samplePrepRows, setSamplePrepRows] = useState<TableRowData[]>([
    { id: "prep-1", ingredients: [{ id: "water", label: "Water" }], concentration: "", unit: "mM", lotNumber: "" },
    { id: "prep-2", ingredients: [{ id: "13", label: "Tris pH 8.0" }], concentration: "250", unit: "mM", lotNumber: "" },
    { id: "prep-3", ingredients: [{ id: "6", label: "Brij-58" }], concentration: "0.13", unit: "%", lotNumber: "" },
    { id: "prep-4", ingredients: [{ id: "7", label: "Proclin950" }], concentration: "0.05", unit: "%", lotNumber: "" },
    { id: "prep-5", ingredients: [{ id: "8", label: "dNTPs" }], concentration: "1.88", unit: "mM", lotNumber: "" },
    { id: "prep-6", ingredients: [{ id: "9", label: "Dextran" }], concentration: "5.00", unit: "%", lotNumber: "" },
    { id: "prep-7", ingredients: [{ id: "trehalose", label: "Trehalose" }], concentration: "100", unit: "mM", lotNumber: "" },
    { id: "prep-8", ingredients: [{ id: "10", label: "KCl" }], concentration: "38", unit: "mM", lotNumber: "" },
    { id: "prep-9", ingredients: [{ id: "11", label: "NaCl" }], concentration: "137.5", unit: "mM", lotNumber: "" },
    { id: "prep-10", ingredients: [{ id: "15", label: "MDxRT 10% (0.25M NaCl)" }], concentration: "54.24", unit: "ng", lotNumber: "" },
    { id: "prep-11", ingredients: [{ id: "16", label: "0% Gly- mTAQ1 (0.25M KCl)" }], concentration: "160.0", unit: "ng", lotNumber: "" },
    { id: "prep-12", ingredients: [{ id: "12", label: "MgCl2" }], concentration: "19.3", unit: "mM", lotNumber: "" },
    { id: "prep-13", ingredients: [{ id: "ppp-mix", label: "12x Primer-Probe Mix" }], concentration: "2.5", unit: "X", lotNumber: "" },
    { id: "prep-14", ingredients: [], concentration: "", unit: "mM", lotNumber: "" },
  ]);

  // Track which unit dropdown is open
  const [openUnitDropdown, setOpenUnitDropdown] = useState<string | null>(null);

  // Helper function to check if a row is empty
  const isRowEmpty = (row: TableRowData) => {
    return row.ingredients.length === 0 && row.concentration === "" && row.lotNumber === "";
  };

  // Helper function to add a new row if the last row has data
  const addNewRowIfNeeded = (section: 'cartridge' | 'samplePrep', rows: TableRowData[]) => {
    const lastRow = rows[rows.length - 1];
    if (!isRowEmpty(lastRow)) {
      rowIdCounter.current += 1;
      const newId = section === 'cartridge' 
        ? `cart-${rowIdCounter.current}` 
        : `prep-${rowIdCounter.current}`;
      return [...rows, { id: newId, ingredients: [], concentration: "", unit: "mM", lotNumber: "" }];
    }
    return rows;
  };

  const updateRowIngredients = (section: 'cartridge' | 'samplePrep', rowId: string, tags: Tag[]) => {
    if (section === 'cartridge') {
      setCartridgeRows(rows => {
        const updatedRows = rows.map(row =>
          row.id === rowId ? { ...row, ingredients: tags } : row
        );
        return addNewRowIfNeeded(section, updatedRows);
      });
    } else {
      setSamplePrepRows(rows => {
        const updatedRows = rows.map(row =>
          row.id === rowId ? { ...row, ingredients: tags } : row
        );
        return addNewRowIfNeeded(section, updatedRows);
      });
    }
  };

  const updateRowConcentration = (section: 'cartridge' | 'samplePrep', rowId: string, concentration: string) => {
    if (section === 'cartridge') {
      setCartridgeRows(rows => {
        const updatedRows = rows.map(row =>
          row.id === rowId ? { ...row, concentration } : row
        );
        return addNewRowIfNeeded(section, updatedRows);
      });
    } else {
      setSamplePrepRows(rows => {
        const updatedRows = rows.map(row =>
          row.id === rowId ? { ...row, concentration } : row
        );
        return addNewRowIfNeeded(section, updatedRows);
      });
    }
  };

  const updateRowUnit = (section: 'cartridge' | 'samplePrep', rowId: string, unit: string) => {
    if (section === 'cartridge') {
      setCartridgeRows(rows => {
        const updatedRows = rows.map(row =>
          row.id === rowId ? { ...row, unit } : row
        );
        return addNewRowIfNeeded(section, updatedRows);
      });
    } else {
      setSamplePrepRows(rows => {
        const updatedRows = rows.map(row =>
          row.id === rowId ? { ...row, unit } : row
        );
        return addNewRowIfNeeded(section, updatedRows);
      });
    }
    setOpenUnitDropdown(null);
  };

  const updateRowLotNumber = (section: 'cartridge' | 'samplePrep', rowId: string, lotNumber: string) => {
    if (section === 'cartridge') {
      setCartridgeRows(rows => {
        const updatedRows = rows.map(row =>
          row.id === rowId ? { ...row, lotNumber } : row
        );
        return addNewRowIfNeeded(section, updatedRows);
      });
    } else {
      setSamplePrepRows(rows => {
        const updatedRows = rows.map(row =>
          row.id === rowId ? { ...row, lotNumber } : row
        );
        return addNewRowIfNeeded(section, updatedRows);
      });
    }
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
          <span className="text-foreground break-words">20250814_NEAR.XML.Evaluation_CR</span>
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

            {/* Title */}
            <h1 className="text-5xl font-bold text-accent-foreground leading-tight break-words">
              20250814_NEAR.XML.Evaluation_CR
            </h1>

            {/* Objective */}
            <div className="flex flex-col gap-2">
              <p className="text-base text-foreground">Add objective...</p>
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
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-sm text-foreground">MT</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground truncate">Micah Taylor</p>
                      </div>
                    </div>
                    <div className="flex items-center h-10 p-2 min-w-[85px]">
                      <p className="text-sm text-foreground truncate">December 12, 2025 7:42 PM (PST)</p>
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
                      <Badge variant="outline" className="bg-slate-100 border-slate-300">Oscar</Badge>
                    </div>
                    <div className="flex items-center gap-2 h-10 p-2 min-w-[85px]">
                      <Badge variant="outline" className="bg-slate-100 border-slate-300">Minh V</Badge>
                      <Badge variant="outline" className="bg-slate-100 border-slate-300">Zhixia L</Badge>
                    </div>
                    <div className="flex items-center gap-2 h-10 p-2 min-w-[85px]">
                      <Badge variant="outline" className="bg-slate-100 border-slate-300">251975</Badge>
                    </div>
                    <div className="flex items-center gap-2 h-10 p-2 min-w-[85px]">
                      <Badge variant="outline" className="bg-slate-100 border-slate-300">StrepA EB 2025.06.02 (EH-9) (R1,R3)</Badge>
                    </div>
                    <div className="flex items-center gap-2 h-10 p-2 min-w-[85px]">
                      <Badge variant="outline" className="bg-slate-100 border-slate-300">NEAR 2025.06.23 (10uL std Strep A + 30K mod. IC1</Badge>
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

            <div className="bg-white border rounded-lg w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[280px]">Ingredient Name</TableHead>
                    <TableHead className="min-w-[240px]">LN#</TableHead>
                    <TableHead className="min-w-[200px]">Aliquot</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartridgeRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="w-[280px] align-top">
                        <TagInput
                          suggestions={ingredientSuggestions}
                          selectedTags={row.ingredients}
                          onTagsChange={(tags) => updateRowIngredients('cartridge', row.id, tags)}
                          placeholder="Type ingredient..."
                          allowCreate={true}
                        />
                      </TableCell>
                      <TableCell className="w-[240px] align-top">
                        <input
                          type="text"
                          value={row.concentration}
                          onChange={(e) => updateRowConcentration('cartridge', row.id, e.target.value)}
                          placeholder=""
                          className="w-full text-sm text-foreground bg-transparent border-none outline-none focus:outline-none py-0.5"
                        />
                      </TableCell>
                      <TableCell className="w-[200px] align-top">
                        <input
                          type="text"
                          value={row.lotNumber}
                          onChange={(e) => updateRowLotNumber('cartridge', row.id, e.target.value)}
                          placeholder=""
                          className="w-full text-sm text-foreground bg-transparent border-none outline-none focus:outline-none py-0.5"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

            <div className="flex gap-2">
              <Card className="w-[260px] relative overflow-hidden">
                <div className="bg-gray-300 border-b h-[200px]" />
                <Tooltip content="Not Yet Built" side="bottom">
                  <Button variant="outline" size="sm" className="absolute top-2 right-2">
                    <Download className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <CardHeader className="px-6 py-0 pt-6">
                  <CardTitle className="text-base font-semibold">file</CardTitle>
                  <CardDescription className="text-sm">120 MB</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                </CardContent>
              </Card>

              <Card className="w-[260px] relative overflow-hidden">
                <div className="bg-gray-300 border-b h-[200px]" />
                <Tooltip content="Not Yet Built" side="bottom">
                  <Button variant="outline" size="sm" className="absolute top-2 right-2">
                    <Download className="w-4 h-4" />
                  </Button>
                </Tooltip>
                <CardHeader className="px-6 py-0 pt-6">
                  <CardTitle className="text-base font-semibold">file</CardTitle>
                  <CardDescription className="text-sm">120 MB</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0">
                </CardContent>
              </Card>
            </div>
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
                    <TableHead className="text-center font-medium text-foreground min-w-[100px]">Test Date</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[80px]">Samples</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[160px]">Sample ID</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[150px]">Sample Description</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[120px]">Cartridge Type</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[200px]">Cartridge Lot #</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[160px]">PCR MM Lyo Lot #</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[200px]">IC Lot #</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[160px]">XML</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[150px]">Pass through filter</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[140px]">Load Volume (ul)</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[160px]">Instrument Serial #</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[220px]">Target (cps in (SP) 500uL sample input or (PD) 20uL PCR</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[180px]">IC (lyo'd)</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[140px]">cRNA</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[140px]">Target Matrix</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[110px]">Operator</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[150px]">COVID (Orange560)</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[130px]">FluA (FAM)</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[130px]">IC ATTO490</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[160px]">FluB (Quasar 670)</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[130px]">RSV (Red610)</TableHead>
                    <TableHead className="text-center font-medium text-foreground min-w-[300px]">Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-center text-sm">8/11/25</TableCell>
                    <TableCell className="text-center text-sm">1</TableCell>
                    <TableCell><Badge variant="outline">5000Virus.DEG.1</Badge></TableCell>
                    <TableCell className="text-center text-sm">Virus in UTM</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-center text-sm">251907 - Mix 1<br/>(Swapped in SP buffer)</TableCell>
                    <TableCell className="text-center text-sm">06.23.25 Mix 1</TableCell>
                    <TableCell className="text-center text-sm">2025.08.08 with Sigma cRNA</TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">G005_wPCR_005V2</Badge></TableCell>
                    <TableCell><Badge variant="outline">Porex</Badge></TableCell>
                    <TableCell className="text-center text-sm">500.00</TableCell>
                    <TableCell className="text-center text-sm">15894</TableCell>
                    <TableCell><Badge variant="outline">5K</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">50k aRNA, sigma cRNA</Badge></TableCell>
                    <TableCell><Badge variant="outline">Sigma Lyo'd</Badge></TableCell>
                    <TableCell><Badge variant="outline">UTM</Badge></TableCell>
                    <TableCell><Badge variant="outline">CRL</Badge></TableCell>
                    <TableCell className="text-center text-sm">39.4</TableCell>
                    <TableCell className="text-center text-sm">38.9</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">38.6</TableCell>
                    <TableCell className="min-w-[300px]"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center text-sm">8/11/25</TableCell>
                    <TableCell className="text-center text-sm">2</TableCell>
                    <TableCell><Badge variant="outline">5000Virus.DEG.2</Badge></TableCell>
                    <TableCell className="text-center text-sm">Virus in UTM</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-center text-sm">251907 - Mix 1<br/>(Swapped in SP buffer)</TableCell>
                    <TableCell className="text-center text-sm">06.23.25 Mix 1</TableCell>
                    <TableCell className="text-center text-sm">2025.08.08 with Sigma cRNA</TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">G005_wPCR_005V2</Badge></TableCell>
                    <TableCell><Badge variant="outline">Porex</Badge></TableCell>
                    <TableCell className="text-center text-sm">500.00</TableCell>
                    <TableCell className="text-center text-sm">15896</TableCell>
                    <TableCell><Badge variant="outline">5K</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">50k aRNA, sigma cRNA</Badge></TableCell>
                    <TableCell><Badge variant="outline">Sigma Lyo'd</Badge></TableCell>
                    <TableCell><Badge variant="outline">UTM</Badge></TableCell>
                    <TableCell><Badge variant="outline">CRL</Badge></TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="min-w-[300px]"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center text-sm">8/11/25</TableCell>
                    <TableCell className="text-center text-sm">3</TableCell>
                    <TableCell><Badge variant="outline">5000Virus.EtOH.1</Badge></TableCell>
                    <TableCell className="text-center text-sm">Virus in UTM</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-center text-sm">251907 - Mix 1<br/>(Swapped in SP buffer)</TableCell>
                    <TableCell className="text-center text-sm">06.23.25 Mix 1</TableCell>
                    <TableCell className="text-center text-sm">2025.08.08 with Sigma cRNA</TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">G005_wPCR_005V2</Badge></TableCell>
                    <TableCell><Badge variant="outline">Porex</Badge></TableCell>
                    <TableCell className="text-center text-sm">500.00</TableCell>
                    <TableCell className="text-center text-sm">15892</TableCell>
                    <TableCell><Badge variant="outline">5K</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">50k aRNA, sigma cRNA</Badge></TableCell>
                    <TableCell><Badge variant="outline">Sigma Lyo'd</Badge></TableCell>
                    <TableCell><Badge variant="outline">UTM</Badge></TableCell>
                    <TableCell><Badge variant="outline">CRL</Badge></TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">50.0</TableCell>
                    <TableCell className="min-w-[300px]"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center text-sm">8/11/25</TableCell>
                    <TableCell className="text-center text-sm">4</TableCell>
                    <TableCell><Badge variant="outline">5000Virus.EtOH.2</Badge></TableCell>
                    <TableCell className="text-center text-sm">Virus in UTM</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-center text-sm">251907 - Mix 1<br/>(Swapped in SP buffer)</TableCell>
                    <TableCell className="text-center text-sm">06.23.25 Mix 1</TableCell>
                    <TableCell className="text-center text-sm">2025.08.08 with Sigma cRNA</TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">G005_wPCR_005V2</Badge></TableCell>
                    <TableCell><Badge variant="outline">Porex</Badge></TableCell>
                    <TableCell className="text-center text-sm">500.00</TableCell>
                    <TableCell className="text-center text-sm">15874</TableCell>
                    <TableCell><Badge variant="outline">5K</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">50k aRNA, sigma cRNA</Badge></TableCell>
                    <TableCell><Badge variant="outline">Sigma Lyo'd</Badge></TableCell>
                    <TableCell><Badge variant="outline">UTM</Badge></TableCell>
                    <TableCell><Badge variant="outline">CRL</Badge></TableCell>
                    <TableCell className="text-center text-sm">40.0</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">38.1</TableCell>
                    <TableCell className="min-w-[300px]"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center text-sm">8/11/25</TableCell>
                    <TableCell className="text-center text-sm">5</TableCell>
                    <TableCell><Badge variant="outline">1000Virus.DEG.1</Badge></TableCell>
                    <TableCell className="text-center text-sm">Virus in UTM</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-center text-sm">251907 - Mix 1<br/>(Swapped in SP buffer)</TableCell>
                    <TableCell className="text-center text-sm">06.23.25 Mix 1</TableCell>
                    <TableCell className="text-center text-sm">2025.08.08 with Sigma cRNA</TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">G005_wPCR_005V2</Badge></TableCell>
                    <TableCell><Badge variant="outline">Porex</Badge></TableCell>
                    <TableCell className="text-center text-sm">500.00</TableCell>
                    <TableCell className="text-center text-sm">15883</TableCell>
                    <TableCell><Badge variant="outline">1K</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">50k aRNA, sigma cRNA</Badge></TableCell>
                    <TableCell><Badge variant="outline">Sigma Lyo'd</Badge></TableCell>
                    <TableCell><Badge variant="outline">UTM</Badge></TableCell>
                    <TableCell><Badge variant="outline">CRL</Badge></TableCell>
                    <TableCell className="text-center text-sm">40.5</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">41.3</TableCell>
                    <TableCell className="min-w-[300px]"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center text-sm">8/11/25</TableCell>
                    <TableCell className="text-center text-sm">6</TableCell>
                    <TableCell><Badge variant="outline">1000Virus.DEG.2</Badge></TableCell>
                    <TableCell className="text-center text-sm">Virus in UTM</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-center text-sm">251907 - Mix 1<br/>(Swapped in SP buffer)</TableCell>
                    <TableCell className="text-center text-sm">06.23.25 Mix 1</TableCell>
                    <TableCell className="text-center text-sm">2025.08.08 with Sigma cRNA</TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">G005_wPCR_005V2</Badge></TableCell>
                    <TableCell><Badge variant="outline">Porex</Badge></TableCell>
                    <TableCell className="text-center text-sm">500.00</TableCell>
                    <TableCell className="text-center text-sm">15882</TableCell>
                    <TableCell><Badge variant="outline">1K</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">50k aRNA, sigma cRNA</Badge></TableCell>
                    <TableCell><Badge variant="outline">Sigma Lyo'd</Badge></TableCell>
                    <TableCell><Badge variant="outline">UTM</Badge></TableCell>
                    <TableCell><Badge variant="outline">CRL</Badge></TableCell>
                    <TableCell className="text-center text-sm">40.3</TableCell>
                    <TableCell className="text-center text-sm">46.4</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">43.9</TableCell>
                    <TableCell className="min-w-[300px]"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center text-sm">8/11/25</TableCell>
                    <TableCell className="text-center text-sm">7</TableCell>
                    <TableCell><Badge variant="outline">1000Virus.EtOH.1</Badge></TableCell>
                    <TableCell className="text-center text-sm">Virus in UTM</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-center text-sm">251907 - Mix 1<br/>(Swapped in SP buffer)</TableCell>
                    <TableCell className="text-center text-sm">06.23.25 Mix 1</TableCell>
                    <TableCell className="text-center text-sm">2025.08.08 with Sigma cRNA</TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">G005_wPCR_005V2</Badge></TableCell>
                    <TableCell><Badge variant="outline">Porex</Badge></TableCell>
                    <TableCell className="text-center text-sm">500.00</TableCell>
                    <TableCell className="text-center text-sm">15891</TableCell>
                    <TableCell><Badge variant="outline">1K</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">50k aRNA, sigma cRNA</Badge></TableCell>
                    <TableCell><Badge variant="outline">Sigma Lyo'd</Badge></TableCell>
                    <TableCell><Badge variant="outline">UTM</Badge></TableCell>
                    <TableCell><Badge variant="outline">CRL</Badge></TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="min-w-[300px]"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center text-sm">8/11/25</TableCell>
                    <TableCell className="text-center text-sm">8</TableCell>
                    <TableCell><Badge variant="outline">1000Virus.EtOH.2</Badge></TableCell>
                    <TableCell className="text-center text-sm">Virus in UTM</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-center text-sm">251907 - Mix 1<br/>(Swapped in SP buffer)</TableCell>
                    <TableCell className="text-center text-sm">06.23.25 Mix 1</TableCell>
                    <TableCell className="text-center text-sm">2025.08.08 with Sigma cRNA</TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">G005_wPCR_005V2</Badge></TableCell>
                    <TableCell><Badge variant="outline">Porex</Badge></TableCell>
                    <TableCell className="text-center text-sm">500.00</TableCell>
                    <TableCell className="text-center text-sm">15895</TableCell>
                    <TableCell><Badge variant="outline">1K</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">50k aRNA, sigma cRNA</Badge></TableCell>
                    <TableCell><Badge variant="outline">Sigma Lyo'd</Badge></TableCell>
                    <TableCell><Badge variant="outline">UTM</Badge></TableCell>
                    <TableCell><Badge variant="outline">CRL</Badge></TableCell>
                    <TableCell className="text-center text-sm">44.5</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">-</TableCell>
                    <TableCell className="text-center text-sm">44.2</TableCell>
                    <TableCell className="min-w-[300px]"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center text-sm">8/11/25</TableCell>
                    <TableCell className="text-center text-sm">9</TableCell>
                    <TableCell><Badge variant="outline">250Virus.DEG.1</Badge></TableCell>
                    <TableCell className="text-center text-sm">Virus in UTM</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-center text-sm">251907 - Mix 1<br/>(Swapped in SP buffer)</TableCell>
                    <TableCell className="text-center text-sm">06.23.25 Mix 1</TableCell>
                    <TableCell className="text-center text-sm">2025.08.08 with Sigma cRNA</TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">G005_wPCR_005V2</Badge></TableCell>
                    <TableCell><Badge variant="outline">Porex</Badge></TableCell>
                    <TableCell className="text-center text-sm">500.00</TableCell>
                    <TableCell className="text-center text-sm">15872</TableCell>
                    <TableCell><Badge variant="outline">250</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">50k aRNA, sigma cRNA</Badge></TableCell>
                    <TableCell><Badge variant="outline">Sigma Lyo'd</Badge></TableCell>
                    <TableCell><Badge variant="outline">UTM</Badge></TableCell>
                    <TableCell><Badge variant="outline">CRL</Badge></TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="min-w-[300px]"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center text-sm">8/11/25</TableCell>
                    <TableCell className="text-center text-sm">10</TableCell>
                    <TableCell><Badge variant="outline">250Virus.DEG.2</Badge></TableCell>
                    <TableCell className="text-center text-sm">Virus in UTM</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-center text-sm">251907 - Mix 1<br/>(Swapped in SP buffer)</TableCell>
                    <TableCell className="text-center text-sm">06.23.25 Mix 1</TableCell>
                    <TableCell className="text-center text-sm">2025.08.08 with Sigma cRNA</TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">G005_wPCR_005V2</Badge></TableCell>
                    <TableCell><Badge variant="outline">Porex</Badge></TableCell>
                    <TableCell className="text-center text-sm">500.00</TableCell>
                    <TableCell className="text-center text-sm">15887</TableCell>
                    <TableCell><Badge variant="outline">250</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">50k aRNA, sigma cRNA</Badge></TableCell>
                    <TableCell><Badge variant="outline">Sigma Lyo'd</Badge></TableCell>
                    <TableCell><Badge variant="outline">UTM</Badge></TableCell>
                    <TableCell><Badge variant="outline">CRL</Badge></TableCell>
                    <TableCell className="text-center text-sm"></TableCell>
                    <TableCell className="text-center text-sm"></TableCell>
                    <TableCell className="text-center text-sm"></TableCell>
                    <TableCell className="text-center text-sm"></TableCell>
                    <TableCell className="text-center text-sm"></TableCell>
                    <TableCell className="min-w-[300px]"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center text-sm">8/11/25</TableCell>
                    <TableCell className="text-center text-sm">11</TableCell>
                    <TableCell><Badge variant="outline">250Virus.EtOH.1</Badge></TableCell>
                    <TableCell className="text-center text-sm">Virus in UTM</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-center text-sm">251907 - Mix 1<br/>(Swapped in SP buffer)</TableCell>
                    <TableCell className="text-center text-sm">06.23.25 Mix 1</TableCell>
                    <TableCell className="text-center text-sm">2025.08.08 with Sigma cRNA</TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">G005_wPCR_005V2</Badge></TableCell>
                    <TableCell><Badge variant="outline">Porex</Badge></TableCell>
                    <TableCell className="text-center text-sm">500.00</TableCell>
                    <TableCell className="text-center text-sm">15899</TableCell>
                    <TableCell><Badge variant="outline">250</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">50k aRNA, sigma cRNA</Badge></TableCell>
                    <TableCell><Badge variant="outline">Sigma Lyo'd</Badge></TableCell>
                    <TableCell><Badge variant="outline">UTM</Badge></TableCell>
                    <TableCell><Badge variant="outline">CRL</Badge></TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="min-w-[300px]"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center text-sm">8/11/25</TableCell>
                    <TableCell className="text-center text-sm">12</TableCell>
                    <TableCell><Badge variant="outline">250Virus.EtOH.2</Badge></TableCell>
                    <TableCell className="text-center text-sm">Virus in UTM</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-center text-sm">251907 - Mix 1<br/>(Swapped in SP buffer)</TableCell>
                    <TableCell className="text-center text-sm">06.23.25 Mix 1</TableCell>
                    <TableCell className="text-center text-sm">2025.08.08 with Sigma cRNA</TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">G005_wPCR_005V2</Badge></TableCell>
                    <TableCell><Badge variant="outline">Porex</Badge></TableCell>
                    <TableCell className="text-center text-sm">500.00</TableCell>
                    <TableCell className="text-center text-sm">15873</TableCell>
                    <TableCell><Badge variant="outline">250</Badge></TableCell>
                    <TableCell><Badge variant="outline" className="text-red-600 border-red-600">50k aRNA, sigma cRNA</Badge></TableCell>
                    <TableCell><Badge variant="outline">Sigma Lyo'd</Badge></TableCell>
                    <TableCell><Badge variant="outline">UTM</Badge></TableCell>
                    <TableCell><Badge variant="outline">CRL</Badge></TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="text-center text-sm">inv</TableCell>
                    <TableCell className="min-w-[300px]"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className="min-w-[300px]"></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Results Section */}
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
                      <TableCell className="text-sm">Plate2_M1l_M2_M34_M7_20250506_150152_Amplification_20250506_164833.csv</TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>PCR Response</option>
                          <option>Hardware Status</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>5000Virus.DEG.1</option>
                          <option>5000Virus.DEG.2</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip content="Not Yet Built" side="bottom">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">Plate2_M1l_M2_M34_M7_20250506_150187_Amplification_20250506_164833.csv</TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>Hardware Status</option>
                          <option>PCR Response</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>5000Virus.DEG.1</option>
                          <option>5000Virus.DEG.2</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip content="Not Yet Built" side="bottom">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">Plate1_M2_M4_M5_M8_20250506_150236_Amplification Data_20250506_164601.csv</TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>PCR Response</option>
                          <option>Hardware Status</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>5000Virus.DEG.2</option>
                          <option>5000Virus.DEG.1</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip content="Not Yet Built" side="bottom">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">Plate1_M2_M4_M5_M8_20250506_150236_Amplification Data_20250506_164601.csv</TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>Hardware Status</option>
                          <option>PCR Response</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>5000Virus.DEG.2</option>
                          <option>5000Virus.DEG.1</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip content="Not Yet Built" side="bottom">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">Plate1_M2_M4_M5_M8_20250506_150236_Amplification Data_20250506_164601.csv</TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>PCR Response</option>
                          <option>Hardware Status</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>5000Virus.ETOH.2</option>
                          <option>5000Virus.DEG.1</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip content="Not Yet Built" side="bottom">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">Plate1_M2_M4_M5_M8_20250506_150236_Amplification Data_20250506_164601.csv</TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>Hardware Status</option>
                          <option>PCR Response</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>5000Virus.ETOH.2</option>
                          <option>5000Virus.DEG.1</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip content="Not Yet Built" side="bottom">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">Plate1_M2_M4_M5_M8_20250506_150236_Amplification Data_20250506_164601.csv</TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>PCR Response</option>
                          <option>Hardware Status</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>1000Virus.DEG.1</option>
                          <option>5000Virus.DEG.1</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip content="Not Yet Built" side="bottom">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">Plate1_M2_M4_M5_M8_20250506_150236_Amplification Data_20250506_164601.csv</TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>Hardware Status</option>
                          <option>PCR Response</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>1000Virus.DEG.1</option>
                          <option>5000Virus.DEG.1</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip content="Not Yet Built" side="bottom">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">Plate1_M2_M4_M5_M8_20250506_150236_Amplification Data_20250506_164601.csv</TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>PCR Response</option>
                          <option>Hardware Status</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>5000Virus.ETOH.2</option>
                          <option>5000Virus.DEG.1</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip content="Not Yet Built" side="bottom">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="text-sm">Plate1_M2_M4_M5_M8_20250506_150236_Amplification Data_20250506_164601.csv</TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>Hardware Status</option>
                          <option>PCR Response</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <select className="text-sm border border-border rounded px-2 py-1">
                          <option>1000Virus.DEG.2</option>
                          <option>5000Virus.DEG.1</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip content="Not Yet Built" side="bottom">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
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

              <div className="flex flex-wrap gap-2">
                <Card className="w-[260px] relative overflow-hidden">
                  <div className="bg-gray-300 border-b h-[200px]" />
                  <Tooltip content="Not Yet Built" side="bottom">
                    <Button variant="outline" size="sm" className="absolute top-2 right-2">
                      <Download className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  <CardHeader className="px-6 py-0 pt-6">
                    <CardTitle className="text-base font-semibold">file</CardTitle>
                    <CardDescription className="text-sm">120 MB</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                  </CardContent>
                </Card>

                <Card className="w-[260px] relative overflow-hidden">
                  <div className="bg-gray-300 border-b h-[200px]" />
                  <Tooltip content="Not Yet Built" side="bottom">
                    <Button variant="outline" size="sm" className="absolute top-2 right-2">
                      <Download className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  <CardHeader className="px-6 py-0 pt-6">
                    <CardTitle className="text-base font-semibold">file</CardTitle>
                    <CardDescription className="text-sm">120 MB</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                  </CardContent>
                </Card>

                <Card className="w-[260px] relative overflow-hidden">
                  <div className="bg-gray-300 border-b h-[200px]" />
                  <Tooltip content="Not Yet Built" side="bottom">
                    <Button variant="outline" size="sm" className="absolute top-2 right-2">
                      <Download className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  <CardHeader className="px-6 py-0 pt-6">
                    <CardTitle className="text-base font-semibold leading-tight">20250506_Multiplex_Buffer_83_95.jmp</CardTitle>
                    <CardDescription className="text-sm">120 MB</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                  </CardContent>
                </Card>

                <Card className="w-[260px] relative overflow-hidden">
                  <div className="bg-gray-300 border-b h-[200px]" />
                  <Tooltip content="Not Yet Built" side="bottom">
                    <Button variant="outline" size="sm" className="absolute top-2 right-2">
                      <Download className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  <CardHeader className="px-6 py-0 pt-6">
                    <CardTitle className="text-base font-semibold leading-tight">20250506_Multiplex_Buffer_83_95_Ct.jmp</CardTitle>
                    <CardDescription className="text-sm">120 MB</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6 w-[600px]">

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

        {/* Visualizations - Full Width Section */}
        {activeTab === "visualizations" && (
          <div className="w-full px-8 flex flex-col gap-8">
            {/* Visualization Cards Grid - First Row */}
            <div className="flex gap-8 w-full">
              <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">Run 1</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary">5000Virus.Deg.1</Badge>
                </div>
                <FluorescencePlot seed={1} />
              </div>

              <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">Run 2</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary">5000Virus.Deg.2</Badge>
                </div>
                <FluorescencePlot seed={2} />
              </div>

              <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">Run 3</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary">5000Virus.Deg.3</Badge>
                </div>
                <FluorescencePlot seed={3} />
              </div>
            </div>

            {/* Visualization Cards Grid - Second Row */}
            <div className="flex gap-8 w-full">
              <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">Run 4</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary">1000Virus.Deg.1</Badge>
                </div>
                <FluorescencePlot seed={4} />
              </div>

              <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">Run 5</p>
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="secondary">1000Virus.Deg.2</Badge>
                </div>
                <FluorescencePlot seed={5} />
              </div>

              {/* Empty placeholder to maintain grid */}
              <div className="flex-1 opacity-0">
                <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-4">
                  <div className="w-full aspect-[1364/1224]"></div>
                </div>
              </div>
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

              <div className="flex gap-2">
                <Card className="w-[260px] relative overflow-hidden">
                  <div className="bg-gray-300 border-b h-[200px]" />
                  <Tooltip content="Not Yet Built" side="bottom">
                    <Button variant="outline" size="sm" className="absolute top-2 right-2">
                      <Download className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  <CardHeader className="px-6 py-0 pt-6">
                    <CardTitle className="text-base font-semibold">file</CardTitle>
                    <CardDescription className="text-sm">120 MB</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                  </CardContent>
                </Card>

                <Card className="w-[260px] relative overflow-hidden">
                  <div className="bg-gray-300 border-b h-[200px]" />
                  <Tooltip content="Not Yet Built" side="bottom">
                    <Button variant="outline" size="sm" className="absolute top-2 right-2">
                      <Download className="w-4 h-4" />
                    </Button>
                  </Tooltip>
                  <CardHeader className="px-6 py-0 pt-6">
                    <CardTitle className="text-base font-semibold">file</CardTitle>
                    <CardDescription className="text-sm">120 MB</CardDescription>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

