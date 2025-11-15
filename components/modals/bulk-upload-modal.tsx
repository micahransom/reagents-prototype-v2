"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CategoryCombobox from "@/components/category-combobox";
import { createMultipleItems, THERMOCYCLER_MODELS } from "@/lib/mock-db/db-helpers";
import { ItemType } from "@/lib/types";

interface BulkRow {
  id: string;
  field1: string; // Name (base reagent) or Instrument ID (thermocycler)
  field2: string[] | string; // Categories array (base reagent) or Model string (thermocycler)
  field3: string; // Notes
}

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  type: 'BASE_REAGENT' | 'THERMOCYCLER';
}

export default function BulkUploadModal({
  isOpen,
  onClose,
  onSuccess,
  type,
}: BulkUploadModalProps) {
  const isBaseReagent = type === 'BASE_REAGENT';
  
  const [rows, setRows] = useState<BulkRow[]>([
    { id: '1', field1: '', field2: isBaseReagent ? [] : '', field3: '' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = isBaseReagent ? 'New Base Reagent' : 'New Thermocycler';
  const col1Title = isBaseReagent ? 'Name' : 'Instrument ID';
  const col2Title = isBaseReagent ? 'Category / Categories' : 'Thermocycler Model';

  // Reset form when modal opens or type changes
  useEffect(() => {
    if (isOpen) {
      setRows([
        { id: '1', field1: '', field2: isBaseReagent ? [] : '', field3: '' },
      ]);
      setError(null);
    }
  }, [isOpen, type, isBaseReagent]);

  const handleRowChange = (rowId: string, field: 'field1' | 'field2' | 'field3', value: string | string[]) => {
    setRows(prevRows => {
      const rowIndex = prevRows.findIndex(r => r.id === rowId);
      if (rowIndex === -1) return prevRows;

      const updatedRows = prevRows.map(row =>
        row.id === rowId ? { ...row, [field]: value } : row
      );

      // If this is the last row and field1 (name) was filled, add a new empty row
      if (rowIndex === prevRows.length - 1 && field === 'field1' && value) {
        updatedRows.push({
          id: `row-${Date.now()}`,
          field1: '',
          field2: isBaseReagent ? [] : '',
          field3: '',
        });
      }

      return updatedRows;
    });
  };

  const handleRemoveRow = (rowId: string) => {
    setRows(prevRows => {
      const filtered = prevRows.filter(r => r.id !== rowId);
      // Keep at least one row
      return filtered.length === 0
        ? [{ id: '1', field1: '', field2: isBaseReagent ? [] : '', field3: '' }]
        : filtered;
    });
  };

  const handleSubmit = async () => {
    // Filter out empty rows (rows where name/ID is empty)
    const validRows = rows.filter(row => row.field1.trim());

    if (validRows.length === 0) {
      setError("At least one entry is required");
      return;
    }

    // Validate thermocycler models
    if (!isBaseReagent) {
      const invalidModels = validRows.filter(row => 
        row.field2 && !THERMOCYCLER_MODELS.includes(row.field2 as any)
      );
      if (invalidModels.length > 0) {
        setError("Some thermocycler models are invalid");
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const items = validRows.map(row => {
        if (isBaseReagent) {
          return {
            type: 'BASE_REAGENT' as ItemType,
            name: row.field1.trim(),
            categories: Array.isArray(row.field2) ? row.field2 : [],
            notes: row.field3.trim() || undefined,
          };
        } else {
          return {
            type: 'THERMOCYCLER' as ItemType,
            name: row.field1.trim(),
            categories: [],
            instrumentId: row.field1.trim(),
            model: typeof row.field2 === 'string' ? row.field2.trim() || undefined : undefined,
            notes: row.field3.trim() || undefined,
          };
        }
      });

      await createMultipleItems(items);

      // Success!
      if (onSuccess) onSuccess();
      onClose();
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
        <div className="bg-white rounded-lg shadow-xl max-w-[840px] w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <h2 className="text-lg font-semibold text-slate-950">
              {title}
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

              {/* Description */}
              <p className="text-sm text-slate-600">
                Copy and paste columns from Excel.
              </p>

              {/* Table */}
              <div className="border rounded-lg overflow-visible">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[264px]">{col1Title}</TableHead>
                      <TableHead className="w-[264px]">{col2Title}</TableHead>
                      <TableHead className="w-[264px]">Description / Notes</TableHead>
                      <TableHead className="w-[40px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, idx) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <input
                            type="text"
                            value={row.field1}
                            onChange={(e) => handleRowChange(row.id, 'field1', e.target.value)}
                            disabled={isSubmitting}
                            className="w-full border-none bg-transparent text-sm focus:outline-none focus:ring-0 p-2"
                            placeholder="Type"
                          />
                        </TableCell>
                        <TableCell>
                          {isBaseReagent ? (
                            <div className="py-1">
                              <CategoryCombobox
                                key={`${row.id}-${Array.isArray(row.field2) ? row.field2.join(',') : ''}`}
                                value={Array.isArray(row.field2) ? row.field2 : []}
                                onChange={(categories) => handleRowChange(row.id, 'field2', categories)}
                              />
                            </div>
                          ) : (
                            <select
                              value={typeof row.field2 === 'string' ? row.field2 : ''}
                              onChange={(e) => handleRowChange(row.id, 'field2', e.target.value)}
                              disabled={isSubmitting}
                              className="w-full border-none bg-transparent text-sm focus:outline-none focus:ring-0 p-2"
                            >
                              <option value="">Select model...</option>
                              {THERMOCYCLER_MODELS.map((model) => (
                                <option key={model} value={model}>
                                  {model}
                                </option>
                              ))}
                            </select>
                          )}
                        </TableCell>
                        <TableCell>
                          <input
                            type="text"
                            value={row.field3}
                            onChange={(e) => handleRowChange(row.id, 'field3', e.target.value)}
                            disabled={isSubmitting}
                            className="w-full border-none bg-transparent text-sm focus:outline-none focus:ring-0 p-2"
                            placeholder="Type"
                          />
                        </TableCell>
                        <TableCell className="w-[40px]">
                          {rows.length > 1 && row.field1 && (
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
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Spacer */}
              <div className="h-[100px]"></div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2">
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
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting 
                    ? "Creating..." 
                    : `Create ${isBaseReagent ? 'Reagents' : 'Thermocyclers'}`
                  }
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

