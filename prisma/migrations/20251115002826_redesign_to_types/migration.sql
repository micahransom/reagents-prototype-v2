-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('BASE_REAGENT', 'COMPOSITE_REAGENT', 'THERMOCYCLER');

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "type" "ItemType" NOT NULL,
    "name" TEXT NOT NULL,
    "categories" TEXT[],
    "timesReferenced" INTEGER NOT NULL DEFAULT 0,
    "lotNumber" TEXT,
    "reagents" JSONB,
    "instrumentId" TEXT,
    "model" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "items_type_idx" ON "items"("type");

-- CreateIndex
CREATE INDEX "items_categories_idx" ON "items"("categories");
