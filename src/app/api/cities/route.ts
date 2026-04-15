import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      orderBy: { nameArabic: 'asc' },
    });
    return NextResponse.json(cities);
  } catch (error) {
    console.error('Get cities error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}