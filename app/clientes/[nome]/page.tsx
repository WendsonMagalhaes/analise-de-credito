"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  fetchCliente,
  fetchDecisoesCliente,
  fetchHistoricoScore,
  fetchAgingCliente,
  fetchToleranciaCliente,
  fetchReajustesLimiteCliente,
  registrarDecisao,
  fetchAnaliseIA,
  formatBRL,
  type ComparativoCarteira,
  type Decisao,
  type PontoScore,
  type TituloComAging,
  type EventoTolerancia,
  type ReajusteLimite,
} from "@/lib/api";
import WhatIfSimulador from "./what-if-simulador";
import { StatCard } from "@/components/ui/StatCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { Badge, FaixaBadge } from "@/components/ui/Badge";
import { TableShell, theadRowClass, thClass, tdClass, trClass, EmptyRow } from "@/components/ui/Table";
import { ArrowLeft, ScrollText, Send, Loader2 } from "lucide-react";
import { PaginaClienteDetalheSkeleton, SkeletonSecao, SkeletonTabela } from "@/components/ui/Skeleton";
import { capitalizar, formatDias, formatNumero, formatPct, formatTendencia, primeiraMaiuscula } from "@/lib/format";

const CLASSE_STYLE: Record<string, string> = {
  A: "bg-verdebg text-verde",
  B: "bg-verdebg text-verde",
  C: "bg-amarelobg text-amarelo",
  D: "bg-vermelhobg text-vermelho",
  E: "bg-vermelhobg text-vermelho",
};

const RECOMENDACAO_ACAO_LABEL: Record<string, string> = {
  aprovar: "Aprovar",
  aprovar_com_limite_reduzido: "Aprovar com limite reduzido",
  exigir_garantia: "Exigir garantia",
  negar: "Negar",
};

const AGING_LABEL: Record<string, string> = {
  inicial: "Inicial",
  intermediaria: "Intermediária",
  reta_final: "Reta final",
  vencido: "Vencido",
  sem_dados: "Sem dados",
};

const AGING_STYLE: Record<string, string> = {
  inicial: "bg-verdebg text-verde",
  intermediaria: "bg-amarelobg text-amarelo",
  reta_final: "bg-amarelobg text-amarelo",
  vencido: "bg-vermelhobg text-vermelho",
  sem_dados: "bg-base text-muted",
};

const RECOMENDACAO_LABEL: Record<string, string> = {
  aumentar: "Aumentar limite",
  reduzir: "Reduzir limite",
  manter: "Manter limite",
  sem_dados: "Sem dados suficientes",
};

const RECOMENDACAO_COR: Record<string, "verde" | "vermelho" | undefined> = {
  aumentar: "verde",
  reduzir: "vermelho",
  manter: undefined,
  sem_dados: undefined,
};

const TIPO_DECISAO_LABEL: Record<string, string> = {
  liberacao: "Liberação de limite",
  negacao: "Negação",
  revisao: "Revisão",
};

const STATUS_REAJUSTE_TONE: Record<string, "verde" | "amarelo" | "vermelho"> = {
  aprovado: "verde",
  sugerido: "amarelo",
  rejeitado: "vermelho",
};

const STATUS_REAJUSTE_LABEL: Record<string, string> = {
  aprovado: "Aprovado",
  sugerido: "Sugerido — aguardando decisão",
  rejeitado: "Rejeitado",
};

function gerarVeredito(resumo: any, comparativo: ComparativoCarteira | null): string {
  if (!resumo) return "";

  if (resumo.qtd_titulos_pagos === 0) {
    return (
      "Cliente sem histórico de pagamentos — não há base para uma recomendação automática. " +
      "Avalie o limite inicial manualmente, com cautela."
    );
  }

  const partes: string[] = [];

  if (resumo.faixa === "vermelho") {
    partes.push("Score baixo (faixa vermelha) — não recomendado liberar mais crédito agora.");
  } else if (resumo.faixa === "amarelo") {
    partes.push("Score intermediário (faixa amarela) — histórico com ressalvas, avalie com cautela.");
  } else {
    partes.push("Score alto (faixa verde) — histórico de pagamento consistente.");
  }

  if (resumo.dias_vencido_max > 0) {
    partes.push(
      `Tem título vencido há ${resumo.dias_vencido_max} dia(s) hoje — considere regularizar antes de qualquer revisão de limite.`
    );
  }

  if (resumo.recomendacao_limite === "reduzir") {
    partes.push("Já está acima do limite recomendado para a faixa atual de risco.");
  } else if (
    resumo.recomendacao_limite === "aumentar" &&
    resumo.margem_limite_atual != null &&
    resumo.margem_limite_atual > 0
  ) {
    partes.push(`Há margem de ${formatBRL(resumo.margem_limite_atual)} livre dentro do limite já cadastrado.`);
  }

  if (comparativo?.percentil_atraso != null && comparativo.percentil_atraso >= 80) {
    partes.push(`Atraso está entre os piores da carteira (pior que ${formatPct(comparativo.percentil_atraso)} dos clientes).`);
  }

  return partes.join(" ");
}

export default function ClienteDetalhe() {
  const params = useParams();
  const nome = decodeURIComponent(params.nome as string);
  const [data, setData] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [decisoes, setDecisoes] = useState<Decisao[]>([]);
  const [historicoScore, setHistoricoScore] = useState<PontoScore[]>([]);
  const [agingTitulos, setAgingTitulos] = useState<TituloComAging[]>([]);
  const [eventosTolerancia, setEventosTolerancia] = useState<EventoTolerancia[]>([]);
  const [reajustes, setReajustes] = useState<ReajusteLimite[]>([]);
  // As seções secundárias chegam em requisições separadas, depois do resumo.
  // Enquanto não chegam, mostramos skeleton em vez de "nenhum registro".
  const [carregandoExtras, setCarregandoExtras] = useState(true);
  const [carregandoDecisoes, setCarregandoDecisoes] = useState(true);

  useEffect(() => {
    let ativo = true; // navegar de um cliente para outro não deixa a resposta do anterior sobrescrever
    setData(null);
    setErro(null);
    setCarregandoExtras(true);
    setCarregandoDecisoes(true);

    fetchCliente(nome)
      .then((d) => ativo && setData(d))
      .catch((e) => ativo && setErro(e.message));
    fetchDecisoesCliente(nome)
      .then((d) => ativo && setDecisoes(d))
      .catch(() => ativo && setDecisoes([]))
      .finally(() => ativo && setCarregandoDecisoes(false));
    Promise.allSettled([
      fetchHistoricoScore(nome).then((d) => ativo && setHistoricoScore(d)),
      fetchAgingCliente(nome).then((d) => ativo && setAgingTitulos(d)),
      fetchToleranciaCliente(nome).then((d) => ativo && setEventosTolerancia(d)),
      fetchReajustesLimiteCliente(nome).then((d) => ativo && setReajustes(d)),
    ]).then((resultados) => {
      if (!ativo) return;
      // falha numa seção secundária não derruba a página: ela só fica vazia
      if (resultados[0].status === "rejected") setHistoricoScore([]);
      if (resultados[1].status === "rejected") setAgingTitulos([]);
      if (resultados[2].status === "rejected") setEventosTolerancia([]);
      if (resultados[3].status === "rejected") setReajustes([]);
      setCarregandoExtras(false);
    });
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nome]);

  function carregarDecisoes() {
    fetchDecisoesCliente(nome)
      .then(setDecisoes)
      .catch(() => setDecisoes([]));
  }

  const { resumo, comparativo, historico_pagamentos, titulos_em_aberto } = data || {};

  // --- totais de boletos, derivados dos títulos em aberto / aging já carregados ---
  const boletos = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const abertos: any[] = titulos_em_aberto || [];
    const vencidos = abertos.filter((t) => t.data_vencimento && new Date(t.data_vencimento) < hoje);
    const aVencer = abertos.filter((t) => !t.data_vencimento || new Date(t.data_vencimento) >= hoje);

    const totalVencido = vencidos.reduce((soma, t) => soma + (t.valor || 0), 0);
    const proximo = aVencer
      .filter((t) => t.data_vencimento)
      .sort((a, b) => new Date(a.data_vencimento).getTime() - new Date(b.data_vencimento).getTime())[0];

    return {
      qtdVencidos: vencidos.length,
      totalVencido,
      proximoVencimento: proximo?.data_vencimento || null,
      proximoValor: proximo?.valor ?? null,
    };
  }, [titulos_em_aberto]);

  const limiteConsumidoPct =
    resumo?.limite_atual != null && resumo.limite_atual > 0
      ? Math.round((resumo.valor_em_aberto / resumo.limite_atual) * 1000) / 10
      : null;

  if (erro) return <p className="text-vermelho text-sm">{erro}</p>;
  if (!data) return <PaginaClienteDetalheSkeleton />;

  return (
    <div>
      <Link href="/clientes" className="inline-flex items-center gap-1 text-sm text-muted hover:text-frost transition-colors">
        <ArrowLeft size={14} /> voltar para clientes
      </Link>

      <div className="flex items-center justify-between mt-3 mb-6 gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold text-ink tracking-tight">{nome}</h1>
        {resumo && (
          <div className="flex items-center gap-2">
            <FaixaBadge faixa={resumo.faixa} score={resumo.score} />
            {resumo.classe_risco_5 && (
              <span
                className={`inline-flex items-center justify-center rounded px-3 py-1 text-sm font-semibold ${CLASSE_STYLE[resumo.classe_risco_5] || "bg-base text-ink"
                  }`}
              >
                Classe {resumo.classe_risco_5}
              </span>
            )}
          </div>
        )}
      </div>

      {resumo && (
        <>
          <div
            className={`rounded-2xl px-5 py-3.5 mb-6 border border-l-4 shadow-soft ${resumo.faixa === "vermelho"
                ? "bg-vermelhobg border-vermelho/30 border-l-vermelho"
                : resumo.faixa === "amarelo"
                  ? "bg-amarelobg border-amarelo/30 border-l-amarelo"
                  : "bg-verdebg border-verde/30 border-l-verde"
              }`}
          >
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide opacity-70 mb-1">
              <ScrollText size={12} /> Veredito
            </p>
            <p className="text-sm font-medium text-ink">{gerarVeredito(resumo, comparativo)}</p>
          </div>

          {/* --- Análise da IA logo no topo, como apoio à leitura de tudo abaixo --- */}
          <AnaliseIA cliente={nome} />

          {/* --- Limite e exposição --- */}
          <p className="text-xs text-muted uppercase tracking-wide mb-2">Limite e exposição</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatCard
              label="Limite cadastrado no ERP" accent="roxo"
              value={resumo.limite_atual != null ? formatBRL(resumo.limite_atual) : "não importado"}
              destaque
            />
            <StatCard
              label="Limite consumido"
              value={formatPct(limiteConsumidoPct)}
              tone={limiteConsumidoPct == null ? "neutro" : limiteConsumidoPct >= 100 ? "vermelho" : limiteConsumidoPct >= 80 ? undefined : "verde"}
              hint={resumo.limite_atual != null ? `${formatBRL(resumo.valor_em_aberto)} em aberto` : undefined}
              destaque
            />
            <StatCard
              label="Margem livre hoje"
              value={resumo.margem_limite_atual != null ? formatBRL(resumo.margem_limite_atual) : "—"}
              tone={resumo.margem_limite_atual == null ? "neutro" : resumo.margem_limite_atual >= 0 ? "verde" : "vermelho"}
              destaque
            />
            <StatCard
              label="Recomendação de limite"
              value={RECOMENDACAO_LABEL[resumo.recomendacao_limite] || "—"}
              tone={RECOMENDACAO_COR[resumo.recomendacao_limite]}
              destaque
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <StatCard
              label="Limite sugerido pelo score" accent="roxo"
              value={resumo.limite_sugerido != null ? formatBRL(resumo.limite_sugerido) : "sem dados suficientes"}
            />
            <StatCard
              label="Margem s/ limite sugerido"
              value={resumo.margem_disponivel != null ? formatBRL(resumo.margem_disponivel) : "—"}
              tone={resumo.margem_disponivel == null ? "neutro" : resumo.margem_disponivel >= 0 ? "verde" : "vermelho"}
            />
          </div>

          {/* --- Boletos --- */}
          <p className="text-xs text-muted uppercase tracking-wide mb-2">Boletos</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            <StatCard label="Em aberto hoje" accent="azul" value={formatBRL(resumo.valor_em_aberto)} />
            <StatCard label="Qtd. títulos em aberto" accent="azul" value={String(resumo.qtd_titulos_aberto)} />
            <StatCard
              label="Total vencido"
              value={formatBRL(boletos.totalVencido)}
              tone={boletos.totalVencido > 0 ? "vermelho" : "verde"}
              hint={`${boletos.qtdVencidos} título(s)`}
            />
            <StatCard
              label="Maior atraso hoje"
              value={resumo.dias_vencido_max > 0 ? formatDias(resumo.dias_vencido_max, 0) : "—"}
              tone={resumo.dias_vencido_max > 0 ? "vermelho" : "verde"}
            />
            <StatCard
              label="Próximo vencimento"
              value={boletos.proximoVencimento ? new Date(boletos.proximoVencimento).toLocaleDateString("pt-BR") : "—"}
              hint={boletos.proximoValor != null ? formatBRL(boletos.proximoValor) : undefined}
            />
          </div>

          {/* --- Score e comportamento --- */}
          <p className="text-xs text-muted uppercase tracking-wide mb-2">Score e comportamento</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <StatCard label="Atraso médio" accent="amarelo" value={formatDias(resumo.atraso_medio_dias)} />
            <StatCard label="% pago em atraso" accent="amarelo" value={formatPct(resumo.pct_pago_em_atraso)} />
            <StatCard label="Tendência" accent="azul" value={formatTendencia(resumo.tendencia)} />
            <StatCard
              label="Total já pago (histórico)" accent="verde"
              value={formatBRL(resumo.valor_total_pago)}
              hint={`${resumo.qtd_titulos_pagos} título(s) pagos`}
            />
          </div>

          {(resumo.classe_risco_5 || resumo.recomendacao_acao) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 text-sm">
              <div className="border border-line border-l-4 border-l-azul rounded-2xl bg-panel px-4 py-3 shadow-soft">
                <p className="text-xs text-muted uppercase tracking-wide mb-2">
                  Classificação de risco (comportamento x exposição)
                </p>
                {resumo.classe_risco_5 ? (
                  <span
                    className={`inline-flex items-center justify-center rounded px-3 py-1 text-sm font-semibold ${CLASSE_STYLE[resumo.classe_risco_5] || "bg-base text-ink"
                      }`}
                  >
                    Classe {resumo.classe_risco_5}
                  </span>
                ) : (
                  <span className="text-ink">—</span>
                )}
              </div>
              <StatCard
                label="Score comportamento / exposição" accent="roxo"
                value={
                  resumo.score_comportamento != null && resumo.score_exposicao != null
                    ? `${formatNumero(resumo.score_comportamento, 1)} / ${formatNumero(resumo.score_exposicao, 1)}`
                    : "—"
                }
              />
              <StatCard
                label="Recomendação do motor de decisão"
                value={RECOMENDACAO_ACAO_LABEL[resumo.recomendacao_acao] || "—"}
                tone={resumo.recomendacao_acao === "aprovar" ? "verde" : resumo.recomendacao_acao === "negar" ? "vermelho" : undefined}
                destaque
              />
              {resumo.regra_recomendacao && (
                <p className="md:col-span-3 text-xs text-muted -mt-1">{primeiraMaiuscula(resumo.regra_recomendacao)}</p>
              )}
            </div>
          )}

          {resumo.motivos?.length > 0 && (
            <SectionCard tone="roxo" title="Por que esse score?" className="mb-4">
              <ul className="text-sm text-ink space-y-1 list-disc list-inside">
                {resumo.motivos.map((m: string, i: number) => (
                  <li key={i}>{primeiraMaiuscula(m)}</li>
                ))}
              </ul>
            </SectionCard>
          )}

          {comparativo && (
            <SectionCard tone="azul" title={`Comparado com o resto da carteira (${comparativo.total_clientes_carteira} clientes)`} className="mb-4">
              <ul className="text-sm text-ink space-y-1">
                {comparativo.percentil_atraso != null && (
                  <li>
                    Atraso médio da carteira: {formatDias(comparativo.media_atraso_carteira)} — este cliente está pior que{" "}
                    <strong className={comparativo.percentil_atraso >= 80 ? "text-vermelho" : undefined}>
                      {formatPct(comparativo.percentil_atraso)}
                    </strong>{" "}
                    dos clientes.
                  </li>
                )}
                {comparativo.percentil_exposicao != null && (
                  <li>
                    Exposição (valor em aberto) maior que{" "}
                    <strong className={comparativo.percentil_exposicao >= 80 ? "text-vermelho" : undefined}>
                      {formatPct(comparativo.percentil_exposicao)}
                    </strong>{" "}
                    da carteira (mediana da carteira: {formatBRL(comparativo.mediana_exposicao_carteira)}).
                  </li>
                )}
              </ul>
            </SectionCard>
          )}

          {carregandoExtras ? <SkeletonSecao linhas={3} className="mb-4" /> : <GraficoScore pontos={historicoScore} />}

          {/* --- Aumento de limite --- */}
          {carregandoExtras ? (
            <SkeletonSecao linhas={2} className="mb-8" />
          ) : (
            <HistoricoReajustes reajustes={reajustes} />
          )}
        </>
      )}

      {titulos_em_aberto?.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-ink mb-2 mt-8">Títulos em aberto</h2>
          <Tabela
            linhas={titulos_em_aberto}
            colunas={[
              ["titulo", "Título"],
              ["valor", "Valor"],
              ["data_vencimento", "Vencimento"],
            ]}
          />
        </>
      )}

      {carregandoExtras && <SkeletonTabela colunas={5} linhas={3} />}
      {!carregandoExtras && agingTitulos?.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-ink mb-2 mt-8">
            Aging dos títulos em aberto (% do prazo do próprio título)
          </h2>
          <TableShell className="mb-2">
            <thead>
              <tr className={theadRowClass}>
                <th className={thClass}>Título</th>
                <th className={thClass}>Valor</th>
                <th className={thClass}>Prazo</th>
                <th className={thClass}>% decorrido</th>
                <th className={thClass}>Situação</th>
              </tr>
            </thead>
            <tbody>
              {agingTitulos.map((t) => (
                <tr key={t.chave_natural} className={trClass}>
                  <td className={tdClass}>{t.titulo || "—"}</td>
                  <td className={`${tdClass} tabular`}>{formatBRL(t.valor)}</td>
                  <td className="px-4 py-2 text-muted">{t.prazo_do_titulo != null ? `${t.prazo_do_titulo} d` : "—"}</td>
                  <td className={`${tdClass} tabular`}>{formatPct(t.pct_prazo_decorrido)}</td>
                  <td className="px-4 py-2">
                    <Badge tone={t.classificacao_aging === "vencido" ? "vermelho" : t.classificacao_aging === "inicial" ? "verde" : t.classificacao_aging === "sem_dados" ? "neutro" : "amarelo"}>
                      {AGING_LABEL[t.classificacao_aging]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </>
      )}

      {!carregandoExtras && eventosTolerancia?.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-ink mb-2 mt-8">Histórico de uso da margem de tolerância</h2>
          <TableShell className="mb-2">
            <thead>
              <tr className={theadRowClass}>
                <th className={thClass}>Data</th>
                <th className={thClass}>Limite atual</th>
                <th className={thClass}>Em aberto</th>
                <th className={thClass}>Acima do limite</th>
              </tr>
            </thead>
            <tbody>
              {eventosTolerancia.map((e) => (
                <tr key={e.id} className={trClass}>
                  <td className={`${tdClass} tabular`}>{new Date(e.data_captura).toLocaleDateString("pt-BR")}</td>
                  <td className={`${tdClass} tabular`}>{e.limite_atual != null ? formatBRL(e.limite_atual) : "—"}</td>
                  <td className={`${tdClass} tabular`}>{e.valor_em_aberto != null ? formatBRL(e.valor_em_aberto) : "—"}</td>
                  <td className="px-4 py-2 tabular text-vermelho">
                    {e.valor_acima_do_limite != null ? formatBRL(e.valor_acima_do_limite) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </>
      )}

      {resumo && <WhatIfSimulador cliente={nome} />}

      <h2 className="text-sm font-semibold text-ink mb-2 mt-8">Histórico de pagamentos</h2>
      {historico_pagamentos?.length > 0 ? (
        <Tabela
          linhas={historico_pagamentos}
          colunas={[
            ["titulo", "Título"],
            ["valor_pago", "Valor pago"],
            ["data_vencimento", "Vencimento"],
            ["data_pagamento", "Pago em"],
            ["atraso_calc", "Atraso"],
          ]}
        />
      ) : (
        <p className="text-sm text-muted">Sem pagamentos registrados ainda.</p>
      )}

      <DecisaoCredito cliente={nome} resumo={resumo} decisoes={decisoes} carregandoHistorico={carregandoDecisoes} onRegistrada={carregarDecisoes} />
    </div>
  );
}

function HistoricoReajustes({ reajustes }: { reajustes: ReajusteLimite[] }) {
  return (
    <SectionCard tone="roxo" title="Histórico de aumento de limite" className="mb-8">
      {reajustes.length === 0 ? (
        <p className="text-sm text-muted">
          Nenhum reajuste sugerido ainda para este cliente — aparece aqui quando ele acumular 3
          snapshots seguidos em classe A/B, sem títulos vencidos.
        </p>
      ) : (
        <div className="space-y-2">
          {reajustes.map((r) => (
            <div key={r.id} className="flex items-center justify-between text-sm gap-3 border-b border-line last:border-0 pb-2 last:pb-0">
              <div className="flex items-center gap-3">
                <Badge tone={STATUS_REAJUSTE_TONE[r.status] || "neutro"}>{STATUS_REAJUSTE_LABEL[r.status] || capitalizar(r.status)}</Badge>
                <span className="text-ink tabular">
                  {formatBRL(r.limite_anterior)} → <strong>{formatBRL(r.limite_sugerido)}</strong>
                </span>
                <span className="text-muted text-xs">
                  (+{formatPct(r.percentual_aplicado)} · classe {r.classe}
                  {r.teto_absoluto_aplicado ? " · teto absoluto aplicado" : ""})
                </span>
              </div>
              <span className="tabular text-muted text-xs shrink-0">
                {new Date(r.sugerido_em).toLocaleDateString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function AnaliseIA({ cliente }: { cliente: string }) {
  const [analise, setAnalise] = useState<string | null>(null);
  const [modelo, setModelo] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function pedirAnalise() {
    setCarregando(true);
    setErro(null);
    try {
      const { analise: texto, modelo: modeloUsado } = await fetchAnaliseIA(cliente);
      setAnalise(texto);
      setModelo(modeloUsado);
    } catch (e: any) {
      setErro(e.message || "Falha ao gerar a análise");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SectionCard
      tone="frost"
      className="mb-8"
      title={
        <span className="flex items-center gap-1.5">
          <span className="text-frost">✦</span> Assistente de IA — segunda opinião (Groq)
        </span>
      }
      actions={
        <button
          onClick={pedirAnalise}
          disabled={carregando}
          className="text-xs font-medium text-frost hover:text-frostdark disabled:opacity-40 shrink-0"
        >
          {carregando ? "Pensando…" : analise ? "Pedir de novo" : "Pedir análise"}
        </button>
      }
    >
      {erro && <p className="text-sm text-vermelho">{erro}</p>}
      {analise && (
        <>
          <p className="text-sm text-ink whitespace-pre-line">{analise}</p>
          {modelo && <p className="text-xs text-muted mt-2">gerado com {modelo}</p>}
        </>
      )}
      {!analise && !erro && !carregando && (
        <p className="text-sm text-muted">
          Peça uma leitura qualitativa do histórico deste cliente — limite, boletos, score e
          tendência — como apoio (não substituto) à sua decisão.
        </p>
      )}
    </SectionCard>
  );
}

function GraficoScore({ pontos }: { pontos: PontoScore[] }) {
  if (pontos.length < 2) {
    return (
      <SectionCard tone="frost" title="Evolução do score" className="mb-4">
        <p className="text-sm text-muted">
          Ainda não há histórico suficiente — o gráfico aparece a partir da segunda vez que
          relatórios forem importados em dias diferentes.
        </p>
      </SectionCard>
    );
  }

  const largura = 640;
  const altura = 140;
  const passo = largura / (pontos.length - 1);
  const coords = pontos.map((p, i) => ({
    x: i * passo,
    y: altura - (p.score / 100) * altura,
    ...p,
  }));
  const linha = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const y70 = altura - (70 / 100) * altura;
  const y40 = altura - (40 / 100) * altura;

  return (
    <SectionCard tone="frost" title="Evolução do score" className="mb-4">
      <svg viewBox={`0 0 ${largura} ${altura}`} className="w-full h-32 text-frost">
        <line x1="0" y1={y70} x2={largura} y2={y70} stroke="currentColor" className="text-verde" strokeDasharray="4 4" strokeOpacity="0.35" />
        <line x1="0" y1={y40} x2={largura} y2={y40} stroke="currentColor" className="text-amarelo" strokeDasharray="4 4" strokeOpacity="0.35" />
        <polyline points={linha} fill="none" stroke="currentColor" strokeWidth="2" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="3" fill="currentColor" />
        ))}
      </svg>
      <div className="flex justify-between text-xs text-muted mt-1">
        <span>{new Date(pontos[0].data_captura).toLocaleDateString("pt-BR")}</span>
        <span>{new Date(pontos[pontos.length - 1].data_captura).toLocaleDateString("pt-BR")}</span>
      </div>
    </SectionCard>
  );
}

function Tabela({ linhas, colunas }: { linhas: any[]; colunas: [string, string][] }) {
  return (
    <TableShell className="mb-4">
      <thead>
        <tr className={theadRowClass}>
          {colunas.map(([key, label]) => (
            <th key={key} className={thClass}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {linhas.map((linha, i) => (
          <tr key={i} className={trClass}>
            {colunas.map(([key]) => (
              <td key={key} className={`${tdClass} tabular`}>
                {formatCell(key, linha)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function formatCell(key: string, linha: any) {
  if (key === "atraso_calc") {
    if (!linha.data_pagamento || !linha.data_vencimento) return "—";
    const dias = Math.round(
      (new Date(linha.data_pagamento).getTime() - new Date(linha.data_vencimento).getTime()) / 86400000
    );
    return dias > 0 ? `${dias} d atraso` : dias < 0 ? `${-dias} d antes` : "em dia";
  }
  if (key === "valor" || key === "valor_pago") return formatBRL(linha[key] || 0);
  if (key === "data_vencimento" || key === "data_pagamento") {
    return linha[key] ? new Date(linha[key]).toLocaleDateString("pt-BR") : "—";
  }
  return linha[key] ?? "—";
}

function ScoreDelta({ antes, agora }: { antes: number | null; agora: number | null | undefined }) {
  if (antes == null || agora == null) return <span className="text-muted">—</span>;
  const diff = agora - antes;
  const cor = diff > 0 ? "text-verde" : diff < 0 ? "text-vermelho" : "text-muted";
  const seta = diff > 0 ? "↑" : diff < 0 ? "↓" : "→";
  return (
    <span className={`tabular ${cor}`}>
      {antes} → {agora} {diff !== 0 && `(${seta} ${Math.abs(diff)})`}
    </span>
  );
}

function DecisaoCredito({
  cliente,
  resumo,
  decisoes,
  carregandoHistorico,
  onRegistrada,
}: {
  cliente: string;
  resumo: any;
  decisoes: Decisao[];
  carregandoHistorico: boolean;
  onRegistrada: () => void;
}) {
  const [tipo, setTipo] = useState("liberacao");
  const [valorSolicitado, setValorSolicitado] = useState("");
  const [valorAprovado, setValorAprovado] = useState("");
  const [prazoDias, setPrazoDias] = useState("");
  const [analista, setAnalista] = useState("");
  const [observacao, setObservacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar() {
    setEnviando(true);
    setErro(null);
    try {
      await registrarDecisao(cliente, {
        tipo,
        valor_solicitado: valorSolicitado ? Number(valorSolicitado) : null,
        valor_aprovado: valorAprovado ? Number(valorAprovado) : null,
        prazo_dias: prazoDias ? Number(prazoDias) : null,
        score_no_momento: resumo?.score ?? null,
        faixa_no_momento: resumo?.faixa ?? null,
        analista: analista || null,
        observacao: observacao || null,
      });
      setValorSolicitado("");
      setValorAprovado("");
      setPrazoDias("");
      setObservacao("");
      onRegistrada();
    } catch (e: any) {
      setErro(e.message || "Falha ao registrar decisão");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="mt-10 border-t border-line pt-8">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink mb-3">
        <ScrollText size={15} className="text-frost" /> Registrar decisão de crédito
      </h2>

      <div className="border border-line rounded-2xl bg-panel p-5 mb-6 shadow-soft">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs text-muted mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full border border-line rounded-xl px-3 py-2 text-sm bg-panel text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/30 focus:border-frost transition-colors"
            >
              <option value="liberacao">Liberação de limite</option>
              <option value="negacao">Negação</option>
              <option value="revisao">Revisão</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Valor solicitado (R$)</label>
            <input
              value={valorSolicitado}
              onChange={(e) => setValorSolicitado(e.target.value)}
              type="number"
              className="w-full border border-line rounded-xl px-3 py-2 text-sm bg-panel text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/30 focus:border-frost transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Valor aprovado (R$)</label>
            <input
              value={valorAprovado}
              onChange={(e) => setValorAprovado(e.target.value)}
              type="number"
              className="w-full border border-line rounded-xl px-3 py-2 text-sm bg-panel text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/30 focus:border-frost transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Prazo (dias)</label>
            <input
              value={prazoDias}
              onChange={(e) => setPrazoDias(e.target.value)}
              type="number"
              className="w-full border border-line rounded-xl px-3 py-2 text-sm bg-panel text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/30 focus:border-frost transition-colors"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            value={analista}
            onChange={(e) => setAnalista(e.target.value)}
            placeholder="Seu nome"
            className="border border-line rounded-xl px-3 py-2 text-sm bg-panel text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/30 focus:border-frost transition-colors md:col-span-1"
          />
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Observação / justificativa"
            rows={2}
            className="border border-line rounded-xl px-3 py-2 text-sm bg-panel text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/30 focus:border-frost transition-colors md:col-span-2"
          />
        </div>
        <button
          onClick={enviar}
          disabled={enviando}
          className="flex items-center gap-2 bg-frost text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft hover:bg-frostdark hover:shadow-glow active:scale-[0.98] disabled:opacity-40 transition-all"
        >
          {enviando ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {enviando ? "Salvando…" : "Registrar decisão"}
        </button>
        {erro && <p className="text-vermelho text-sm mt-2">{erro}</p>}
      </div>

      <h2 className="text-sm font-semibold text-ink mb-2">Histórico de decisões</h2>
      {carregandoHistorico ? (
        <SkeletonTabela colunas={5} linhas={3} />
      ) : decisoes.length > 0 ? (
        <TableShell>
          <thead>
            <tr className={theadRowClass}>
              <th className={thClass}>Data</th>
              <th className={thClass}>Tipo</th>
              <th className={thClass}>Solicitado</th>
              <th className={thClass}>Aprovado</th>
              <th className={thClass}>Prazo</th>
              <th className={thClass}>Score</th>
              <th className={thClass}>Score: então → agora</th>
              <th className={thClass}>Analista</th>
              <th className={thClass}>Observação</th>
            </tr>
          </thead>
          <tbody>
            {decisoes.map((d) => (
              <tr key={d.id} className={trClass}>
                <td className={`${tdClass} tabular`}>{new Date(d.criado_em).toLocaleDateString("pt-BR")}</td>
                <td className={tdClass}>{TIPO_DECISAO_LABEL[d.tipo] || capitalizar(d.tipo)}</td>
                <td className={`${tdClass} tabular`}>{d.valor_solicitado != null ? formatBRL(d.valor_solicitado) : "—"}</td>
                <td className={`${tdClass} tabular`}>{d.valor_aprovado != null ? formatBRL(d.valor_aprovado) : "—"}</td>
                <td className={`${tdClass} tabular`}>{d.prazo_dias != null ? `${d.prazo_dias} d` : "—"}</td>
                <td className={`${tdClass} tabular`}>
                  {d.score_no_momento != null ? `${d.score_no_momento} (${d.faixa_no_momento})` : "—"}
                </td>
                <td className="px-4 py-2">
                  <ScoreDelta antes={d.score_no_momento} agora={resumo?.score} />
                </td>
                <td className={tdClass}>{d.analista || "—"}</td>
                <td className="px-4 py-2 text-muted">{d.observacao || "—"}</td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      ) : (
        <p className="text-sm text-muted">Nenhuma decisão registrada ainda para este cliente.</p>
      )}
    </div>
  );
}