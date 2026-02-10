import { NextResponse } from "next/server";

export function middleware(req) {
  // ✅ Allow all requests to proceed
  // Client-side auth guards (withRoleLayout, AdminLayout) will handle authorization
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
