import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSession, isAdmin } from '@/lib/auth';
import { generateSearchText } from '@/lib/utils';
import { z } from 'zod';

const businessSchema = z.object({
  nameArabic: z.string().min(2),
  nameEnglish: z.string().min(2),
  descriptionArabic: z.string().optional(),
  descriptionEnglish: z.string().optional(),
  addressArabic: z.string().optional(),
  addressEnglish: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  cityId: z.string(),
  categoryId: z.string(),
  phones: z.array(z.object({
    number: z.string(),
    labelArabic: z.string().optional(),
    labelEnglish: z.string().optional(),
    isPrimary: z.boolean().optional(),
  })).optional(),
  hours: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
    isClosed: z.boolean().optional(),
  })).optional(),
  socialLinks: z.array(z.object({
    platform: z.enum(['FACEBOOK', 'INSTAGRAM', 'TWITTER', 'YOUTUBE', 'TIKTOK', 'LINKEDIN', 'WHATSAPP', 'TELEGRAM']),
    url: z.string().url(),
  })).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const categoryId = searchParams.get('categoryId');
    const cityId = searchParams.get('cityId');
    const status = searchParams.get('status') || 'ACTIVE';
    const search = searchParams.get('search');

    const where: any = {
      status,
    };

    if (categoryId) where.categoryId = categoryId;
    if (cityId) where.cityId = cityId;
    if (search) {
      where.searchText = {
        contains: search.toLowerCase(),
      };
    }

    const [businesses, total] = await Promise.all([
      prisma.businessProfile.findMany({
        where,
        include: {
          category: true,
          city: true,
          phones: true,
          media: {
            where: { type: 'IMAGE', status: 'APPROVED' },
            take: 1,
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.businessProfile.count({ where }),
    ]);

    return NextResponse.json({
      businesses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get businesses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = businessSchema.parse(body);

    const searchText = generateSearchText({
      nameArabic: data.nameArabic,
      nameEnglish: data.nameEnglish,
      descriptionArabic: data.descriptionArabic,
      descriptionEnglish: data.descriptionEnglish,
      addressArabic: data.addressArabic,
      addressEnglish: data.addressEnglish,
    });

    const business = await prisma.businessProfile.create({
      data: {
        ownerId: session.id,
        cityId: data.cityId,
        categoryId: data.categoryId,
        nameArabic: data.nameArabic,
        nameEnglish: data.nameEnglish,
        descriptionArabic: data.descriptionArabic || '',
        descriptionEnglish: data.descriptionEnglish || '',
        addressArabic: data.addressArabic,
        addressEnglish: data.addressEnglish,
        website: data.website || null,
        email: data.email || null,
        status: 'PENDING',
        searchText: searchText.toLowerCase(),
        phones: data.phones ? { create: data.phones } : undefined,
        hours: data.hours ? { create: data.hours } : undefined,
        socialLinks: data.socialLinks ? { create: data.socialLinks } : undefined,
      },
      include: {
        phones: true,
        hours: true,
        socialLinks: true,
      },
    });

    return NextResponse.json(business, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    console.error('Create business error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}