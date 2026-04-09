import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Globe, Mail, Clock } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/db';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BusinessPage({ params }: Props) {
  const { id } = await params;

  const business = await prisma.businessProfile.findUnique({
    where: { id, status: 'ACTIVE' },
    include: {
      category: true,
      city: true,
      phones: true,
      hours: { orderBy: { dayOfWeek: 'asc' } },
      socialLinks: true,
      media: {
        where: { status: 'APPROVED' },
      },
      owner: {
        select: { id: true, fullName: true },
      },
    },
  });

  if (!business) {
    notFound();
  }

  const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'Saturday'];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/ar" className="text-xl font-bold">دليل النبك</Link>
          <nav className="flex gap-4">
            <Button variant="ghost" asChild><Link href="/ar">الرئيسية</Link></Button>
            <Button variant="ghost" asChild><Link href="/ar/directory">الدليل</Link></Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover */}
            <div className="h-64 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
              {business.media[0] ? (
                <img 
                  src={business.media[0].url} 
                  alt={business.nameArabic}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <MapPin className="w-20 h-20 text-primary/40" />
              )}
            </div>

            {/* Business Name & Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{business.category.icon}</span>
                <span className="text-muted-foreground">{business.category.nameArabic}</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">{business.nameArabic}</h1>
              <p className="text-xl text-muted-foreground">{business.nameEnglish}</p>
            </div>

            {/* Description */}
            {business.descriptionArabic && (
              <div>
                <h2 className="text-lg font-bold mb-2">الوصف</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{business.descriptionArabic}</p>
              </div>
            )}

            {/* Address */}
            {business.addressArabic && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">العنوان</h3>
                  <p className="text-muted-foreground">{business.addressArabic}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-bold">معلومات التواصل</h3>
                
                {/* Phones */}
                {business.phones.length > 0 && (
                  <div className="space-y-2">
                    {business.phones.map((phone) => (
                      <div key={phone.id} className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <a href={`tel:${phone.number}`} className="hover:underline">
                          {phone.number}
                        </a>
                        {phone.labelArabic && (
                          <span className="text-xs text-muted-foreground">({phone.labelArabic})</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Email */}
                {business.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <a href={`mailto:${business.email}`} className="hover:underline">
                      {business.email}
                    </a>
                  </div>
                )}

                {/* Website */}
                {business.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      الموقع الإلكتروني
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Working Hours */}
            {business.hours.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    أوقات العمل
                  </h3>
                  <div className="space-y-2">
                    {business.hours.map((hour) => (
                      <div key={hour.id} className="flex justify-between text-sm">
                        <span>{dayNames[hour.dayOfWeek]}</span>
                        {hour.isClosed ? (
                          <span className="text-muted-foreground">مغلق</span>
                        ) : (
                          <span>{hour.openTime} - {hour.closeTime}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Links */}
            {business.socialLinks.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold mb-4">روابط التواصل الاجتماعي</h3>
                  <div className="space-y-2">
                    {business.socialLinks.map((link) => (
                      <a 
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-primary hover:underline"
                      >
                        {link.platform}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}