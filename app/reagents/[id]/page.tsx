"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/navigation";
import { Item } from "@/lib/types";
import { getItemById } from "@/lib/mock-db/db-helpers";
import CreateBaseReagentModal from "@/components/modals/create-base-reagent-modal";
import CreateCompositeReagentModal from "@/components/modals/create-composite-reagent-modal";
import CreateThermocyclerModal from "@/components/modals/create-thermocycler-modal";
import Link from "next/link";

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const loadItem = async () => {
    setIsLoading(true);
    try {
      const fetchedItem = await getItemById(resolvedParams.id);
      setItem(fetchedItem);
    } catch (error) {
      console.error("Failed to load item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
  }, [resolvedParams.id]);

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'BASE_REAGENT':
        return 'Base Reagent';
      case 'COMPOSITE_REAGENT':
        return 'Compound Reagent';
      case 'THERMOCYCLER':
        return 'Thermocycler';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation activePage="items" />
        <div className="p-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation activePage="items" />
        <div className="p-8">
          <p>Item not found</p>
          <Link href="/reagents">
            <Button variant="outline" className="mt-4">
              Back to Reagents
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation activePage="items" />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Link href="/reagents">
            <span className="text-muted-foreground hover:text-foreground cursor-pointer">
              Reagents
            </span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">{item.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{getTypeLabel(item.type)}</Badge>
                {item.categories.map((cat) => (
                  <Badge key={cat} variant="secondary">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
            <Button onClick={() => setEditModalOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>

          {/* Details */}
          <div className="bg-white rounded-lg border p-6 space-y-6">
            {/* Type-specific fields */}
            {item.type === 'COMPOSITE_REAGENT' && item.lotNumber && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Lot Number</h3>
                <p className="text-base">{item.lotNumber}</p>
              </div>
            )}

            {item.type === 'COMPOSITE_REAGENT' && item.reagents && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-3">Reagents</h3>
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Reagent Name</th>
                        <th className="text-left p-3 text-sm font-medium">Lot Number</th>
                        <th className="text-left p-3 text-sm font-medium">Concentration</th>
                        <th className="text-left p-3 text-sm font-medium">Volume</th>
                        <th className="text-left p-3 text-sm font-medium">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(item.reagents as any[]).map((reagent: any, idx: number) => (
                        <tr key={idx} className="border-t">
                          <td className="p-3 text-sm">{reagent.reagentId}</td>
                          <td className="p-3 text-sm">{reagent.lotNumber || '—'}</td>
                          <td className="p-3 text-sm">{reagent.concentration || '—'}</td>
                          <td className="p-3 text-sm">{reagent.volume || '—'}</td>
                          <td className="p-3 text-sm">{reagent.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {item.type === 'THERMOCYCLER' && (
              <>
                {item.instrumentId && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Instrument ID</h3>
                    <p className="text-base">{item.instrumentId}</p>
                  </div>
                )}
                {item.model && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">Model</h3>
                    <p className="text-base">{item.model}</p>
                  </div>
                )}
              </>
            )}

            {item.notes && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Description / Notes</h3>
                <p className="text-base whitespace-pre-wrap">{item.notes}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-1">Times Referenced</h3>
              <p className="text-base">{item.timesReferenced || 0}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Created</h3>
                <p className="text-base">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 mb-1">Last Edited</h3>
                <p className="text-base">{new Date(item.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modals */}
      {item.type === 'BASE_REAGENT' && (
        <CreateBaseReagentModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            loadItem();
            setEditModalOpen(false);
          }}
        />
      )}

      {item.type === 'COMPOSITE_REAGENT' && (
        <CreateCompositeReagentModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            loadItem();
            setEditModalOpen(false);
          }}
        />
      )}

      {item.type === 'THERMOCYCLER' && (
        <CreateThermocyclerModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            loadItem();
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

