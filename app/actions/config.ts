"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "@/lib/api";

export async function atualizarConfiguracaoAction(chave: string, valor: unknown) {
  const res = await fetch(`${API_URL}/api/config/${encodeURIComponent(chave)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ valor }),
  });
  if (!res.ok) throw new Error("Falha ao atualizar configuração.");
  revalidatePath("/configuracoes");
}

export async function criarPeriodoSazonalAction(nome: string, dataInicio: string, dataFim: string) {
  const res = await fetch(`${API_URL}/api/config/periodos-sazonais`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, data_inicio: dataInicio, data_fim: dataFim }),
  });
  if (!res.ok) throw new Error("Falha ao cadastrar período sazonal.");
  revalidatePath("/configuracoes");
}

export async function removerPeriodoSazonalAction(periodoId: number) {
  const res = await fetch(`${API_URL}/api/config/periodos-sazonais/${periodoId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Falha ao remover período sazonal.");
  revalidatePath("/configuracoes");
}
