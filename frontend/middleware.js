import { NextResponse } from "next/server";

export function middleware(request) {
  // Let client-side AuthContext + Layout handle protection
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
