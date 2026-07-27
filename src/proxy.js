import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export default async function proxy(request) {
  const response = NextResponse.next();
  const session = await getIronSession(request, response, sessionOptions);

  const isLoggedIn = Boolean(session.userId);
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isChangerMotDePassePage = request.nextUrl.pathname === "/changer-mot-de-passe";

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/chantiers", request.url));
  }

  if (isLoggedIn && session.doitChangerMotDePasse && !isChangerMotDePassePage) {
    return NextResponse.redirect(new URL("/changer-mot-de-passe", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
