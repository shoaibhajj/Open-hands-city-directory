import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Phone, Globe } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/db';

interface Props {
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function DirectoryPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const limit = 20;
  const categoryId = params.category;

  const where: any = { status: 'ACTIVE' };
  if (categoryId) where.categoryId = categoryId;

  const [businesses, categories, total] = await Promise.all([
    prisma.businessProfile.findMany({
      where,
      include: {
        category: true,
        city: true,
        phones: { where: { isPrimary: true } },
        media: {
          where: { type: 'IMAGE', status: 'APPROVED' },
          take: 1,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.businessProfile.count({ where }),
  ]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/ar" className="text-xl font-bold">دليل النبك</Link>
          <nav className="flex gap-4">
            <Button variant="ghost" asChild><Link href="/ar">الرئيسية</Link></Button>
            <Button variant="ghost" asChild><Link href="/ar/auth/signin">تسجيل الدخول</Link></Button>
          </nav>
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

      {/* Categories */}
      <section className="py-8 container mx-auto px-4">
        <h2 className="text-xl font-bold mb-4">الفئات</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/ar/directory">
            <Button variant={!categoryId ? 'default' : 'outline'} size="sm">
              الكل
            </Button>
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/ar/directory?category=${cat.id}`}>
              <Button variant={categoryId === cat.id ? 'default' : 'outline'} size="sm">
                {cat.icon && <span className="ml-1">{cat.icon}</span>}
                {cat.nameArabic}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      {/* Businesses List */}
      <section className="py-8 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            {categoryId 
              ? categories.find(c => c.id === categoryId)?.nameArabic 
              : 'جميع الأعمال'}
          </h2>
          <span className="text-muted-foreground">{total} نتيجة</span>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Link key={business.id} href={`/ar/business/${business.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-primary/40" />
                  </div>
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
              <Link key={i} href={`/ar/directory?page=${i + 1}${categoryId ? `&category=${categoryId}` : ''}`}>
                <Button variant={page === i + 1 ? 'default' : 'outline'} size="sm">
                  {i + 1}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}