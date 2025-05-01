import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip middleware for public assets
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.match(/\.(png|jpg|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Define public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/auth/error"];
  const isApiAuthRoute = request.nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute =
    publicRoutes.includes(request.nextUrl.pathname) ||
    request.nextUrl.pathname.startsWith("/claim");

  // Always allow access to public routes and auth API routes
  if (isPublicRoute || isApiAuthRoute) {
    return NextResponse.next();
  }

  // For authenticated users, prevent access to login page
  if (token && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/groups", request.url));
  }

  // For unauthenticated users, require login for protected routes
  if (!token && !isPublicRoute && !isApiAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Enhanced debugging for API routes related to groups
  if (request.nextUrl.pathname.startsWith("/api/groups")) {
    console.log(`[API Request] ${request.method} ${request.nextUrl.pathname}`);

    // Token debug info
    if (token) {
      console.log(`[API Auth] Valid token present for user: ${token.sub}`);
      console.log(`[API Auth] Token expiry: ${token.exp}`);
    } else {
      console.log(`[API Auth] No valid token found`);
    }

    // Check for authentication cookies with detailed debugging
    const sessionCookie = request.cookies.get("next-auth.session-token");
    if (sessionCookie) {
      console.log(`[API Auth] Session cookie present: ${sessionCookie.name}`);
      console.log(
        `[API Auth] Cookie value length: ${sessionCookie.value.length}`
      );
    } else {
      console.log(`[API Auth] Session cookie missing`);
    }

    // Capture requested group ID if present in URL
    const matches = request.nextUrl.pathname.match(/\/api\/groups\/([^\/]+)/);
    if (matches && matches[1]) {
      console.log(`[API Group] Requested group ID: ${matches[1]}`);
    }

    // Continue with request and add debugging headers
    const response = NextResponse.next();
    response.headers.set("X-API-Version", "1.0");
    response.headers.set("X-Request-Path", request.nextUrl.pathname);
    response.headers.set("X-Request-ID", crypto.randomUUID());
    response.headers.set(
      "X-Auth-Status",
      token ? "authenticated" : "unauthenticated"
    );

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|public|favicon.ico).*)"],
};
