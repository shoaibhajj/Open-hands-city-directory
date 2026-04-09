import { redirect } from 'next/navigation';
import { getSession, isAdmin } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await getSession();
  
  if (!session || !isAdmin(session)) {
    redirect('/ar/auth/signin');
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">لوحة الإدارة</h1>
          <nav className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/ar/dashboard/admin/users">المستخدمون</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/ar/dashboard/admin/businesses">الأعمال</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/ar/dashboard/admin/categories">الفئات</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/ar/dashboard/admin/media">الوسائط</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/ar">العودة للرئيسية</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">الأعمال النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">في انتظار المراجعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">الفئات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">14</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Button asChild>
                  <Link href="/ar/dashboard/admin/businesses">إدارة الأعمال</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/ar/dashboard/admin/categories">إدارة الفئات</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>آخر النشاطات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">لا توجد نشاطات حديثة</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}