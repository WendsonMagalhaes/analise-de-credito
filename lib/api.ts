export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Cliente = {
  cliente: string;
  qtd_titulos_pagos: number;
  valor_total_pago: number;
  atraso_medio_dias: number | null;
  atraso_maximo_dias: number | null;
  pct_pago_em_atraso: number;
  pct_pago_muito_atraso: number;
  tendencia: "Melhorando" | "Estavel" | "Piorando" | "Sem_Dados";
  valor_em_aberto: number;
  qtd_titulos_aberto: number;
  dias_vencido_max: number;
  capacidade_mensal: number;
  limite_sugerido: number | null;
  margem_disponivel: number | null;
  limite_atual: number | null;
  margem_limite_atual: number | null;
  recomendacao_limite: "aumentar" | "manter" | "reduzir" | "sem_dados";
  motivos: string[];
  score: number;
  faixa: "verde" | "amarelo" | "vermelho";
  // --- score duplo (comportamento x exposição) e motor de recomendação,
  // separados da faixa verde/amarelo/vermelho acima (ver classificacao.py) ---
  score_comportamento: number | null;
  score_exposicao: number | null;
  classe_risco_5: "A" | "B" | "C" | "D" | "E" | null;
  recomendacao_acao: "aprovar" | "aprovar_com_limite_reduzido" | "exigir_garantia" | "negar" | null;
  regra_recomendacao: string | null;
};

export type ReajusteLimite = {
  id: number;
  cliente: string;
  classe: string;
  limite_anterior: number;
  limite_sugerido: number;
  percentual_aplicado: number;
  teto_absoluto_aplicado: boolean;
  status: "sugerido" | "aprovado" | "rejeitado";
  motivo: Record<string, unknown> | null;
  sugerido_em: string;
};

export type GatilhoReanalise = {
  id: number;
  cliente: string;
  tipo_gatilho: string;
  detalhes: Record<string, unknown> | null;
  resolvido: boolean;
  criado_em: string;
};

export type EventoTolerancia = {
  id: number;
  cliente: string;
  data_captura: string;
  classe: string | null;
  limite_atual: number | null;
  tolerancia_pct: number | null;
  valor_maximo_liberado: number | null;
  valor_em_aberto: number | null;
  valor_acima_do_limite: number | null;
};

export type TituloComAging = {
  chave_natural: string;
  cliente: string;
  titulo: string | null;
  valor: number;
  data_emissao: string;
  data_vencimento: string;
  prazo_do_titulo: number | null;
  pct_prazo_decorrido: number | null;
  classificacao_aging: "inicial" | "intermediaria" | "reta_final" | "vencido" | "sem_dados";
};

export type ConcentracaoCliente = {
  cliente: string;
  valor_em_aberto: number;
  pct_da_carteira: number;
  acima_do_limiar: boolean;
};

export type ProjecaoFluxoCaixa = Record<
  "ate_8_dias" | "9_a_14_dias" | "15_a_21_dias",
  { valor_cheio: number; valor_ponderado: number; qtd_titulos: number }
> &
  Record<"vencido" | "mais_de_21_dias", { valor_total: number; qtd_titulos: number }> & {
    diagnostico?: {
      hoje: string;
      data_captura: string | null;
      total_titulos: number;
      valor_total: number;
      vencimento_min: string | null;
      vencimento_max: string | null;
      sem_data_vencimento: number;
      dias_desde_captura: number | null;
      foto_desatualizada: boolean;
      sem_vencimentos_futuros: boolean;
    };
  };

export type PeriodoSazonal = { id: number; nome: string; data_inicio: string; data_fim: string };

export type ConfiguracaoValor = { chave: string; valor: unknown; descricao: string | null; atualizado_em: string };

export type WhatIfResultado = {
  novo_saldo_em_aberto: number;
  novo_pct_utilizacao: number | null;
  valor_maximo_liberado_considerando_tolerancia?: number;
  ultrapassa_limite_com_tolerancia?: boolean;
  impacto_estimado_score: number | null;
  observacao: string | null;
};

export type ResumoGeral = {
  total_aberto: number;
  total_limite_atual: number;
  total_limite_sugerido: number;
  score_medio: number;
  total_clientes: number;
  contagem_faixas: { verde: number; amarelo: number; vermelho: number };
};

export type MaiorExposto = { cliente: string; valor_em_aberto: number };

export type DashboardParams = {
  pagina?: number;
  tamanhoPagina?: number;
  busca?: string;
  faixa?: string;
  ordenarPor?: string;
  ordenarDir?: "asc" | "desc";
};

export type DashboardResponse = {
  atualizado_em: string | null;
  total_clientes: number;
  pagina: number;
  tamanho_pagina: number;
  total_paginas: number;
  resumo_geral: ResumoGeral;
  maiores_expostos: MaiorExposto[];
  clientes: Cliente[];
};

export type Decisao = {
  id: number;
  cliente: string;
  tipo: "liberacao" | "negacao" | "revisao" | string;
  valor_solicitado: number | null;
  valor_aprovado: number | null;
  prazo_dias: number | null;
  score_no_momento: number | null;
  faixa_no_momento: string | null;
  analista: string | null;
  observacao: string | null;
  criado_em: string;
};

export type NovaDecisao = {
  tipo: string;
  valor_solicitado?: number | null;
  valor_aprovado?: number | null;
  prazo_dias?: number | null;
  score_no_momento?: number | null;
  faixa_no_momento?: string | null;
  analista?: string | null;
  observacao?: string | null;
};

export type AlertaCliente = {
  cliente: string;
  score_atual: number;
  faixa_atual: "verde" | "amarelo" | "vermelho";
  score_anterior: number;
  faixa_anterior: "verde" | "amarelo" | "vermelho";
  valor_em_aberto: number;
  direcao: "piorou" | "melhorou";
};

export type AlertasResponse = {
  disponivel: boolean;
  mensagem?: string;
  data_atual?: string;
  data_anterior?: string;
  alertas: AlertaCliente[];
};

export type ClienteExcluido = {
  id: number;
  cliente: string;
  motivo: string | null;
  criado_em: string;
};

export type ComparativoCarteira = {
  total_clientes_carteira: number;
  media_atraso_carteira: number | null;
  mediana_exposicao_carteira: number;
  percentil_atraso: number | null;
  percentil_exposicao: number | null;
};

export type PontoScore = {
  data_captura: string;
  score: number;
  faixa: "verde" | "amarelo" | "vermelho";
  valor_em_aberto: number;
};

export const exportCarteiraUrl = `${API_URL}/api/carteira/export`;

export async function fetchDashboard(params: DashboardParams = {}): Promise<DashboardResponse> {
  const query = new URLSearchParams();
  query.set("pagina", String(params.pagina ?? 1));
  query.set("tamanho_pagina", String(params.tamanhoPagina ?? 25));
  if (params.busca) query.set("busca", params.busca);
  if (params.faixa && params.faixa !== "todas") query.set("faixa", params.faixa);
  if (params.ordenarPor) query.set("ordenar_por", params.ordenarPor);
  if (params.ordenarDir) query.set("ordenar_dir", params.ordenarDir);

  const res = await fetch(`${API_URL}/api/dashboard?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao buscar dashboard");
  return res.json();
}

export async function fetchCliente(nome: string) {
  const res = await fetch(`${API_URL}/api/clientes/${encodeURIComponent(nome)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Cliente não encontrado");
  return res.json();
}

export async function fetchDecisoesCliente(nome: string): Promise<Decisao[]> {
  const res = await fetch(`${API_URL}/api/clientes/${encodeURIComponent(nome)}/decisoes`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Falha ao buscar histórico de decisões");
  return res.json();
}

export async function fetchHistoricoScore(nome: string): Promise<PontoScore[]> {
  const res = await fetch(
    `${API_URL}/api/clientes/${encodeURIComponent(nome)}/historico-score`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Falha ao buscar histórico de score");
  return res.json();
}

export async function registrarDecisao(nome: string, decisao: NovaDecisao): Promise<void> {
  const res = await fetch(`${API_URL}/api/clientes/${encodeURIComponent(nome)}/decisoes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(decisao),
  });
  if (!res.ok) throw new Error("Falha ao registrar decisão");
}

export async function fetchDecisoesRecentes(limite = 8): Promise<Decisao[]> {
  const res = await fetch(`${API_URL}/api/decisoes?limite=${limite}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao buscar decisões recentes");
  return res.json();
}

export async function fetchAlertas(): Promise<AlertasResponse> {
  const res = await fetch(`${API_URL}/api/alertas`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao buscar alertas");
  return res.json();
}

export async function fetchClientesExcluidos(): Promise<ClienteExcluido[]> {
  const res = await fetch(`${API_URL}/api/config/clientes-excluidos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao buscar lista de exclusões");
  return res.json();
}

export async function adicionarClienteExcluido(cliente: string, motivo: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/config/clientes-excluidos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cliente, motivo: motivo || null }),
  });
  if (!res.ok) throw new Error("Falha ao adicionar exclusão");
}

export async function removerClienteExcluido(cliente: string): Promise<void> {
  const res = await fetch(
    `${API_URL}/api/config/clientes-excluidos/${encodeURIComponent(cliente)}`,
    { method: "DELETE" }
  );
  if (!res.ok) throw new Error("Falha ao remover exclusão");
}

export async function fetchAnaliseIA(nome: string): Promise<{ analise: string; modelo: string }> {
  const res = await fetch(`${API_URL}/api/clientes/${encodeURIComponent(nome)}/analise-ia`, {
    method: "POST",
  });
  if (!res.ok) {
    const corpo = await res.json().catch(() => null);
    throw new Error(corpo?.detail || "Falha ao gerar análise da IA");
  }
  const dados = await res.json();
  return { analise: dados.analise as string, modelo: dados.modelo as string };
}

export async function recalcularCarteira(): Promise<void> {
  const res = await fetch(`${API_URL}/api/carteira/recalcular`, { method: "POST" });
  if (!res.ok) throw new Error("Falha ao recalcular a carteira");
}

// --- leituras das funcionalidades novas (mutations ficam em app/actions,
// como Server Actions — ver ADR no início da pasta) ---

export async function fetchReajustesPendentes(): Promise<ReajusteLimite[]> {
  const res = await fetch(`${API_URL}/api/reajustes-limite`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao buscar reajustes pendentes");
  return res.json();
}

export async function fetchReajustesLimiteCliente(nome: string): Promise<ReajusteLimite[]> {
  const res = await fetch(
    `${API_URL}/api/clientes/${encodeURIComponent(nome)}/reajustes-limite`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error("Falha ao buscar histórico de reajustes de limite");
  return res.json();
}

export async function fetchReanalisePendentes(): Promise<GatilhoReanalise[]> {
  const res = await fetch(`${API_URL}/api/reanalise/pendentes`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao buscar pendências de reanálise");
  return res.json();
}

export async function fetchToleranciaCliente(nome: string): Promise<EventoTolerancia[]> {
  const res = await fetch(`${API_URL}/api/clientes/${encodeURIComponent(nome)}/tolerancia`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Falha ao buscar eventos de tolerância");
  return res.json();
}

export async function fetchAgingCliente(nome: string): Promise<TituloComAging[]> {
  const res = await fetch(`${API_URL}/api/clientes/${encodeURIComponent(nome)}/aging`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Falha ao buscar aging do cliente");
  return res.json();
}

export async function fetchConcentracaoRisco(): Promise<ConcentracaoCliente[]> {
  const res = await fetch(`${API_URL}/api/concentracao-risco`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao buscar concentração de risco");
  return res.json();
}

export async function fetchProjecaoFluxoCaixa(): Promise<ProjecaoFluxoCaixa> {
  const res = await fetch(`${API_URL}/api/fluxo-caixa/projecao`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao buscar projeção de fluxo de caixa");
  return res.json();
}

export async function fetchPeriodosSazonais(): Promise<PeriodoSazonal[]> {
  const res = await fetch(`${API_URL}/api/config/periodos-sazonais`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao buscar períodos sazonais");
  return res.json();
}

export async function fetchConfiguracoes(): Promise<ConfiguracaoValor[]> {
  const res = await fetch(`${API_URL}/api/config`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao buscar configurações");
  return res.json();
}

export type PainelCredito = {
  aging_resumo: Record<string, { qtd_titulos: number; valor_total: number }>;
  concentracao: ConcentracaoCliente[];
  fluxo_caixa: ProjecaoFluxoCaixa;
  reajustes_pendentes: ReajusteLimite[];
  reanalise_pendentes: GatilhoReanalise[];
};

export async function fetchPainelCredito(): Promise<PainelCredito> {
  const res = await fetch(`${API_URL}/api/creditos/painel`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao buscar o painel de créditos");
  return res.json();
}

export type VisaoGeral = {
  hoje: string;
  mes_referencia: string;
  total_aberto: number;
  qtd_titulos: number;
  em_aberto_mes: {
    valor: number;
    qtd_titulos: number;
    a_vencer_valor: number;
    a_vencer_qtd: number;
    vencido_valor: number;
    vencido_qtd: number;
  };
  vencidos: {
    valor: number;
    qtd_titulos: number;
    qtd_clientes: number;
    pct_do_aberto: number;
    maior_atraso_dias: number | null;
    faixas: { faixa: string; valor: number; qtd_titulos: number }[];
  };
  recebido_mes: { valor: number; qtd_titulos: number };
  carteira_informada: boolean;
  por_carteira: {
    carteira: string;
    qtd_titulos: number;
    qtd_clientes: number;
    valor_aberto: number;
    valor_vencido: number;
    qtd_vencidos: number;
    pct_do_aberto: number;
    pct_vencido: number;
  }[];
  vendedores_total: number;
  por_vendedor: {
    vendedor: string;
    qtd_clientes: number;
    qtd_titulos: number;
    valor_aberto: number;
    valor_vencido: number;
    qtd_vencidos: number;
    pct_do_aberto: number;
    pct_vencido: number;
    recebido_mes: number;
    atraso_medio_90d: number | null;
  }[];
};

export async function fetchVisaoGeral(): Promise<VisaoGeral> {
  const res = await fetch(`${API_URL}/api/dashboard/visao-geral`, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao buscar a visão geral do dashboard");
  return res.json();
}

/**
 * "2026-06-16" -> "16/06/2026" sem passar por Date. new Date("2026-06-16") é
 * interpretado como meia-noite UTC e, no fuso do Brasil (UTC-3), aparecia como
 * 15/06 — um dia a menos.
 */
export function formatDataBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

export function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}