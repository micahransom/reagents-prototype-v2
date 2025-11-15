"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CategoryCombobox from "@/components/category-combobox";
import { createItem, updateItem, deleteItem, getAllItems } from "@/lib/mock-db/db-helpers";
import { Item, ReagentRowWithId } from "@/lib/types";

interface CreateCompositeReagentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editItem?: Item;
}

export default function CreateCompositeReagentModal({
  isOpen,
  onClose,
  onSuccess,
  editItem,
}: CreateCompositeReagentModalProps) {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [lotNumber, setLotNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [reagentRows, setReagentRows] = useState<ReagentRowWithId[]>([
    { id: 'temp-initial-row', reagentId: '', lotNumber: '', concentration: '', volume: '', notes: '' }
  ]);
  const [inputAnother, setInputAnother] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baseReagents, setBaseReagents] = useState<Item[]>([]);
  const [loadingReagents, setLoadingReagents] = useState(true);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});
  const [focusedRow, setFocusedRow] = useState<string | null>(null);

  // Load all reagents (base and compound) for selection
  useEffect(() => {
    const loadReagents = async () => {
      try {
        const allItems = await getAllItems();
        // Filter to only base and compound reagents
        const reagents = allItems.filter(
          item => item.type === 'BASE_REAGENT' || item.type === 'COMPOSITE_REAGENT'
        );
        setBaseReagents(reagents);
      } catch (error) {
        console.error('Failed to load reagents:', error);
      } finally {
        setLoadingReagents(false);
      }
    };
    loadReagents();
  }, []);

  // Reset form when modal opens or editItem changes
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        // Populate form with edit data
        setName(editItem.name || "");
        setCategories(editItem.categories || []);
        setLotNumber(editItem.lotNumber || "");
        setNotes(editItem.notes || "");
        
        // Populate reagent rows
        if (editItem.reagents && Array.isArray(editItem.reagents)) {
          const rows = (editItem.reagents as Array<{
            reagentId: string;
            lotNumber?: string;
            concentration?: string;
            volume?: string;
            notes?: string;
          }>).map((r, index) => ({
            id: `existing-${index}`,
            reagentId: r.reagentId || '',
            lotNumber: r.lotNumber || '',
            concentration: r.concentration || '',
            volume: r.volume || '',
            notes: r.notes || '',
          }));
          // Add empty row at the end
          rows.push({ id: `row-${Date.now()}-${Math.random()}`, reagentId: '', lotNumber: '', concentration: '', volume: '', notes: '' });
          setReagentRows(rows);
        } else {
          setReagentRows([{ id: 'temp-initial-row', reagentId: '', lotNumber: '', concentration: '', volume: '', notes: '' }]);
        }
        setInputAnother(false);
      } else {
        // Reset for new creation
        setName("");
        setCategories([]);
        setLotNumber("");
        setNotes("");
        setReagentRows([{ id: 'temp-initial-row', reagentId: '', lotNumber: '', concentration: '', volume: '', notes: '' }]);
      }
      setError(null);
    }
  }, [isOpen, editItem]);

  const handleRowChange = (rowId: string, field: keyof ReagentRowWithId, value: string) => {
    setReagentRows(prevRows => {
      const rowIndex = prevRows.findIndex(r => r.id === rowId);
      if (rowIndex === -1) return prevRows;

      const updatedRows = [...prevRows];
      updatedRows[rowIndex] = { ...updatedRows[rowIndex], [field]: value };

      // If this is the last row and a reagent was selected, add a new empty row
      if (rowIndex === prevRows.length - 1 && field === 'reagentId' && value) {
        updatedRows.push({
          id: `row-${Date.now()}-${Math.random()}`,
          reagentId: '',
          lotNumber: '',
          concentration: '',
          volume: '',
          notes: '',
        });
      }

      return updatedRows;
    });
  };

  const handleRemoveRow = (rowId: string) => {
    setReagentRows(prevRows => {
      const filtered = prevRows.filter(r => r.id !== rowId);
      // Keep at least one row
      return filtered.length === 0 
        ? [{ id: 'temp-initial-row', reagentId: '', lotNumber: '', concentration: '', volume: '', notes: '' }]
        : filtered;
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    // Filter out empty rows (rows without a reagent selected)
    const validReagents = reagentRows
      .filter(row => row.reagentId) // Only keep rows with a reagent selected
      .map(({ id, ...rest }) => rest); // eslint-disable-line @typescript-eslint/no-unused-vars

    if (validReagents.length === 0) {
      setError("At least one reagent is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editItem) {
        // Update existing item
        await updateItem(editItem.id, {
          name: name.trim(),
          categories,
          lotNumber: lotNumber.trim() || undefined,
          reagents: validReagents,
          notes: notes.trim() || undefined,
        });
      } else {
        // Create new item
        await createItem({
          type: 'COMPOSITE_REAGENT',
          name: name.trim(),
          categories,
          lotNumber: lotNumber.trim() || undefined,
          reagents: validReagents,
          notes: notes.trim() || undefined,
        });
      }

      // Success!
      if (onSuccess) onSuccess();

      if (inputAnother && !editItem) {
        // Clear form including categories (only for create, not edit)
        setName("");
        setCategories([]);
        setLotNumber("");
        setNotes("");
        setReagentRows([{ id: 'temp-initial-row', reagentId: '', lotNumber: '', concentration: '', volume: '', notes: '' }]);
        setError(null);
      } else {
        // Close modal
        onClose();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!editItem) return;
    
    if (!confirm(`Are you sure you want to delete "${editItem.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await deleteItem(editItem.id);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-[948px] w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold text-slate-950">
              {editItem ? 'Edit Compound Reagent' : 'New Compound Reagent'}
            </h2>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-1 hover:bg-slate-100 rounded-sm"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-6">
              {/* Separator */}
              <div className="h-px bg-slate-300" />

              {/* Form Fields */}
              <div className="flex flex-col gap-8">
                {/* Name */}
                <div className="flex flex-col gap-2 max-w-[500px]">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-950">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Type"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Categories */}
                <div className="flex flex-col gap-2 max-w-[500px]">
                  <Label htmlFor="categories" className="text-sm font-medium text-slate-950">
                    Category / Categories
                  </Label>
                  <CategoryCombobox
                    key={categories.join(',')} 
                    value={categories}
                    onChange={setCategories}
                  />
                </div>

                {/* Lot Number */}
                <div className="flex flex-col gap-2 max-w-[500px]">
                  <Label htmlFor="lotNumber" className="text-sm font-medium text-slate-950">
                    Lot Number
                  </Label>
                  <Input
                    id="lotNumber"
                    type="text"
                    placeholder="Type"
                    value={lotNumber}
                    onChange={(e) => setLotNumber(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Reagents Table */}
                <div className="flex flex-col gap-2.5">
                  <Label className="text-sm font-medium text-slate-950">
                    Reagents
                  </Label>
                  <div className="border rounded-lg overflow-visible">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px]">
                            Reagent Name <span className="text-red-600">*</span>
                          </TableHead>
                          <TableHead className="w-[180px]">Lot Number</TableHead>
                          <TableHead className="w-[180px]">Concentration</TableHead>
                          <TableHead className="w-[180px]">Volume/Final Volume</TableHead>
                          <TableHead className="w-[220px]">Notes</TableHead>
                          <TableHead className="w-[40px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reagentRows.map((row) => {
                          const searchTerm = searchTerms[row.id] || '';
                          const selectedReagent = baseReagents.find(r => r.id === row.reagentId);
                          const isFocused = focusedRow === row.id;
                          
                          // Show all reagents if focused and no search, or filtered reagents if searching
                          const filteredReagents = searchTerm
                            ? baseReagents.filter(reagent =>
                                reagent.name.toLowerCase().includes(searchTerm.toLowerCase())
                              )
                            : baseReagents;
                          
                          const showDropdown = isFocused && !selectedReagent && filteredReagents.length > 0;
                          
                          return (
                          <TableRow key={row.id}>
                            <TableCell>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={selectedReagent ? selectedReagent.name : searchTerm}
                                  onChange={(e) => {
                                    setSearchTerms(prev => ({ ...prev, [row.id]: e.target.value }));
                                    if (!e.target.value) {
                                      handleRowChange(row.id, 'reagentId', '');
                                    }
                                  }}
                                  onFocus={() => {
                                    setFocusedRow(row.id);
                                  }}
                                  onBlur={() => {
                                    // Delay to allow click on dropdown item
                                    setTimeout(() => setFocusedRow(null), 200);
                                  }}
                                  placeholder="Type to search..."
                                  disabled={isSubmitting || loadingReagents}
                                  className="w-full border-none bg-transparent text-sm focus:outline-none focus:ring-0 p-2"
                                />
                                {showDropdown && (
                                  <div className="absolute top-full left-0 w-[300px] mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-[200px] overflow-y-auto z-[100]">
                                    {filteredReagents.map(reagent => (
                                      <button
                                        key={reagent.id}
                                        type="button"
                                        onMouseDown={(e) => {
                                          e.preventDefault(); // Prevent blur
                                          handleRowChange(row.id, 'reagentId', reagent.id);
                                          setSearchTerms(prev => ({ ...prev, [row.id]: '' }));
                                          setFocusedRow(null);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 border-b last:border-b-0"
                                      >
                                        <div className="font-medium">{reagent.name}</div>
                                        {reagent.categories.length > 0 && (
                                          <div className="text-xs text-slate-500">
                                            {reagent.categories.join(', ')}
                                          </div>
                                        )}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <input
                                type="text"
                                value={row.lotNumber}
                                onChange={(e) => handleRowChange(row.id, 'lotNumber', e.target.value)}
                                disabled={isSubmitting}
                                className="w-full border-none bg-transparent text-sm focus:outline-none focus:ring-0"
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="text"
                                value={row.concentration}
                                onChange={(e) => handleRowChange(row.id, 'concentration', e.target.value)}
                                disabled={isSubmitting}
                                className="w-full border-none bg-transparent text-sm focus:outline-none focus:ring-0"
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="text"
                                value={row.volume}
                                onChange={(e) => handleRowChange(row.id, 'volume', e.target.value)}
                                disabled={isSubmitting}
                                className="w-full border-none bg-transparent text-sm focus:outline-none focus:ring-0"
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="text"
                                value={row.notes || ''}
                                onChange={(e) => handleRowChange(row.id, 'notes', e.target.value)}
                                disabled={isSubmitting}
                                className="w-full border-none bg-transparent text-sm focus:outline-none focus:ring-0"
                              />
                            </TableCell>
                            <TableCell>
                              {reagentRows.length > 1 && row.reagentId && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRow(row.id)}
                                  disabled={isSubmitting}
                                  className="text-red-600 hover:text-red-700 text-sm"
                                >
                                  ×
                                </button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Description / Notes */}
                <div className="flex flex-col gap-2 max-w-[500px]">
                  <Label htmlFor="notes" className="text-sm font-medium text-slate-950">
                    Description / Notes
                  </Label>
                  <textarea
                    id="notes"
                    placeholder="Type"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={isSubmitting}
                    className="flex min-h-[100px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  />
                </div>
              </div>

              {/* Input Another Checkbox - Only show when creating */}
              {!editItem && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="input-another"
                    checked={inputAnother}
                    onCheckedChange={(checked) => setInputAnother(checked === true)}
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="input-another"
                    className="text-sm font-medium text-slate-950 cursor-pointer"
                  >
                    Input another compound reagent
                  </label>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-between">
                {/* Delete button - Only show when editing */}
                {editItem && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    Delete
                  </Button>
                )}
                
                <div className={`flex items-center gap-2 ${!editItem ? 'ml-auto' : ''}`}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !name.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting 
                      ? (editItem ? "Updating..." : "Creating...") 
                      : (editItem ? "Update" : `Create ${name.trim() || "[Name]"}`)
                    }
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

