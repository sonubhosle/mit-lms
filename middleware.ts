import { NextResponse } from "next/server"
import { jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "7f5e8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e"
)

export async function middleware(req) {
  const { pathname } = req.nextUrl

  const token = req.cookies.get("auth_token")?.value

  // 1. If trying to access login/signup/setup while already authenticated
  if (token && (pathname === "/login" || pathname === "/signup" || pathname === "/setup")) {
    try {
      await jwtVerify(token, SECRET)
      return NextResponse.redirect(new URL("/", req.url))
    } catch (err) {
      // Token invalid, allow access to login
    }
  }

  // 2. Clear pass for public paths
  if (
    pathname === "/login" || 
    pathname === "/signup" || 
    pathname === "/setup" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets")
  ) {
    return NextResponse.next()
  }

  // Redirect to login if unauthenticated
  if (!token) {
    const url = new URL("/login", req.url)
    return NextResponse.redirect(url)
  }

  try {
    const { payload: session } = await jwtVerify(token, SECRET)

    // Role-based gate
    const ADMIN_ONLY_PREFIXES = ["/settings", "/audit-logs", "/api/users"]
    const isRestricted = ADMIN_ONLY_PREFIXES.some(prefix => pathname.startsWith(prefix))

    if (isRestricted && session?.role !== "superadmin") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  } catch (err) {
    const res = NextResponse.redirect(new URL("/login", req.url))
    res.cookies.delete("auth_token")
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all requests except:
     * 1. Static files (_next/static, favicon.ico, etc.)
     * 2. Image assets
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.png|assets).*)",
  ],
}
