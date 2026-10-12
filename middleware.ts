import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessaoExpirada } from "@/lib/session";

/**
 * Porteiro das PÁGINAS: sem sessão válida, vai para /login. Isso é conforto de
 * navegação; os dados em si ficam protegidos pela API (que exige o token) e pelo
 * proxy /api/backend (que exige o cookie).
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const logado = !sessaoExpirada(token);

  if (pathname === "/login") {
    return logado ? NextResponse.redirect(new URL("/dashboard", req.url)) : NextResponse.next();
  }

  if (!logado) {
    const url = new URL("/login", req.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete(SESSION_COOKIE); // cookie vencido: limpa
    return res;
  }
  return NextResponse.next();
}

export const config = {
  // tudo, menos arquivos estáticos e o proxy (que responde 401 em JSON por conta própria)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/backend).*)"],
};
