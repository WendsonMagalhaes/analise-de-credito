export const SESSION_COOKIE = "sessao";

/**
 * Lê o "exp" do token SEM verificar a assinatura. Serve só para decidir, no
 * middleware, se vale mandar a pessoa para o login. A proteção de verdade é da
 * API: ela valida a assinatura em toda requisição.
 */
export function sessaoExpirada(token: string | undefined): boolean {
  if (!token) return true;
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(json) as { exp?: number };
    return typeof exp !== "number" || exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
