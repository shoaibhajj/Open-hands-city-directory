import { redirect } from 'next/navigation';
import { getSession, isBusinessOwner } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import prisma from '@/lib/db';

export default async function OwnerDashboard() {
  const session = await getSession();
  
  if (!session || !isBusinessOwner(session)) {
    redirect('/ar/auth/signin');
  }

  const businesses = await prisma.businessProfile.findMany({
    where: { ownerId: session.id },
    include: { category: true, _count: { select: { media: true } } },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">لوحة تحكم صاحب العمل</h1>
          <nav className="flex gap-4">
            <Button asChild>
              <Link href="/ar/dashboard/owner/business/new">إضافة عمل جديد</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/ar">الرئيسية</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">أعمالي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{businesses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">نشط</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {businesses.filter(b => b.status === 'ACTIVE').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">في انتظار المراجعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {businesses.filter(b => b.status === 'PENDING').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">قائمة أعمالي</h2>
            <Button asChild>
              <Link href="/ar/dashboard/owner/business/new">إضافة عمل جديد</Link>
            </Button>
          </div>

          {businesses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground mb-4">لا يوجد لديك أي أعمال بعد</p>
                <Button asChild>
                  <Link href="/ar/dashboard/owner/business/new">أضف عملك الأول</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {businesses.map((business) => (
                <Card key={business.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">{business.nameArabic}</h3>
                        <p className="text-sm text-muted-foreground">{business.category.nameArabic}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          business.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          business.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {business.status === 'ACTIVE' ? 'نشط' :
                           business.status === 'PENDING' ? 'قيد المراجعة' :
                           business.status === 'SUSPENDED' ? 'موقوف' : 'مسودة'}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/ar/dashboard/owner/business/${business.id}`}>تعديل</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}