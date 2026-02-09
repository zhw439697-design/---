import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if the user is trying to access a protected route
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        const authToken = request.cookies.get('auth_token');

        // If no token exists, redirect to login
        if (!authToken) {
            const loginUrl = new URL('/login', request.url);
            // Optional: Add duplicate query param to redirect back after login
            // loginUrl.searchParams.set('from', request.nextUrl.pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
