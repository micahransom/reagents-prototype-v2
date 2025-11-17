"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, ChevronRight, ChevronDown, Plus, ListFilter, ArrowUpDown, ArrowUp, ArrowDown, X } from "lucide-react";
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
import { Item, ItemType } from "@/lib/types";
import { getAllItems, ItemFilters } from "@/lib/mock-db/db-helpers";
import CreationMenu from "@/components/creation-menu";
import CreateBaseReagentModal from "@/components/modals/create-base-reagent-modal";
import CreateCompositeReagentModal from "@/components/modals/create-composite-reagent-modal";
import CreateThermocyclerModal from "@/components/modals/create-thermocycler-modal";
import BulkUploadModal from "@/components/modals/bulk-upload-modal";
import { TableSkeleton } from "@/components/ui/skeleton";
import ReagentsFilterSidebar from "@/components/reagents-filter-sidebar";

export default function ReagentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<ItemType>>(new Set());
  const [showCreationMenu, setShowCreationMenu] = useState(false);
  const [baseReagentModalOpen, setBaseReagentModalOpen] = useState(false);
  const [compositeReagentModalOpen, setCompositeReagentModalOpen] = useState(false);
  const [thermocyclerModalOpen, setThermocyclerModalOpen] = useState(false);
  const [bulkUploadModalOpen, setBulkUploadModalOpen] = useState(false);
  const [bulkUploadType, setBulkUploadType] = useState<'BASE_REAGENT' | 'THERMOCYCLER'>('BASE_REAGENT');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const newButtonRef = useRef<HTMLButtonElement>(null);

  // Filter state
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [editedBefore, setEditedBefore] = useState<Date | undefined>(undefined);
  const [editedAfter, setEditedAfter] = useState<Date | undefined>(undefined);

  // Column sorting
  type SortColumn = "name" | "referenced" | "edited";
  const [sortColumn, setSortColumn] = useState<SortColumn>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Sort items based on column and direction
  const sortItems = useCallback((items: Item[], column: SortColumn, direction: "asc" | "desc"): Item[] => {
    const sorted = [...items];
    
    switch (column) {
      case "name":
        return sorted.sort((a, b) => 
          direction === "asc" 
            ? a.name.localeCompare(b.name) 
            : b.name.localeCompare(a.name)
        );
      case "edited":
        return sorted.sort((a, b) => 
          direction === "asc"
            ? new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
            : new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "referenced":
        return sorted.sort((a, b) => 
          direction === "asc"
            ? (a.timesReferenced || 0) - (b.timesReferenced || 0)
            : (b.timesReferenced || 0) - (a.timesReferenced || 0)
        );
      default:
        return sorted;
    }
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Apply filters to API call
      const filters: ItemFilters = {};
      
      if (selectedCategories.length > 0) {
        filters.categories = selectedCategories;
      }
      
      if (editedBefore) {
        filters.dateBefore = editedBefore.toISOString();
      }
      
      if (editedAfter) {
        filters.dateAfter = editedAfter.toISOString();
      }
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      let allItems = await getAllItems(Object.keys(filters).length > 0 ? filters : undefined);
      
      // Apply client-side sorting
      allItems = sortItems(allItems, sortColumn, sortDirection);
      
      setItems(allItems);
      
      // Auto-expand folders that have items when filters are active
      const hasActiveFilters = selectedCategories.length > 0 || editedBefore || editedAfter || searchQuery;
      if (hasActiveFilters && allItems.length > 0) {
        const foldersWithItems = new Set<ItemType>();
        allItems.forEach(item => {
          foldersWithItems.add(item.type);
        });
        setExpandedFolders(foldersWithItems);
      }
    } catch (error) {
      console.error("Failed to load items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategories, editedBefore, editedAfter, searchQuery, sortColumn, sortDirection, sortItems]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreationTypeSelect = (type: ItemType) => {
    setEditingItem(null); // Clear any editing state
    switch (type) {
      case 'BASE_REAGENT':
        setBaseReagentModalOpen(true);
        break;
      case 'COMPOSITE_REAGENT':
        setCompositeReagentModalOpen(true);
        break;
      case 'THERMOCYCLER':
        setThermocyclerModalOpen(true);
        break;
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    switch (item.type) {
      case 'BASE_REAGENT':
        setBaseReagentModalOpen(true);
        break;
      case 'COMPOSITE_REAGENT':
        setCompositeReagentModalOpen(true);
        break;
      case 'THERMOCYCLER':
        setThermocyclerModalOpen(true);
        break;
    }
  };

  const handleOpenBulkUpload = (type: 'BASE_REAGENT' | 'THERMOCYCLER') => {
    setBulkUploadType(type);
    setBulkUploadModalOpen(true);
    // Close other modals
    setBaseReagentModalOpen(false);
    setThermocyclerModalOpen(false);
  };

  const toggleFolder = (type: ItemType) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedFolders(newExpanded);
  };

  const getFolderLabel = (type: ItemType): string => {
    switch (type) {
      case 'BASE_REAGENT':
        return 'Base Reagents';
      case 'COMPOSITE_REAGENT':
        return 'Compound Reagents';
      case 'THERMOCYCLER':
        return 'Thermocyclers';
    }
  };

  const handleColumnSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if clicking same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return sortDirection === "asc" 
      ? <ArrowUp className="w-4 h-4" />
      : <ArrowDown className="w-4 h-4" />;
  };

  // Group items by type
  const itemsByType = {
    COMPOSITE_REAGENT: items.filter(item => item.type === 'COMPOSITE_REAGENT'),
    BASE_REAGENT: items.filter(item => item.type === 'BASE_REAGENT'),
    THERMOCYCLER: items.filter(item => item.type === 'THERMOCYCLER'),
  };

  // Filter items within each type based on search
  const getFilteredItemsForType = (type: ItemType) => {
    const typeItems = itemsByType[type];
    if (!searchQuery) return typeItems;
    
    const query = searchQuery.toLowerCase();
    return typeItems.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.categories.some(cat => cat.toLowerCase().includes(query))
    );
  };

  // The three fixed folders in order
  const folders: ItemType[] = ['BASE_REAGENT', 'COMPOSITE_REAGENT', 'THERMOCYCLER'];

  // Count active filters
  const activeFilterCount = 
    selectedCategories.length + 
    (editedBefore ? 1 : 0) + 
    (editedAfter ? 1 : 0);

  const handleRemoveCategory = (categoryName: string) => {
    setSelectedCategories(selectedCategories.filter((c) => c !== categoryName));
  };

  const handleClearDateBefore = () => {
    setEditedBefore(undefined);
  };

  const handleClearDateAfter = () => {
    setEditedAfter(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activePage="items" />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-foreground">Reagents</span>
          <span className="text-muted-foreground">/</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-8">
        {/* Filter Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2"
              onClick={() => setFilterSidebarOpen(true)}
            >
              <ListFilter className="w-4 h-4" />
              <span className="text-xs font-medium">Filter</span>
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-semibold rounded-full h-4 min-w-5 px-1 flex items-center justify-center">
                  {activeFilterCount}
                </span>
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
          <Button 
            ref={newButtonRef}
            variant="outline" 
            size="sm" 
            onClick={() => setShowCreationMenu(!showCreationMenu)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
        </div>

        {/* Applied Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="gap-1 px-2 py-1 h-9 text-xs font-semibold"
              >
                <button
                  onClick={() => handleRemoveCategory(category)}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
                {category}
              </Badge>
            ))}
            {editedBefore && (
              <Badge
                variant="secondary"
                className="gap-1 px-2 py-1 h-9 text-xs font-semibold"
              >
                <button
                  onClick={handleClearDateBefore}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
                Before {editedBefore.toLocaleDateString()}
              </Badge>
            )}
            {editedAfter && (
              <Badge
                variant="secondary"
                className="gap-1 px-2 py-1 h-9 text-xs font-semibold"
              >
                <button
                  onClick={handleClearDateAfter}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
                After {editedAfter.toLocaleDateString()}
              </Badge>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <TableSkeleton rows={10} columns={5} />
        ) : (
          /* Table */
          <div className="border rounded-lg overflow-x-auto">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="w-[40px] border-0 px-2"></TableHead>
                  <TableHead 
                    className="w-[443px] border-0 px-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleColumnSort("name")}
                  >
                    <div className="flex items-center gap-2">
                      <span>Name</span>
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead className="w-[244px] border-0 px-4">Category</TableHead>
                  <TableHead 
                    className="w-[244px] border-0 px-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleColumnSort("referenced")}
                  >
                    <div className="flex items-center gap-2">
                      <span>Times Referenced</span>
                      {getSortIcon("referenced")}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="w-[244px] border-0 px-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => handleColumnSort("edited")}
                  >
                    <div className="flex items-center gap-2">
                      <span>Last Edited</span>
                      {getSortIcon("edited")}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {folders.map((folderType) => {
                  const isExpanded = expandedFolders.has(folderType);
                  const folderItems = getFilteredItemsForType(folderType);
                  
                  return (
                    <React.Fragment key={folderType}>
                      {/* Folder Row */}
                      <TableRow
                        className="cursor-pointer group border-b hover:bg-slate-50 h-[30px]"
                        onClick={() => toggleFolder(folderType)}
                      >
                        <TableCell className="border-0 h-[30px] p-0">
                          <div className="w-full h-full flex items-center justify-end px-2">
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium border-0 h-[30px] p-0">
                          <div className="flex items-center h-full px-2">
                            {getFolderLabel(folderType)}
                          </div>
                        </TableCell>
                        <TableCell className="border-0 h-[30px] p-0"></TableCell>
                        <TableCell className="border-0 h-[30px] p-0"></TableCell>
                        <TableCell className="border-0 h-[30px] p-0"></TableCell>
                      </TableRow>
                      
                      {/* Expanded Items */}
                      {isExpanded && folderItems.map((item) => (
                        <TableRow 
                          key={item.id}
                          className="border-b hover:bg-slate-100 h-[30px] bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => handleEditItem(item)}
                        >
                          <TableCell className="border-0 h-[30px] p-0"></TableCell>
                          <TableCell className="font-normal border-0 h-[30px] p-0">
                            <div className="flex items-center h-full px-2 pl-8">
                              {item.name}
                            </div>
                          </TableCell>
                          <TableCell className="border-0 h-[30px] p-0">
                            <div className="flex items-center gap-1 h-full px-2 flex-wrap">
                              {item.type === 'THERMOCYCLER' ? (
                                // Show model for thermocyclers
                                item.model ? (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.model}
                                  </Badge>
                                ) : (
                                  <span className="text-slate-400 text-sm">—</span>
                                )
                              ) : (
                                // Show categories for reagents
                                item.categories.length > 0 ? (
                                  item.categories.map((cat) => (
                                    <Badge key={cat} variant="secondary" className="text-xs">
                                      {cat}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-slate-400 text-sm">—</span>
                                )
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="border-0 h-[30px] p-0">
                            <div className="flex items-center h-full px-2">
                              {item.timesReferenced || 0}
                            </div>
                          </TableCell>
                          <TableCell className="border-0 h-[30px] p-0">
                            <div className="flex items-center h-full px-2">
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* Creation Menu */}
      <CreationMenu
        isOpen={showCreationMenu}
        onClose={() => setShowCreationMenu(false)}
        onSelectType={handleCreationTypeSelect}
        buttonRef={newButtonRef}
      />

      {/* Modals */}
      <CreateBaseReagentModal
        isOpen={baseReagentModalOpen}
        onClose={() => {
          setBaseReagentModalOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem?.type === 'BASE_REAGENT' ? editingItem : undefined}
        onSuccess={loadData}
        onOpenBulkUpload={() => handleOpenBulkUpload('BASE_REAGENT')}
      />

      <CreateCompositeReagentModal
        isOpen={compositeReagentModalOpen}
        onClose={() => {
          setCompositeReagentModalOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem?.type === 'COMPOSITE_REAGENT' ? editingItem : undefined}
        onSuccess={loadData}
      />

      <CreateThermocyclerModal
        isOpen={thermocyclerModalOpen}
        onClose={() => {
          setThermocyclerModalOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem?.type === 'THERMOCYCLER' ? editingItem : undefined}
        onSuccess={loadData}
        onOpenBulkUpload={() => handleOpenBulkUpload('THERMOCYCLER')}
      />

      <BulkUploadModal
        isOpen={bulkUploadModalOpen}
        onClose={() => setBulkUploadModalOpen(false)}
        onSuccess={loadData}
        type={bulkUploadType}
      />

      {/* Filter Sidebar */}
      <ReagentsFilterSidebar
        isOpen={filterSidebarOpen}
        onClose={() => setFilterSidebarOpen(false)}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        editedBefore={editedBefore}
        onEditedBeforeChange={setEditedBefore}
        editedAfter={editedAfter}
        onEditedAfterChange={setEditedAfter}
      />
    </div>
  );
}
