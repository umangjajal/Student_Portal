import { NextResponse } from "next/server";

export function middleware(request) {
  // 1. Get the token from cookies
  const token = request.cookies.get("token")?.value;

  // 2. Identify if the user is trying to access a protected route
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/university') ||
    request.nextUrl.pathname.startsWith('/student') ||
    request.nextUrl.pathname.startsWith('/faculty');

  // 3. If they are trying to access a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 4. Otherwise, let them proceed. The layout.jsx files will handle role-specific routing.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/university/:path*",
    "/student/:path*",
    "/faculty/:path*"
  ]
};