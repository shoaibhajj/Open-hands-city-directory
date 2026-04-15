import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadSchema = z.object({
  businessId: z.string(),
  type: z.enum(['IMAGE', 'VIDEO']),
  captionArabic: z.string().optional(),
  captionEnglish: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const businessId = formData.get('businessId') as string;
    const type = formData.get('type') as 'IMAGE' | 'VIDEO';
    const captionArabic = formData.get('captionArabic') as string;
    const captionEnglish = formData.get('captionEnglish') as string;

    if (!file || !businessId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify ownership
    const business = await prisma.businessProfile.findUnique({
      where: { id: businessId },
    });

    if (!business || business.ownerId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm'];
    
    if (type === 'IMAGE' && !allowedImageTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
    }
    if (type === 'VIDEO' && !allowedVideoTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid video type' }, { status: 400 });
    }

    // Check file size (10MB for images, 100MB for videos)
    const maxSize = type === 'VIDEO' ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64, {
      resource_type: type === 'VIDEO' ? 'video' : 'image',
      folder: `daleel-nabk/${businessId}`,
      transformation: type === 'IMAGE' ? [
        { width: 1200, height: 800, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' },
      ] : undefined,
    });

    // Create media record
    const media = await prisma.mediaFile.create({
      data: {
        businessId,
        type,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        thumbnailUrl: type === 'VIDEO' ? uploadResult.thumbnail_url : undefined,
        fileSize: file.size,
        width: uploadResult.width,
        height: uploadResult.height,
        duration: uploadResult.duration ? Math.round(uploadResult.duration) : undefined,
        status: type === 'VIDEO' ? 'PENDING' : 'APPROVED', // Videos need moderation
        captionArabic,
        captionEnglish,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId' }, { status: 400 });
    }

    const media = await prisma.mediaFile.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Get media error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}