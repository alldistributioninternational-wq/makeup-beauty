// src/proxy.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Changez "middleware" en "proxy"
export function proxy(request: NextRequest) {
  // Votre logique de proxy ici
  return NextResponse.next();
}

// Configuration optionnelle
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};