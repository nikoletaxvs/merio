import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, isValidSessionToken } from "@/lib/auth-tokens";
import { isDemoMode } from "@/lib/demo-mode";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!(await isValidSessionToken(token))) {
    const entry = isDemoMode() ? "/demo" : "/login";

    return NextResponse.redirect(new URL(entry, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
