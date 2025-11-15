import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        "animate-pulse",
        className
      )}
      style={{
        background: "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)",
        backgroundSize: "1000px 100%",
        animation: "shimmer 2s infinite linear",
      }}
    />
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 3 }: TableSkeletonProps) {
  return (
    <div className="border rounded-lg">
      <div className="border-b">
        <div className="flex">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1 p-4">
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
      <div>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b last:border-b-0">
            <div className="flex">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="flex-1 p-4">
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryItemsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search and filter area */}
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-64" />
      </div>

      {/* Category rows */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          {/* Nested items */}
          <div className="ml-8 space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-10 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ItemDetailSkeleton() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-4 w-32 mb-4" />
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-10 w-96" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-full max-w-2xl" />
      </div>

      {/* Content sections */}
      <div className="space-y-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-6 w-40 mb-3" />
            <Skeleton className="h-10 w-full max-w-xl" />
          </div>
        ))}
      </div>

      {/* Table section */}
      <div className="mt-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <TableSkeleton rows={3} columns={4} />
      </div>
    </div>
  );
}

