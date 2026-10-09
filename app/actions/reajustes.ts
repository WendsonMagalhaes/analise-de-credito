"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "@/lib/api";

/**
 * Server Actions para reajuste de limite: a mutation roda no servidor
 * Next.js (não no browser do analista) e chama a API FastAPI a partir
 * de lá. Isso tira do client bundle a URL/porta interna da API e
 * concentra a lógica de "o que acontece depois de aprovar" (revalidar a
 * página) num único lugar, em vez de cada componente cliente repetir o
 * fetch + tratamento de erro.
 */

export async function aprovarReajusteAction(reajusteId: number, aprovadoPor: string) {
  const res = await fetch(`${API_URL}/api/reajustes-limite/${reajusteId}/aprovar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aprovado_por: aprovadoPor || null }),
  });
  if (!res.ok) {
    const corpo = await res.json().catch(() => null);
    throw new Error(corpo?.detail || "Falha ao aprovar reajuste de limite.");
  }
  revalidatePath("/creditos");
  revalidatePath("/dashboard");
}

export async function rejeitarReajusteAction(reajusteId: number, aprovadoPor: string) {
  const res = await fetch(`${API_URL}/api/reajustes-limite/${reajusteId}/rejeitar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ aprovado_por: aprovadoPor || null }),
  });
  if (!res.ok) throw new Error("Falha ao rejeitar reajuste de limite.");
  revalidatePath("/creditos");
  revalidatePath("/dashboard");
}
