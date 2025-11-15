import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma, ItemType } from '@prisma/client';

// GET /api/items - Get all items with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as ItemType | null;
    const categoriesParam = searchParams.get('categories');
    const search = searchParams.get('search');
    const dateAfter = searchParams.get('dateAfter');
    const dateBefore = searchParams.get('dateBefore');

    // Build where clause
    const where: Prisma.ItemWhereInput = {};

    if (type) {
      where.type = type;
    }

    if (categoriesParam) {
      const categories = categoriesParam.split(',').map(c => c.trim());
      where.categories = {
        hasSome: categories,
      };
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (dateAfter) {
      where.updatedAt = {
        ...where.updatedAt,
        gte: new Date(dateAfter),
      };
    }

    if (dateBefore) {
      where.updatedAt = {
        ...where.updatedAt,
        lte: new Date(dateBefore),
      };
    }
    
    const items = await prisma.item.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST /api/items - Create a new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, categories, lotNumber, reagents, instrumentId, model, notes } = body;
    
    // Validate required fields
    if (!type || !name) {
      return NextResponse.json(
        { error: 'Type and name are required' },
        { status: 400 }
      );
    }

    // Type-specific validation
    if (type === 'COMPOSITE_REAGENT' && (!reagents || reagents.length === 0)) {
      return NextResponse.json(
        { error: 'Composite reagents must have at least one reagent' },
        { status: 400 }
      );
    }

    if (type === 'THERMOCYCLER' && !instrumentId) {
      return NextResponse.json(
        { error: 'Thermocyclers must have an instrument ID' },
        { status: 400 }
      );
    }

    // Validate reagent references for composite reagents
    if (type === 'COMPOSITE_REAGENT' && reagents) {
      const reagentIds = reagents.map((r: any) => r.reagentId);
      const existingReagents = await prisma.item.findMany({
        where: {
          id: { in: reagentIds },
          type: 'BASE_REAGENT',
        },
      });

      if (existingReagents.length !== reagentIds.length) {
        return NextResponse.json(
          { error: 'Some referenced reagents do not exist' },
          { status: 400 }
        );
      }
    }
    
    // Create item
    const item = await prisma.item.create({
      data: {
        type: type as ItemType,
        name,
        categories: categories || [],
        lotNumber: lotNumber || null,
        reagents: reagents ? (reagents as Prisma.InputJsonValue) : null,
        instrumentId: instrumentId || null,
        model: model || null,
        notes: notes || null,
      },
    });
    
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}


