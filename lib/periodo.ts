/**
 * Período do filtro (mês atual / 6 meses / tudo). Fica num arquivo SEM
 * "use client" para poder ser importado tanto por componentes de servidor
 * (ex.: app/dashboard/page.tsx) quanto por componentes de cliente.
 */
export type Periodo = "mes" | "6m" | "tudo";

export const OPCOES_PERIODO: { valor: Periodo; rotulo: string; dica: string }[] = [
  { valor: "mes", rotulo: "Mês atual", dica: "Títulos emitidos desde o dia 1 deste mês" },
  { valor: "6m", rotulo: "6 meses", dica: "Títulos emitidos nos últimos 6 meses, contando o atual" },
  { valor: "tudo", rotulo: "Tudo", dica: "Sem filtro de período (padrão)" },
];

/** Lê o período da URL. Valor ausente ou desconhecido = "tudo". */
export function lerPeriodo(valor: string | null | undefined): Periodo {
  return valor === "mes" || valor === "6m" ? valor : "tudo";
}

/**
 * Diz se uma data (texto "AAAA-MM-DD" ou ISO) cai dentro do período escolhido.
 * Compara como texto para não haver erro de fuso horário.
 */
export function dentroDoPeriodo(dataIso: string | null | undefined, periodo: Periodo): boolean {
  if (periodo === "tudo") return true;
  if (!dataIso) return false;
  const hoje = new Date();
  // "mes": dia 1 deste mês. "6m": dia 1 de cinco meses atrás (seis meses contando o atual).
  const ref = periodo === "mes" ? hoje : new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
  const inicioIso = `${ref.getFullYear()}-${String(ref.getMonth() + 1).padStart(2, "0")}-01`;
  return dataIso.slice(0, 10) >= inicioIso;
}
