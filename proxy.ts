import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = Boolean(req.auth)
  const isAuthRoute = req.nextUrl.pathname.startsWith("/login")

  if (!isLoggedIn && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
