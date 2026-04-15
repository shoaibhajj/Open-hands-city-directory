import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import redis from '@/lib/redis';
import PDFDocument from 'pdfkit';

export async function GET() {
  try {
    const cacheKey = 'pdf:businesses:all';
    
    // Try to get cached PDF
    const cachedPdf = await redis.get(cacheKey);
    if (cachedPdf) {
      return new NextResponse(cachedPdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="daleel-nabk.pdf"',
        },
      });
    }

    // Get all active businesses grouped by category
    const businesses = await prisma.businessProfile.findMany({
      where: { status: 'ACTIVE' },
      include: {
        category: true,
        phones: { where: { isPrimary: true } },
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { nameArabic: 'asc' }],
    });

    // Group by category
    const groupedByCategory = businesses.reduce((acc, business) => {
      const catName = business.category.nameArabic;
      if (!acc[catName]) acc[catName] = [];
      acc[catName].push(business);
      return acc;
    }, {} as Record<string, typeof businesses>);

    // Generate PDF
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50,
        info: {
          Title: 'دليل النبك',
          Author: 'Daleel Al-Nabk',
        }
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(24).text('دليل النبك', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text('دليل شركات وأعمال مدينة النبك', { align: 'center' });
      doc.moveDown(2);

      // Content
      for (const [category, items] of Object.entries(groupedByCategory)) {
        // Category header
        doc.fontSize(16).fillColor('#0369a1').text(category);
        doc.moveDown(0.5);

        // Businesses
        doc.fontSize(10).fillColor('#000');
        for (const business of items) {
          doc.text(`• ${business.nameArabic}`, { indent: 20 });
          if (business.phones[0]) {
            doc.text(`  الهاتف: ${business.phones[0].number}`, { indent: 20 });
          }
          if (business.addressArabic) {
            doc.text(`  العنوان: ${business.addressArabic}`, { indent: 20 });
          }
          doc.moveDown(0.3);
        }
        doc.moveDown();
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(8).fillColor('#666');
      doc.text(`تم إنشاء الدليل في: ${new Date().toLocaleDateString('ar')}`, { align: 'center' });

      doc.end();
    });

    // Cache for 6 hours
    await redis.set(cacheKey, pdfBuffer.toString('base64'), 'EX', 6 * 60 * 60);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="daleel-nabk.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}