import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories - Get unique categories from all items
export async function GET(request: NextRequest) {
  try {
    const items = await prisma.item.findMany({
      select: {
        categories: true,
      },
    });
    
    // Extract unique categories
    const categoriesSet = new Set<string>();
    items.forEach(item => {
      item.categories.forEach(category => {
        categoriesSet.add(category);
      });
    });
    
    const categories = Array.from(categoriesSet).sort();
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
