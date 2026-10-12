"use server";

import { revalidatePath } from "next/cache";
import { apiServer } from "@/lib/server-api";

export async function registrarGatilhoExternoAction(
  cliente: string,
  tipo: string,
  detalhes?: Record<string, unknown>
) {
  const res = await apiServer(
    `/api/clientes/${encodeURIComponent(cliente)}/reanalise/gatilho-externo`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, detalhes: detalhes || null }),
    }
  );
  if (!res.ok) throw new Error("Falha ao registrar gatilho de reanálise.");
  revalidatePath("/creditos");
}

export async function resolverGatilhoReanaliseAction(gatilhoId: number) {
  const res = await apiServer(`/api/reanalise/${gatilhoId}/resolver`, { method: "POST" });
  if (!res.ok) throw new Error("Falha ao marcar gatilho como resolvido.");
  revalidatePath("/creditos");
}
