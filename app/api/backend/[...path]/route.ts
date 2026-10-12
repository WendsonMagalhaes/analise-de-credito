import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/**
 * Proxy para a API. O navegador só conhece /api/backend/...; aqui conferimos o cookie
 * de sessão (HttpOnly) e repassamos para a API real com "Authorization: Bearer".
 * Assim o endereço da API e o token nunca aparecem para o navegador, e quem não está
 * logado não passa daqui.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const LEITURA = new Set(["GET", "HEAD"]);

async function encaminhar(req: NextRequest): Promise<NextResponse> {
  const base = (process.env.API_URL ?? "").replace(/\/$/, "");
  if (!base) return NextResponse.json({ detail: "API_URL não configurada." }, { status: 500 });

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.json({ detail: "Não autenticado." }, { status: 401 });

  // Proteção extra contra CSRF: escrita só se vier do próprio site.
  if (!LEITURA.has(req.method)) {
    const origem = req.headers.get("origin");
    if (origem && new URL(origem).host !== req.headers.get("host")) {
      return NextResponse.json({ detail: "Origem não permitida." }, { status: 403 });
    }
  }

  // Só repassa caminhos /api/... (o resto da API, como /docs, não é acessível por aqui).
  const caminho = req.nextUrl.pathname.replace(/^\/api\/backend/, "");
  if (!caminho.startsWith("/api/") || /(^|\/)\.\.(\/|$)/.test(caminho)) {
    return NextResponse.json({ detail: "Rota inválida." }, { status: 400 });
  }

  const headers = new Headers({ Authorization: `Bearer ${token}` });
  for (const nome of ["content-type", "accept"]) {
    const valor = req.headers.get(nome);
    if (valor) headers.set(nome, valor);
  }

  const init: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers,
    cache: "no-store",
    redirect: "manual",
  };
  if (!LEITURA.has(req.method)) {
    init.body = req.body; // repassa o corpo em stream (uploads de planilha)
    init.duplex = "half";
  }

  let resposta: Response;
  try {
    resposta = await fetch(`${base}${caminho}${req.nextUrl.search}`, init);
  } catch {
    return NextResponse.json({ detail: "API indisponível." }, { status: 502 });
  }

  const saida = new Headers({ "cache-control": "no-store" });
  for (const nome of ["content-type", "content-disposition"]) {
    const valor = resposta.headers.get(nome);
    if (valor) saida.set(nome, valor);
  }
  const res = new NextResponse(resposta.body, { status: resposta.status, headers: saida });
  if (resposta.status === 401) res.cookies.delete(SESSION_COOKIE); // sessão não vale mais
  return res;
}

export const GET = encaminhar;
export const POST = encaminhar;
export const PUT = encaminhar;
export const PATCH = encaminhar;
export const DELETE = encaminhar;
