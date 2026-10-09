"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "@/lib/api";

/**
 * Substitui, por enquanto, o job diário que ainda não tem agendador
 * configurado (cron/worker) no ambiente do cliente: recalcula
 * velocidade, classificação A-E, tolerância, recomendação e dispara
 * alertas preditivos/gatilhos de reanálise novos. Assim que houver um
 * agendador rodando isso sozinho, este botão continua útil pra forçar
 * um recálculo pontual (ex.: logo depois de aprovar um reajuste).
 */
export async function atualizarAnaliseCreditoAction() {
  const res = await fetch(`${API_URL}/api/creditos/atualizar`, { method: "POST" });
  if (!res.ok) throw new Error("Falha ao atualizar a análise de crédito.");
  const resultado = await res.json();
  revalidatePath("/creditos");
  return resultado as { clientes_recalculados: number; novos_alertas_preditivos: number };
}
