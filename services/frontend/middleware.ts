import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { BackendTokensLike } from '@/types/auth';

interface JWToken {
    backendTokens?: BackendTokensLike;
    accessTokenExpires?: number;
    error?: string;
    sub?: string;
}

// Rutas públicas que no requieren autenticación
const publicRoutes = ['/', '/login', '/register'];

// Rutas que solo usuarios autenticados NO deben acceder (redirect a home)
const authRoutes = ['/login', '/register'];

function matchesRoute(pathname: string, route: string) {
    if (route === '/') {
        return pathname === route;
    }

    return pathname === route || pathname.startsWith(`${route}/`);
}

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Obtener el token JWT de la cookie - compatible con Edge Runtime
    let isAuthenticated = false;
    let hasRefreshError = false;
    try {
        const token = await getToken({ req: request, secret: process.env.AUTH_SECRET }) as JWToken | null;
        hasRefreshError = token?.error === 'RefreshAccessTokenError';
        isAuthenticated = !!token?.backendTokens?.user && !hasRefreshError;
    } catch (error) {
        console.error('Middleware auth error:', error);
        isAuthenticated = false;
    }

    const isPublicRoute = publicRoutes.some(route => matchesRoute(pathname, route));
    const isAuthRoute = authRoutes.some(route => matchesRoute(pathname, route));

    // Al entrar a la app, llevar al dashboard si está autenticado, si no, dejar ver el landing page (/)
    if (pathname === '/') {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/apartamentos', request.url));
        }
        // Permitir ver el landing page a usuarios no autenticados
        return NextResponse.next();
    }

    // Si el usuario está autenticado e intenta acceder a login/register
    // redirigir al home
    if (isAuthenticated && isAuthRoute) {
        return NextResponse.redirect(new URL('/apartamentos', request.url));
    }

    // Si la ruta no es pública y el usuario NO está autenticado
    // redirigir al login con callbackUrl
    if (!isPublicRoute && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Permitir el acceso
    return NextResponse.next();
}

// Configurar qué rutas deben pasar por el middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.webp$).*)',
    ],
};
