"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createItem, updateItem, deleteItem, THERMOCYCLER_MODELS } from "@/lib/mock-db/db-helpers";
import { Item } from "@/lib/types";

interface CreateThermocyclerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onOpenBulkUpload?: () => void;
  editItem?: Item;
}

export default function CreateThermocyclerModal({
  isOpen,
  onClose,
  onSuccess,
  onOpenBulkUpload,
  editItem,
}: CreateThermocyclerModalProps) {
  const [instrumentId, setInstrumentId] = useState("");
  const [model, setModel] = useState("");
  const [notes, setNotes] = useState("");
  const [inputAnother, setInputAnother] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens or editItem changes
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        // Populate form with edit data
        setInstrumentId(editItem.instrumentId || "");
        setModel(editItem.model || "");
        setNotes(editItem.notes || "");
        setInputAnother(false);
      } else {
        // Reset for new creation
        setInstrumentId("");
        setModel("");
        setNotes("");
      }
      setError(null);
    }
  }, [isOpen, editItem]);

  const handleSubmit = async () => {
    if (!instrumentId.trim()) {
      setError("Instrument ID is required");
      return;
    }

    if (!model) {
      setError("Thermocycler Model is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editItem) {
        // Update existing item
        await updateItem(editItem.id, {
          name: instrumentId.trim(),
          instrumentId: instrumentId.trim(),
          model,
          notes: notes.trim() || undefined,
        });
      } else {
        // Create new item
        await createItem({
          type: 'THERMOCYCLER',
          name: instrumentId.trim(), // Use instrument ID as name
          categories: [], // Thermocyclers don't have categories
          instrumentId: instrumentId.trim(),
          model,
          notes: notes.trim() || undefined,
        });
      }

      // Success!
      if (onSuccess) onSuccess();

      if (inputAnother && !editItem) {
        // Clear form (only for create, not edit)
        setInstrumentId("");
        setModel("");
        setNotes("");
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
    
    if (!confirm(`Are you sure you want to delete thermocycler "${editItem.instrumentId}"? This action cannot be undone.`)) {
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
        <div className="bg-white rounded-lg shadow-xl max-w-[425px] w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-lg font-semibold text-slate-950">
                {editItem ? 'Edit Thermocycler' : 'New Thermocycler'}
              </h2>
              {!editItem && (
                <button
                  type="button"
                  onClick={onOpenBulkUpload}
                  className="text-sm text-blue-600 hover:text-blue-700 text-left"
                >
                  Bulk Upload
                </button>
              )}
            </div>
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
                {/* Instrument ID */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="instrumentId" className="text-sm font-medium text-slate-950">
                    Instrument ID
                  </Label>
                  <Input
                    id="instrumentId"
                    type="text"
                    placeholder="Type"
                    value={instrumentId}
                    onChange={(e) => setInstrumentId(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Thermocycler Model */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="model" className="text-sm font-medium text-slate-950">
                    Thermocycler Model
                  </Label>
                  <select
                    id="model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={isSubmitting}
                    className="flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select model...</option>
                    {THERMOCYCLER_MODELS.map((modelOption) => (
                      <option key={modelOption} value={modelOption}>
                        {modelOption}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description / Notes */}
                <div className="flex flex-col gap-2">
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
                    Input another thermocycler
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
                    disabled={isSubmitting || !instrumentId.trim() || !model}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting 
                      ? (editItem ? "Updating..." : "Creating...") 
                      : (editItem ? "Update" : `Create ${instrumentId.trim() || "[ID]"}`)
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

