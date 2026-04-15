import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Phone, Globe } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
            دليل النبك
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            دليلكم لأفضل الشركات والأعمال في مدينة النبك
          </p>
          
          {/* Search Form */}
          <form className="max-w-2xl mx-auto" action="/ar/search">
            <div className="flex gap-2">
              <Input
                type="search"
                name="q"
                placeholder="ابحث عن شركات، محلات، مطاعم..."
                className="flex-1"
              />
              <Button type="submit" size="lg">
                <Search className="w-4 h-4 ml-2" />
                بحث
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">الفئات</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['مطاعم', 'مقاهي', 'محلات تجارية', 'خدمات', 'صحة', 'تعليم', 'سياحة', 'طعام'].map((category) => (
            <Link key={category} href={`/ar/directory?category=${category}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer text-center py-6">
                <CardContent>
                  <div className="text-lg font-medium">{category}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Businesses */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">أعمال مميزة</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-primary/40" />
                </div>
                <CardContent className="pt-4">
                  <h3 className="font-bold text-lg mb-2">مطعم النبك</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    أشهى المأكولات المحلية والعربية
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      النبك
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      011-1234567
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 container mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">هل تملك عملاً في النبك؟</h2>
        <p className="text-muted-foreground mb-6">
          أضف عملك إلى دليل النبك وواصل المزيد من العملاء
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/ar/auth/signup">إنشاء حساب</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/ar/directory">تصفح الدليل</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}