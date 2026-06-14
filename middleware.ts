import { NextRequest, NextResponse } from "next/server";
import { isAuthorized } from "@/lib/middleware-auth";

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };

export function middleware(req: NextRequest) {
  if (isAuthorized(req.headers.get("authorization"), process.env.ADMIN_PASSWORD)) {
    return NextResponse.next();
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="DeFiGrail Admin"' },
  });
}
