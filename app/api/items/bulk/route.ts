import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, ItemType } from '@prisma/client';

// POST /api/items/bulk - Create multiple items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Validate all items
    for (const item of items) {
      if (!item.type || !item.name) {
        return NextResponse.json(
          { error: 'Each item must have a type and name' },
          { status: 400 }
        );
      }
    }

    // Create all items in a transaction
    const createdItems = await prisma.$transaction(
      items.map((item: any) =>
        prisma.item.create({
          data: {
            type: item.type as ItemType,
            name: item.name,
            categories: item.categories || [],
            lotNumber: item.lotNumber || null,
            reagents: item.reagents ? (item.reagents as Prisma.InputJsonValue) : null,
            instrumentId: item.instrumentId || null,
            model: item.model || null,
            notes: item.notes || null,
          },
        })
      )
    );
    
    return NextResponse.json(createdItems, { status: 201 });
  } catch (error) {
    console.error('Error creating items:', error);
    return NextResponse.json(
      { error: 'Failed to create items' },
      { status: 500 }
    );
  }
}

