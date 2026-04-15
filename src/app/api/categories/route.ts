import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession, isAdmin } from '@/lib/auth';
import { z } from 'zod';

const categorySchema = z.object({
  nameArabic: z.string().min(2),
  nameEnglish: z.string().min(2),
  descriptionArabic: z.string().optional(),
  descriptionEnglish: z.string().optional(),
  icon: z.string().optional(),
  parentId: z.string().optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const activeOnly = searchParams.get('active') !== 'false';

    const where: any = {};
    if (parentId === 'null') where.parentId = null;
    else if (parentId) where.parentId = parentId;
    if (activeOnly) where.isActive = true;

    const categories = await prisma.category.findMany({
      where,
      include: {
        children: {
          where: activeOnly ? { isActive: true } : undefined,
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { businesses: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdmin(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = categorySchema.parse(body);

    // Generate slugs
    const slugArabic = data.nameArabic.toLowerCase().replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\w-]/g, '');
    const slugEnglish = data.nameEnglish.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const category = await prisma.category.create({
      data: {
        ...data,
        slugArabic,
        slugEnglish,
        parentId: data.parentId || null,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}