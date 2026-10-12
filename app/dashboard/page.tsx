import { codigoCliente } from "@/lib/codigo-cliente";
import Link from "next/link";
import { tokenDaSessao } from "@/lib/server-api";
import {
  fetchDecisoesRecentes,
  fetchAlertas,
  fetchPainelCredito,
  fetchVisaoGeral,
  formatBRL,
  formatDataBR,
  exportCarteiraUrl,
} from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { SectionCard } from "@/components/ui/SectionCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/FaixaBadge";
import { PorCarteira, PorVendedor, VencidosPorFaixa } from "./visao-geral";
import {
  Users,
  Wallet,
  CalendarClock,
  HandCoins,
  Gauge,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  Download,
  FileBarChart,
  Clock,
  PackageOpen,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { capitalizar, formatNumero, formatPct } from "@/lib/format";
import { fetchDashboardPeriodo } from "@/lib/api-periodo";
import { lerPeriodo, type Periodo } from "@/lib/periodo";
import PeriodoNav from "@/components/ui/PeriodoNav";

// Sempre busca dados novos a cada request — nunca serve uma versão
// pré-renderizada em build time (aqui a página depende 100% do backend).
export const dynamic = "force-dynamic";

const TIPO_DECISAO_LABEL: Record<string, string> = {
  liberacao: "Liberação",
  negacao: "Negação",
  revisao: "Revisão",
};

const AGING_LABEL: Record<string, string> = {
  inicial: "Inicial",
  intermediaria: "Intermediária",
  reta_final: "Reta final",
  vencido: "Vencido",
  sem_dados: "Sem dados",
};
const ORDEM_AGING = ["inicial", "intermediaria", "reta_final", "vencido", "sem_dados"];

const JANELAS: { chave: "ate_8_dias" | "9_a_14_dias" | "15_a_21_dias"; rotulo: string }[] = [
  { chave: "ate_8_dias", rotulo: "Vence em até 8 dias" },
  { chave: "9_a_14_dias", rotulo: "Vence em 9 a 14 dias" },
  { chave: "15_a_21_dias", rotulo: "Vence em 15 a 21 dias" },
];

// Server Component: visão executiva da carteira — números do dia,
// concentração de risco, prazos de recebimento e o que precisa de ação
// (reajustes/reanálise pendentes, alertas de piora). A lista de clientes
// em si mora em /clientes, componentizada à parte.
const PERIODO_ROTULO: Record<Periodo, string> = {
  mes: "no mês atual",
  "6m": "nos últimos 6 meses",
  tudo: "em todo o histórico",
};

export default async function DashboardPage({ searchParams }: { searchParams: { periodo?: string } }) {
  const token = tokenDaSessao();
  const periodo = lerPeriodo(searchParams.periodo ?? null);
  const [dashboard, decisoesRecentes, alertas, painel, visao] = await Promise.all([
    fetchDashboardPeriodo({ pagina: 1, tamanhoPagina: 1, periodo }, token),
    fetchDecisoesRecentes(6, token).catch(() => []),
    fetchAlertas(token).catch(() => ({ disponivel: false, alertas: [] as any[] })),
    fetchPainelCredito(token).catch(() => null),
    fetchVisaoGeral(token).catch(() => null),
  ]);

  // a API antiga (sem destaques) não derruba a página
  const destaques = dashboard.destaques ?? { maior_compra: null, maior_atraso: null };
  const resumo = dashboard.resumo_geral;

  if (dashboard.total_clientes === 0) {
    return (
      <div className="text-center py-24 border border-dashed border-line rounded-2xl bg-panel">
        <div className="w-14 h-14 rounded-2xl bg-frost/10 text-frost flex items-center justify-center mx-auto mb-4">
          <PackageOpen size={24} strokeWidth={2} />
        </div>
        <p className="text-ink text-lg font-medium mb-2">Nenhum dado importado ainda</p>
        <p className="text-muted text-sm mb-6">
          Suba os relatórios de contas a receber para começar a montar o histórico.
        </p>
        <Link
          href="/upload"
          className="inline-block bg-frost text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft hover:bg-frostdark hover:shadow-glow active:scale-[0.98] transition-colors"
        >
          Atualizar relatórios
        </Link>
      </div>
    );
  }

  const pioraram = alertas.alertas.filter((a: any) => a.direcao === "piorou");
  const melhoraram = alertas.alertas.filter((a: any) => a.direcao === "melhorou");
  const acimaDoLimiar = painel?.concentracao.filter((c) => c.acima_do_limiar) ?? [];
  const maioresExpostos = (painel?.concentracao ?? dashboard.maiores_expostos.map((m) => ({ ...m, pct_da_carteira: 0, acima_do_limiar: false }))).slice(0, 6);
  const totalAcoesPendentes = (painel?.reajustes_pendentes.length ?? 0) + (painel?.reanalise_pendentes.length ?? 0);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        subtitle={
          dashboard.atualizado_em
            ? `Visão geral da carteira · atualizado em ${new Date(dashboard.atualizado_em).toLocaleDateString("pt-BR")}`
            : "Visão geral da carteira"
        }
        actions={
          <>
            <PeriodoNav />
            <Link
              href={`/clientes?periodo=${periodo}`}
              className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-frost border border-line rounded-xl px-3 py-2 transition-colors"
            >
              Ver clientes <ArrowUpRight size={14} />
            </Link>
            <a
              href={exportCarteiraUrl}
              className="flex items-center gap-1.5 text-sm font-medium text-frost hover:text-frostdark border border-frost/30 rounded-xl px-3 py-2 transition-colors"
            >
              <Download size={14} /> Exportar Excel
            </a>
          </>
        }
      />

      {/* --- KPIs gerais da carteira --- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Clientes analisados" value={resumo.total_clientes} icon={Users} accent="azul" />
        <StatCard label="Em aberto hoje" value={formatBRL(resumo.total_aberto)} destaque icon={Wallet} />
        <StatCard
          label="Em aberto no mês"
          accent="azul"
          value={visao ? formatBRL(visao.em_aberto_mes.valor) : "—"}
          icon={CalendarClock}
          hint={
            visao
              ? `a vencer ${formatBRL(visao.em_aberto_mes.a_vencer_valor)} · vencido ${formatBRL(visao.em_aberto_mes.vencido_valor)}`
              : "indisponível agora"
          }
        />
        <StatCard
          label="Vencidos"
          value={visao ? formatBRL(visao.vencidos.valor) : "—"}
          tone={visao && visao.vencidos.valor > 0 ? "vermelho" : "neutro"}
          icon={AlertTriangle}
          hint={
            visao
              ? `${visao.vencidos.qtd_titulos} título(s) · ${visao.vencidos.qtd_clientes} cliente(s) · ${formatPct(visao.vencidos.pct_do_aberto)} do aberto`
              : "indisponível agora"
          }
        />
        <StatCard
          label="Recebido no mês"
          value={visao ? formatBRL(visao.recebido_mes.valor) : "—"}
          tone={visao && visao.recebido_mes.valor > 0 ? "verde" : "neutro"}
          icon={HandCoins}
          hint={visao ? `${visao.recebido_mes.qtd_titulos} título(s) pago(s)` : "indisponível agora"}
        />
        <StatCard label="Score médio" value={formatNumero(resumo.score_medio, 1)} icon={Gauge} accent="roxo" />
      </div>

      {/* --- destaques do período escolhido no topo (mês atual / 6 meses / tudo) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatCard
          label="Maior compra"
          accent="azul"
          icon={TrendingUp}
          value={destaques.maior_compra ? formatBRL(destaques.maior_compra.valor) : "—"}
          hint={
            destaques.maior_compra
              ? `${destaques.maior_compra.cliente} · ${PERIODO_ROTULO[periodo]}`
              : `sem títulos ${PERIODO_ROTULO[periodo]}`
          }
        />
        <StatCard
          label="Maior atraso hoje"
          tone={destaques.maior_atraso ? "vermelho" : "neutro"}
          icon={Clock}
          value={destaques.maior_atraso ? `${destaques.maior_atraso.dias} dias` : "Em dia"}
          hint={
            destaques.maior_atraso
              ? `${destaques.maior_atraso.cliente} · ${PERIODO_ROTULO[periodo]}`
              : `nenhum título em atraso ${PERIODO_ROTULO[periodo]}`
          }
        />
      </div>

      {/* --- vencidos por tempo de atraso + por carteira (coluna Conta do ERP) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VencidosPorFaixa visao={visao} />
        <PorCarteira visao={visao} />
      </div>

      {/* --- por vendedor --- */}
      <PorVendedor visao={visao} />

      {/* --- distribuição por faixa de risco --- */}
      <div>
        <p className="text-xs text-muted uppercase tracking-wide mb-2">Carteira por faixa de risco</p>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Verde"
            value={resumo.contagem_faixas.verde || 0}
            tone="verde"
            href={`/clientes?faixa=verde&periodo=${periodo}`}
            hint="clique para ver a lista"
          />
          <StatCard
            label="Amarelo"
            value={resumo.contagem_faixas.amarelo || 0}
            tone="amarelo"
            href={`/clientes?faixa=amarelo&periodo=${periodo}`}
            hint="clique para ver a lista"
          />
          <StatCard
            label="Vermelho"
            value={resumo.contagem_faixas.vermelho || 0}
            tone="vermelho"
            href={`/clientes?faixa=vermelho&periodo=${periodo}`}
            hint="clique para ver a lista"
          />
        </div>
      </div>

      {/* --- o que precisa de atenção agora --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard
          label="Ações pendentes em Créditos"
          value={totalAcoesPendentes}
          tone={totalAcoesPendentes > 0 ? "vermelho" : "neutro"}
          href="/creditos"
          hint="reajustes + reanálises aguardando decisão"
          icon={ClipboardList}
        />
        <StatCard
          label="Clientes que pioraram de faixa"
          value={pioraram.length}
          tone={pioraram.length > 0 ? "vermelho" : "neutro"}
          href="/alertas"
          hint="desde o último relatório importado"
          icon={ArrowDownRight}
        />
        <StatCard
          label="Clientes que melhoraram de faixa"
          value={melhoraram.length}
          tone={melhoraram.length > 0 ? "verde" : "neutro"}
          href="/alertas"
          hint="desde o último relatório importado"
          icon={ArrowUpRight}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* --- concentração de risco --- */}
        <SectionCard
          tone="amarelo"
          title={
            <span className="flex items-center gap-1.5">
              <Gauge size={13} /> Maiores expostos — concentração de risco
            </span>
          }
        >
          {maioresExpostos.length === 0 ? (
            <p className="text-sm text-muted">Sem dados suficientes ainda.</p>
          ) : (
            <div className="space-y-2">
              {maioresExpostos.map((c: any) => (
                <div key={c.cliente} className="flex items-center gap-3 text-sm">
                  <Link
                    href={`/clientes/${codigoCliente(c.cliente)}`}
                    className="text-ink font-medium hover:text-frost w-40 truncate shrink-0"
                    title={c.cliente}
                  >
                    {c.cliente}
                  </Link>
                  <div className="flex-1 bg-base rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${c.acima_do_limiar ? "bg-vermelho" : "bg-frost"}`}
                      style={{
                        width: `${Math.min(100, (c.valor_em_aberto / resumo.total_aberto) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="tabular text-ink w-28 text-right text-xs shrink-0">
                    {formatBRL(c.valor_em_aberto)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {acimaDoLimiar.length > 0 && (
            <p className="text-xs text-vermelho mt-3">
              {acimaDoLimiar.length} cliente(s) acima do limiar de concentração configurado.
            </p>
          )}
        </SectionCard>

        {/* --- últimas decisões --- */}
        <SectionCard
          tone="roxo"
          title={
            <span className="flex items-center gap-1.5">
              <ClipboardList size={13} /> Últimas decisões de crédito
            </span>
          }
          actions={
            <Link href="/clientes" className="text-xs font-medium text-frost hover:text-frostdark">
              ver clientes →
            </Link>
          }
        >
          {decisoesRecentes.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma decisão registrada ainda.</p>
          ) : (
            <div className="space-y-2">
              {decisoesRecentes.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm gap-3">
                  <div className="truncate">
                    <Link href={`/clientes/${codigoCliente(d.cliente)}`} className="text-ink font-medium hover:text-frost">
                      {d.cliente}
                    </Link>
                    <span className="text-muted ml-2 text-xs">
                      {TIPO_DECISAO_LABEL[d.tipo] || capitalizar(d.tipo)}
                    </span>
                  </div>
                  <span className="tabular text-muted text-xs shrink-0">
                    {new Date(d.criado_em).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* --- aging da carteira --- */}
        <SectionCard
          tone="azul"
          title={
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> Aging dos títulos em aberto
            </span>
          }
          actions={
            <Link href="/creditos" className="text-xs font-medium text-frost hover:text-frostdark">
              ver painel de créditos →
            </Link>
          }
        >
          {!painel || Object.keys(painel.aging_resumo).length === 0 ? (
            <p className="text-sm text-muted">
              {painel ? "Sem títulos em aberto na última foto importada." : "Não foi possível carregar o aging agora."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {ORDEM_AGING.filter((k) => painel.aging_resumo[k]).map((k) => (
                <div key={k} className={`border border-line border-l-4 ${k === "vencido" ? "border-l-vermelho" : "border-l-azul"} rounded-xl px-3 py-2`}>
                  <p className="text-xs text-muted">{AGING_LABEL[k]}</p>
                  <p className={`text-sm font-semibold tabular mt-0.5 ${k === "vencido" ? "text-vermelho" : "text-ink"}`}>
                    {formatBRL(painel.aging_resumo[k].valor_total)}
                  </p>
                  <p className="text-xs text-muted">{painel.aging_resumo[k].qtd_titulos} título(s)</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* --- levantamento do que tem para receber, por período: o que já --- */}
        {/* --- venceu e não entrou, mais o que vai vencer em até 8/14/21 --- */}
        {/* --- dias e depois disso — as 5 fatias somam 100% do saldo em aberto --- */}
        {/* --- na última foto importada (ver fluxo_caixa.py) --- */}
        <SectionCard
          tone="frost"
          title={
            <span className="flex items-center gap-1.5">
              <FileBarChart size={13} /> A receber, por período de vencimento
            </span>
          }
        >
          {!painel ? (
            <p className="text-sm text-muted">Não foi possível carregar a projeção agora.</p>
          ) : (
            <>
              {painel.fluxo_caixa.diagnostico?.data_captura && (
                <p className="mb-3 text-xs text-muted">
                  Última atualização dos títulos em aberto:{" "}
                  <span className="font-medium text-ink">
                    {formatDataBR(painel.fluxo_caixa.diagnostico.data_captura)}
                  </span>
                  {" · "}
                  <Link href="/upload" className="underline font-medium">
                    Atualizar relatórios
                  </Link>
                </p>
              )}
              {painel.fluxo_caixa.diagnostico?.sem_vencimentos_futuros && (
                <p role="alert" className="mb-3 rounded-xl border border-amarelo/40 bg-amarelobg px-3 py-2 text-xs text-amarelo">
                  O relatório importado não tem títulos com vencimento futuro (o último vence em{" "}
                  {formatDataBR(painel.fluxo_caixa.diagnostico.vencimento_max)}). Exporte do ERP sem limite de data final
                  de vencimento para ver o que vai vencer em 8, 14 e 21 dias e o aging inicial/intermediário.{" "}
                  <Link href="/upload" className="underline font-medium">
                    Atualizar relatórios
                  </Link>
                </p>
              )}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="border border-vermelho/30 border-l-4 border-l-vermelho bg-vermelhobg rounded-xl px-3 py-2">
                  <p className="text-xs text-vermelho flex items-center gap-1">
                    <AlertTriangle size={11} /> Já vencido
                  </p>
                  <p className="text-sm font-semibold tabular mt-0.5 text-vermelho">
                    {formatBRL(painel.fluxo_caixa.vencido?.valor_total ?? 0)}
                  </p>
                  <p className="text-xs text-vermelho/80">
                    {painel.fluxo_caixa.vencido?.qtd_titulos ?? 0} título(s) em atraso
                  </p>
                </div>
                <div className="border border-line border-l-4 border-l-roxo rounded-xl px-3 py-2">
                  <p className="text-xs text-muted">Vence depois de 21 dias</p>
                  <p className="text-sm font-semibold tabular mt-0.5 text-ink">
                    {formatBRL(painel.fluxo_caixa.mais_de_21_dias?.valor_total ?? 0)}
                  </p>
                  <p className="text-xs text-muted">
                    {painel.fluxo_caixa.mais_de_21_dias?.qtd_titulos ?? 0} título(s) a prazo mais longo
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {JANELAS.map((j) => (
                  <div key={j.chave} className="border border-line border-l-4 border-l-azul rounded-xl px-3 py-2">
                    <p className="text-xs text-muted">{j.rotulo}</p>
                    <p className="text-sm font-semibold tabular mt-0.5 text-ink">
                      {formatBRL(painel.fluxo_caixa[j.chave]?.valor_cheio ?? 0)}
                    </p>
                    <p className="text-xs text-muted">
                      previsão: {formatBRL(painel.fluxo_caixa[j.chave]?.valor_ponderado ?? 0)}
                    </p>
                    <p className="text-xs text-muted/70">
                      {painel.fluxo_caixa[j.chave]?.qtd_titulos ?? 0} título(s)
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted mt-2">
                "Vencido" e "depois de 21 dias" mostram o valor cheio dos títulos em aberto. Já
                as 3 faixas de projeção trazem o valor cheio e, ao lado, o valor ponderado pela
                velocidade histórica de pagamento de cada cliente — a previsão real de entrada.
              </p>
              {painel.fluxo_caixa.diagnostico && (
                <p className="text-xs text-muted/70 mt-3 pt-2 border-t border-line">
                  Baseado na foto de{" "}
                  {painel.fluxo_caixa.diagnostico.data_captura
                    ? formatDataBR(painel.fluxo_caixa.diagnostico.data_captura)
                    : "data desconhecida"}{" "}
                  · {painel.fluxo_caixa.diagnostico.total_titulos} título(s) em aberto ·
                  vencimentos de{" "}
                  {painel.fluxo_caixa.diagnostico.vencimento_min
                    ? formatDataBR(painel.fluxo_caixa.diagnostico.vencimento_min)
                    : "—"}{" "}
                  a{" "}
                  {painel.fluxo_caixa.diagnostico.vencimento_max
                    ? formatDataBR(painel.fluxo_caixa.diagnostico.vencimento_max)
                    : "—"}
                  {painel.fluxo_caixa.diagnostico.sem_data_vencimento > 0 &&
                    ` · ${painel.fluxo_caixa.diagnostico.sem_data_vencimento} título(s) sem data de vencimento (não entram em nenhuma faixa)`}
                </p>
              )}
            </>
          )}
        </SectionCard>
      </div>
    </div>
  );
}