import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { generateSearchText } from '@/lib/utils';
import { z } from 'zod';

const updateSchema = z.object({
  nameArabic: z.string().min(2).optional(),
  nameEnglish: z.string().min(2).optional(),
  descriptionArabic: z.string().optional(),
  descriptionEnglish: z.string().optional(),
  addressArabic: z.string().optional(),
  addressEnglish: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  cityId: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'ACTIVE', 'SUSPENDED']).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const business = await prisma.businessProfile.findUnique({
      where: { id },
      include: {
        category: true,
        city: true,
        phones: true,
        hours: {
          orderBy: { dayOfWeek: 'asc' },
        },
        socialLinks: true,
        media: {
          where: { status: 'APPROVED' },
        },
        owner: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    return NextResponse.json(business);
  } catch (error) {
    console.error('Get business error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const business = await prisma.businessProfile.findUnique({
      where: { id },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Check ownership or admin
    if (business.ownerId !== session.id && !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    // Update search text if name changes
    let searchText = business.searchText;
    if (data.nameArabic || data.nameEnglish || data.descriptionArabic || data.descriptionEnglish) {
      searchText = generateSearchText({
        nameArabic: data.nameArabic || business.nameArabic,
        nameEnglish: data.nameEnglish || business.nameEnglish,
        descriptionArabic: data.descriptionArabic || business.descriptionArabic,
        descriptionEnglish: data.descriptionEnglish || business.descriptionEnglish,
        addressArabic: data.addressArabic || business.addressArabic,
        addressEnglish: data.addressEnglish || business.addressEnglish,
      }).toLowerCase();
    }

    const updated = await prisma.businessProfile.update({
      where: { id },
      data: {
        ...data,
        website: data.website === '' ? null : data.website,
        email: data.email === '' ? null : data.email,
        searchText,
        status: data.status || business.status,
      },
      include: {
        phones: true,
        hours: true,
        socialLinks: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Update business error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const business = await prisma.businessProfile.findUnique({
      where: { id },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Check ownership or admin
    if (business.ownerId !== session.id && !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.businessProfile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete business error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}