import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, ItemType } from '@prisma/client';

// GET /api/items/[id] - Get a single item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.item.findUnique({
      where: { id },
    });
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

// PUT /api/items/[id] - Update an item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, categories, lotNumber, reagents, instrumentId, model, notes } = body;
    
    // Build update data
    const data: any = {};
    
    if (name !== undefined) data.name = name;
    if (categories !== undefined) data.categories = categories;
    if (lotNumber !== undefined) data.lotNumber = lotNumber || null;
    if (reagents !== undefined) data.reagents = reagents ? (reagents as Prisma.InputJsonValue) : null;
    if (instrumentId !== undefined) data.instrumentId = instrumentId || null;
    if (model !== undefined) data.model = model || null;
    if (notes !== undefined) data.notes = notes || null;
    
    const item = await prisma.item.update({
      where: { id },
      data,
    });
    
    return NextResponse.json(item);
  } catch (error) {
    console.error('Error updating item:', error);
    
    // Handle not found
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] - Delete an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.item.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    
    // Handle not found
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}

