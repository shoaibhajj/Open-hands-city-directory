import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/db';

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q || '';
  const page = parseInt(params.page || '1');
  const limit = 20;

  if (!query) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">الرجاء إدخال كلمة البحث</p>
      </div>
    );
  }

  const searchLower = query.toLowerCase();

  const [businesses, total] = await Promise.all([
    prisma.businessProfile.findMany({
      where: {
        status: 'ACTIVE',
        searchText: { contains: searchLower },
      },
      include: {
        category: true,
        phones: { where: { isPrimary: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.businessProfile.count({
      where: {
        status: 'ACTIVE',
        searchText: { contains: searchLower },
      },
    }),
  ]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/ar" className="text-xl font-bold">دليل النبك</Link>
          <Button variant="ghost" asChild><Link href="/ar">الرئيسية</Link></Button>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-primary/5 py-8">
        <div className="container mx-auto px-4">
          <form action="/ar/search" className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <Input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="ابحث عن شركات، محلات، مطاعم..."
                className="flex-1"
              />
              <Button type="submit">
                <Search className="w-4 h-4 ml-2" />
                بحث
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Results */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6">
          نتائج البحث عن "{query}"
        </h2>
        <p className="text-muted-foreground mb-6">{total} نتيجة</p>

        {businesses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Link key={business.id} href={`/ar/business/${business.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-4">
                    <h3 className="font-bold text-lg mb-1">{business.nameArabic}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{business.category.nameArabic}</p>
                    {business.phones[0] && (
                      <p className="text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {business.phones[0].number}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
              <Link key={i} href={`/ar/search?q=${query}&page=${i + 1}`}>
                <Button variant={page === i + 1 ? 'default' : 'outline'} size="sm">
                  {i + 1}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}