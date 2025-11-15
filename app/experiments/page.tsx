"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ListFilter, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Navigation from "@/components/navigation";
import Link from "next/link";
import { ExperimentsFilterPanel, FilterOptions } from "@/components/experiments-filter-panel";

interface Experiment {
  id: string;
  title: string;
  type: string;
  targets: string[];
  items: string[];
  lastEdited: Date;
}

// Mock data - in a real app this would come from a database
const experimentsData: Experiment[] = [
  {
    id: "1",
    title: "20250814_NEAR.XML.Evaluation_CR",
    type: "Oscar",
    targets: ["COVID-19"],
    items: ["Tris-HCl pH 8.0", "Taq Polymerase"],
    lastEdited: new Date("2025-08-29"),
  },
  {
    id: "2",
    title: "20250512_MV_STI_PrimerScreening_SYBR",
    type: "RT-PCR",
    targets: ["STI Panel"],
    items: ["PBS pH 7.4", "Hot-Start Taq"],
    lastEdited: new Date("2025-08-28"),
  },
  {
    id: "3",
    title: "20250618_Combo_Testing_Target",
    type: "qPCR",
    targets: ["Strep A"],
    items: ["Tris-HCl pH 8.0", "SYBR Green I"],
    lastEdited: new Date("2025-08-27"),
  },
  {
    id: "4",
    title: "20250722_TTR_RT_ID_Time_Temp",
    type: "Oscar",
    targets: ["COVID-19", "Strep A"],
    items: ["Tris-HCl pH 8.0", "Taq Polymerase"],
    lastEdited: new Date("2025-08-26"),
  },
  {
    id: "5",
    title: "20250801_Influenza_Panel_Test",
    type: "RT-PCR",
    targets: ["COVID-19"],
    items: ["MgCl2", "Hot-Start Taq"],
    lastEdited: new Date("2025-08-25"),
  },
  {
    id: "6",
    title: "20250710_RSV_Detection_Study",
    type: "qPCR",
    targets: ["STI Panel"],
    items: ["PBS pH 7.4", "SYBR Green I"],
    lastEdited: new Date("2025-08-24"),
  },
  {
    id: "7",
    title: "20250615_Bacterial_Panel_Screen",
    type: "Oscar",
    targets: ["Strep A"],
    items: ["Tris-HCl pH 8.0", "Taq Polymerase", "MgCl2"],
    lastEdited: new Date("2025-08-23"),
  },
  {
    id: "8",
    title: "20250520_COVID_Variant_Analysis",
    type: "RT-PCR",
    targets: ["COVID-19"],
    items: ["PBS pH 7.4", "Hot-Start Taq"],
    lastEdited: new Date("2025-08-22"),
  },
];

type SortField = "title" | "type" | "lastEdited";
type SortDirection = "asc" | "desc";

export default function ExperimentsPage() {
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("lastEdited");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filters, setFilters] = useState<FilterOptions>({
    experimentTypes: [],
    targets: [],
    items: [],
    editedBefore: undefined,
    editedAfter: undefined,
  });

  // Calculate available options with counts
  const availableTargets = useMemo(() => {
    const targetCounts = new Map<string, number>();
    experimentsData.forEach((exp) => {
      exp.targets.forEach((target) => {
        targetCounts.set(target, (targetCounts.get(target) || 0) + 1);
      });
    });
    return Array.from(targetCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const availableExperimentTypes = useMemo(() => {
    const typeCounts = new Map<string, number>();
    experimentsData.forEach((exp) => {
      typeCounts.set(exp.type, (typeCounts.get(exp.type) || 0) + 1);
    });
    return Array.from(typeCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Get all items from the database with actual usage counts
  const availableItems = useMemo(() => {
    const itemCounts = new Map<string, number>();
    
    // Count occurrences of each item across all experiments
    experimentsData.forEach(exp => {
      exp.items.forEach(item => {
        itemCounts.set(item, (itemCounts.get(item) || 0) + 1);
      });
    });
    
    // Convert to array and sort alphabetically
    return Array.from(itemCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Filter and sort logic
  const filteredAndSortedExperiments = useMemo(() => {
    let result = [...experimentsData];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (exp) =>
          exp.title.toLowerCase().includes(query) ||
          exp.type.toLowerCase().includes(query) ||
          exp.targets.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Apply experiment type filter
    if (filters.experimentTypes.length > 0) {
      result = result.filter((exp) => filters.experimentTypes.includes(exp.type));
    }

    // Apply target filter
    if (filters.targets.length > 0) {
      result = result.filter((exp) =>
        exp.targets.some((target) => filters.targets.includes(target))
      );
    }

    // Apply item filter
    if (filters.items.length > 0) {
      result = result.filter((exp) =>
        exp.items.some((item) => filters.items.includes(item))
      );
    }

    // Apply date filters
    if (filters.editedBefore) {
      result = result.filter((exp) => exp.lastEdited <= filters.editedBefore!);
    }
    if (filters.editedAfter) {
      result = result.filter((exp) => exp.lastEdited >= filters.editedAfter!);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "lastEdited":
          comparison = a.lastEdited.getTime() - b.lastEdited.getTime();
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const activeFiltersCount =
    filters.experimentTypes.length +
    filters.targets.length +
    filters.items.length +
    (filters.editedBefore ? 1 : 0) +
    (filters.editedAfter ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation activePage="experiments" />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-foreground">Experiments</span>
          <span className="text-muted-foreground">/</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-8">
        {/* Filter Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(true)}
              className="relative"
            >
              <ListFilter className="w-4 h-4 mr-2" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge
                  variant="default"
                  className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            <div className="w-[373px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          <Link href="/experiments/new">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
              New Experiment
            </Button>
          </Link>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredAndSortedExperiments.length} of {experimentsData.length}{" "}
            experiments
          </p>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[443px]">
                  <button
                    onClick={() => handleSort("title")}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Title
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("type")}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Experiment Type
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("lastEdited")}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    Last Edited
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedExperiments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No experiments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedExperiments.map((exp) => (
                  <TableRow
                    key={exp.id}
                    onClick={() => router.push('/experiments/20250814_NEAR.XML.Evaluation_CR')}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{exp.title}</TableCell>
                    <TableCell>{exp.type}</TableCell>
                    <TableCell>{formatDate(exp.lastEdited)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      {/* Filter Panel */}
      <ExperimentsFilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        availableTargets={availableTargets}
        availableExperimentTypes={availableExperimentTypes}
        availableItems={availableItems}
      />
    </div>
  );
}
