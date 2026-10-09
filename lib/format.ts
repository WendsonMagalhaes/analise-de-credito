/**
 * Formatação numérica única do sistema, sempre em pt-BR (vírgula decimal,
 * ponto de milhar). Use estas funções em vez de interpolar o número direto
 * (`${x}%` mostra "49.6%" com ponto).
 *
 * Padrão de casas decimais:
 *   - R$ ............ 2 casas (formatBRL, em lib/api.ts)
 *   - percentuais ... 1 casa      -> 49,6%   (formatPct)
 *   - concentração .. 2 casas     -> 0,18%   (formatPct(v, 2)) — os valores são pequenos
 *   - dias médios ... 1 casa      -> 4,6 d   (formatDias)
 *   - dias inteiros . 0 casa      -> 12 d    (formatDias(v, 0))
 *   - score médio ... 1 casa      -> 63,4    (formatNumero)
 *   - score ......... inteiro     -> 72      (formatNumero(v, 0))
 *
 * Casas fixas (49,0% e não 49%) mantêm as colunas alinhadas. Valor nulo,
 * indefinido ou NaN vira "—".
 */

const formatadores = new Map<number, Intl.NumberFormat>();

function formatador(casas: number): Intl.NumberFormat {
  let f = formatadores.get(casas);
  if (!f) {
    f = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
    formatadores.set(casas, f);
  }
  return f;
}

function valido(v: number | string | null | undefined): v is number | string {
  return v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v));
}

export function formatNumero(v: number | string | null | undefined, casas = 1): string {
  return valido(v) ? formatador(casas).format(Number(v)) : "—";
}

export function formatPct(v: number | string | null | undefined, casas = 1): string {
  return valido(v) ? `${formatador(casas).format(Number(v))}%` : "—";
}

export function formatDias(v: number | string | null | undefined, casas = 1): string {
  return valido(v) ? `${formatador(casas).format(Number(v))} d` : "—";
}

/**
 * Texto "de enum" -> rótulo legível: troca "_" por espaço e deixa só a
 * primeira letra maiúscula. "Sem_Dados" / "sem_dados" -> "Sem dados",
 * "MELHORANDO" -> "Melhorando".
 */
export function capitalizar(v: string | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  const t = String(v).replace(/_/g, " ").trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Frase/texto livre vindo do backend -> só garante a primeira letra maiúscula,
 * sem mexer no resto (diferente de `capitalizar`, que também baixa o restante
 * e troca "_" por espaço). Use em motivos, regras, faixas de texto etc.
 * "cliente com atraso alto" -> "Cliente com atraso alto".
 */
export function primeiraMaiuscula(v: string | null | undefined): string {
  if (v === null || v === undefined) return "";
  const t = String(v).trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const TENDENCIA_ROTULO: Record<string, string> = {
  melhorando: "↓ Melhorando",
  piorando: "↑ Piorando",
  estavel: "Estável",
  sem_dados: "—",
};

/** Aceita "Melhorando", "melhorando", "Sem_Dados" etc. (a API e o front divergiam na caixa). */
export function formatTendencia(v: string | null | undefined): string {
  if (!v) return "—";
  return TENDENCIA_ROTULO[v.toLowerCase()] ?? capitalizar(v);
}
