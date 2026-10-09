import Link from "next/link";
import { fetchPainelCredito, formatBRL, formatDataBR } from "@/lib/api";
import AtualizarAnaliseBotao from "./atualizar-analise-botao";
import ReajusteAcoes from "./reajuste-acoes";
import ResolverGatilhoBotao from "./resolver-gatilho-botao";
import { capitalizar, formatPct } from "@/lib/format";

const AGING_LABEL: Record<string, string> = {
  inicial: "Inicial (0–33% do prazo)",
  intermediaria: "Intermediária (34–66% do prazo)",
  reta_final: "Reta final (67–100% do prazo)",
  vencido: "Vencido (>100% do prazo)",
  sem_dados: "Sem dados de prazo",
};
const ACENTO_AGING: Record<string, string> = {
  inicial: "border-l-verde",
  intermediaria: "border-l-azul",
  reta_final: "border-l-amarelo",
  vencido: "border-l-vermelho",
  sem_dados: "border-l-line",
};
const ORDEM_AGING = ["inicial", "intermediaria", "reta_final", "vencido", "sem_dados"];

const JANELAS: { chave: "ate_8_dias" | "9_a_14_dias" | "15_a_21_dias"; rotulo: string }[] = [
  { chave: "ate_8_dias", rotulo: "Vence em até 8 dias" },
  { chave: "9_a_14_dias", rotulo: "Vence em 9 a 14 dias" },
  { chave: "15_a_21_dias", rotulo: "Vence em 15 a 21 dias" },
];

const ROTULOS_GATILHO: Record<string, string> = {
  uso_tolerancia_excessivo: "Uso excessivo da tolerância no trimestre",
  queda_de_classe: "Queda de classe de risco",
  protesto: "Protesto",
  acao_judicial: "Ação judicial",
  negativacao: "Negativação",
  mudanca_cadastral: "Mudança cadastral do CNPJ",
};

// Página única (Server Component): tudo que antes estava espalhado em 5
// abas agora é uma leitura só (GET /api/creditos/painel) com seções
// empilhadas — mais rápido de bater o olho e comparar do que navegar
// entre telas. O botão no topo é a ação direta pra puxar os números do
// dia, já que ainda não existe um agendador rodando isso sozinho.
export default async function CreditosPage() {
  const painel = await fetchPainelCredito();
  const acimaDoLimiar = painel.concentracao.filter((c) => c.acima_do_limiar);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Créditos</h1>
          <p className="text-sm text-muted mt-1 max-w-2xl">
            Visão única de aging, concentração de risco, fluxo de caixa projetado, reajustes de
            limite e reanálise. Clique em "Atualizar análise agora" depois de cada upload — ainda
            não há um agendador automático configurado pra isso.
          </p>
        </div>
        <AtualizarAnaliseBotao />
      </div>

      {/* --- ação necessária: reajustes de limite --- */}
      <section>
        <h2 className="text-sm font-semibold text-ink mb-1">Reajustes de limite sugeridos</h2>
        <p className="text-xs text-muted mb-3">
          Só aparece aqui depois que um cliente classe A/B acumular 3 snapshots seguidos de
          classificação (ou seja, 3 execuções de "Atualizar análise" em dias diferentes) — é
          normal estar vazio nos primeiros dias de uso.
        </p>
        {painel.reajustes_pendentes.length === 0 ? (
          <EmptyState texto="Nenhum reajuste pendente no momento." />
        ) : (
          <div className="border border-line rounded-2xl overflow-hidden bg-panel shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-base text-muted text-left">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Classe</th>
                  <th className="px-4 py-3">Limite atual</th>
                  <th className="px-4 py-3">Sugerido</th>
                  <th className="px-4 py-3">Aumento</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {painel.reajustes_pendentes.map((r) => (
                  <tr key={r.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <ClienteLink nome={r.cliente} />
                    </td>
                    <td className="px-4 py-3 font-medium">{r.classe}</td>
                    <td className="px-4 py-3">{formatBRL(r.limite_anterior)}</td>
                    <td className="px-4 py-3 font-medium text-verde">
                      {formatBRL(r.limite_sugerido)}
                    </td>
                    <td className="px-4 py-3 text-muted">+{formatPct(r.percentual_aplicado)}</td>
                    <td className="px-4 py-3">
                      <ReajusteAcoes reajusteId={r.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --- ação necessária: reanálise --- */}
      <section>
        <h2 className="text-sm font-semibold text-ink mb-1">Reanálise de crédito pendente</h2>
        <p className="text-xs text-muted mb-3">
          Gatilhos detectados na última atualização (uso excessivo de tolerância, queda de
          classe) + gatilhos externos registrados manualmente na página do cliente.
        </p>
        {painel.reanalise_pendentes.length === 0 ? (
          <EmptyState texto="Nenhuma reanálise pendente no momento." />
        ) : (
          <div className="border border-line rounded-2xl overflow-hidden bg-panel shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-base text-muted text-left">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Motivo</th>
                  <th className="px-4 py-3">Detectado em</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {painel.reanalise_pendentes.map((g) => (
                  <tr key={g.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <ClienteLink nome={g.cliente} />
                    </td>
                    <td className="px-4 py-3">{ROTULOS_GATILHO[g.tipo_gatilho] || capitalizar(g.tipo_gatilho)}</td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(g.criado_em).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <ResolverGatilhoBotao gatilhoId={g.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* --- última atualização dos títulos em aberto --- */}
      {painel.fluxo_caixa.diagnostico?.data_captura && (
        <p className="text-xs text-muted -my-4">
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

      {/* --- aviso: relatório exportado só com vencimentos até hoje --- */}
      {painel.fluxo_caixa.diagnostico?.sem_vencimentos_futuros && (
        <div role="alert" className="rounded-2xl border border-l-4 border-amarelo/40 border-l-amarelo bg-amarelobg px-4 py-3 text-xs text-amarelo">
          <strong>O relatório importado não tem nenhum título com vencimento futuro</strong> (o último vence em{" "}
          {formatDataBR(painel.fluxo_caixa.diagnostico.vencimento_max)}). Por isso “inicial”, “intermediária” e as
          faixas de 9–14 e 15–21 dias aparecem zeradas, e o total em aberto pode estar menor que o real. Se o relatório
          do ERP foi exportado com filtro de <em>data de vencimento até hoje</em>, exporte de novo incluindo os
          vencimentos futuros (sem limite de data final) e envie em{" "}
          <Link href="/upload" className="underline font-medium">
            Atualizar relatórios
          </Link>
          .
        </div>
      )}

      {/* --- leitura: aging da carteira --- */}
      <section>
        <h2 className="text-sm font-semibold text-ink mb-1">Aging da carteira</h2>
        <p className="text-xs text-muted mb-3">Pela data de emissão: quanto do prazo de cada título já passou.</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {/* as 4 faixas aparecem sempre (mesmo zeradas); "sem dados" só se existir */}
          {(Object.keys(painel.aging_resumo).length === 0
            ? []
            : ORDEM_AGING.filter((k) => k !== "sem_dados" || painel.aging_resumo[k])
          ).map((faixa) => (
            <div
              key={faixa}
              className={`border border-l-4 ${ACENTO_AGING[faixa] ?? "border-l-line"} rounded-2xl p-4 shadow-soft ${faixa === "vencido" ? "border-vermelho/40 bg-vermelhobg" : "border-line bg-panel"
                }`}
            >
              <p className="text-xs text-muted mb-2">{AGING_LABEL[faixa] || faixa}</p>
              <p className="text-lg font-semibold text-ink">
                {formatBRL(painel.aging_resumo[faixa]?.valor_total ?? 0)}
              </p>
              <p className="text-xs text-muted mt-1">
                {painel.aging_resumo[faixa]?.qtd_titulos ?? 0} título(s)
              </p>
            </div>
          ))}
          {Object.keys(painel.aging_resumo).length === 0 && (
            <div className="col-span-full">
              <EmptyState texto="Sem títulos em aberto na última foto importada." />
            </div>
          )}
        </div>
      </section>

      {/* --- leitura: a receber, por período de vencimento (faixas exclusivas) --- */}
      <section>
        <h2 className="text-sm font-semibold text-ink mb-3">
          A receber, por período de vencimento (hoje x data de vencimento)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="border border-vermelho/30 border-l-4 border-l-vermelho bg-vermelhobg rounded-2xl p-4 shadow-soft">
            <p className="text-xs text-vermelho mb-2">Já vencido</p>
            <p className="text-lg font-semibold text-vermelho">
              {formatBRL(painel.fluxo_caixa.vencido?.valor_total ?? 0)}
            </p>
            <p className="text-xs text-vermelho/80 mt-1">
              {painel.fluxo_caixa.vencido?.qtd_titulos ?? 0} título(s)
            </p>
          </div>
          {JANELAS.map(({ chave, rotulo }) => {
            const dados = painel.fluxo_caixa[chave];
            return (
              <div key={chave} className="border border-line border-l-4 border-l-azul rounded-2xl bg-panel p-4 shadow-soft">
                <p className="text-xs text-muted mb-2">{rotulo}</p>
                <p className="text-lg font-semibold text-ink">
                  {formatBRL(dados?.valor_cheio ?? 0)}
                </p>
                <p className="text-xs text-muted mt-1">
                  Previsão: {formatBRL(dados?.valor_ponderado ?? 0)} · {dados?.qtd_titulos ?? 0}{" "}
                  título(s)
                </p>
              </div>
            );
          })}
          <div className="border border-line border-l-4 border-l-roxo rounded-2xl bg-panel p-4 shadow-soft">
            <p className="text-xs text-muted mb-2">Depois de 21 dias</p>
            <p className="text-lg font-semibold text-ink">
              {formatBRL(painel.fluxo_caixa.mais_de_21_dias?.valor_total ?? 0)}
            </p>
            <p className="text-xs text-muted mt-1">
              {painel.fluxo_caixa.mais_de_21_dias?.qtd_titulos ?? 0} título(s)
            </p>
          </div>
        </div>
        {painel.fluxo_caixa.diagnostico && (
          <p className="text-xs text-muted/70 mt-2">
            Baseado na foto de{" "}
            {painel.fluxo_caixa.diagnostico.data_captura
              ? formatDataBR(painel.fluxo_caixa.diagnostico.data_captura)
              : "data desconhecida"}{" "}
            · {painel.fluxo_caixa.diagnostico.total_titulos} título(s) em aberto.
          </p>
        )}
      </section>

      {/* --- leitura: concentração de risco --- */}
      <section>
        <h2 className="text-sm font-semibold text-ink mb-1">
          Concentração de risco (top 10 da carteira)
        </h2>
        {acimaDoLimiar.length > 0 && (
          <p className="text-xs text-vermelho mb-3">
            {acimaDoLimiar.length} cliente(s) acima do limiar de concentração configurado.
          </p>
        )}
        {painel.concentracao.length === 0 ? (
          <EmptyState texto="Sem saldo em aberto na carteira calculada." />
        ) : (
          <div className="border border-line rounded-2xl overflow-hidden bg-panel shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-base text-muted text-left">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Valor em aberto</th>
                  <th className="px-4 py-3">% da carteira</th>
                </tr>
              </thead>
              <tbody>
                {painel.concentracao.map((c) => (
                  <tr key={c.cliente} className="border-t border-line">
                    <td className="px-4 py-3">
                      <ClienteLink nome={c.cliente} />
                    </td>
                    <td className="px-4 py-3">{formatBRL(c.valor_em_aberto)}</td>
                    <td className={`px-4 py-3 font-medium ${c.acima_do_limiar ? "text-vermelho" : ""}`}>
                      {formatPct(c.pct_da_carteira, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function ClienteLink({ nome }: { nome: string }) {
  return (
    <Link href={`/clientes/${encodeURIComponent(nome)}`} className="text-ink hover:text-frost transition-colors">
      {nome}
    </Link>
  );
}

function EmptyState({ texto }: { texto: string }) {
  return <div className="border border-line rounded-2xl p-4 text-sm text-muted bg-panel">{texto}</div>;
}