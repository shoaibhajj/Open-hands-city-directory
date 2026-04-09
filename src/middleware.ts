import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isRTL } from '@/lib/i18n';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes, static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Get locale from path
  const segments = pathname.split('/').filter(Boolean);
  const locale = segments[0] === 'en' ? 'en' : 'ar';

  // Add locale header for server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);

  // Handle RTL
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set direction
  response.headers.set('x-rtl', isRTL(locale as 'ar' | 'en') ? '1' : '0');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};