import { cookies } from "next/headers";
import { apiFetch } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session";

/** Token da sessão (cookie HttpOnly). Só funciona no servidor. */
export function tokenDaSessao(): string | undefined {
  return cookies().get(SESSION_COOKIE)?.value;
}

/** Chamada à API a partir de Server Actions e páginas de servidor: anexa o token da sessão. */
export function apiServer(path: string, init: RequestInit = {}): Promise<Response> {
  return apiFetch(path, init, tokenDaSessao());
}

export type EuLogado = { id: number; email: string; nome: string; papel: string };

/** Quem está logado (ou null). Usado pelo layout para mostrar o menu certo para cada papel. */
export async function usuarioLogado(): Promise<EuLogado | null> {
  if (!tokenDaSessao()) return null;
  try {
    const res = await apiServer("/api/auth/me", { cache: "no-store" });
    return res.ok ? ((await res.json()) as EuLogado) : null;
  } catch {
    return null;
  }
}
