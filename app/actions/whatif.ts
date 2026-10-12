"use server";

import type { WhatIfResultado } from "@/lib/api";
import { apiServer } from "@/lib/server-api";

/**
 * Não persiste nada (por isso não há revalidatePath aqui) — só repassa a
 * simulação pro backend e devolve o resultado pro componente cliente
 * mostrar na hora.
 */
export async function simularWhatIfAction(
  cliente: string,
  valorPedido: number
): Promise<WhatIfResultado> {
  const res = await apiServer(
    `/api/clientes/${encodeURIComponent(cliente)}/simulacao/what-if`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor_pedido: valorPedido }),
    }
  );
  if (!res.ok) throw new Error("Falha ao simular o novo pedido.");
  return res.json();
}
