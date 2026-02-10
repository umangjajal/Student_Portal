import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;

  // Only protect role areas
  const protectedRoutes = [
    "/admin",
    "/university",
    "/student",
    "/faculty"
  ];

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // ❗ ONLY block if NO token
  if (isProtected && !token) {
    return NextResponse.redirect(
      new URL("/auth/login", req.url)
    );
  }

  // ✅ DO NOTHING otherwise
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
