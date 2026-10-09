"use client";

import { useEffect, useState, useTransition } from "react";
import {
  adicionarClienteExcluido,
  fetchClientesExcluidos,
  fetchPeriodosSazonais,
  removerClienteExcluido,
  type ClienteExcluido,
  type PeriodoSazonal,
} from "@/lib/api";
import {
  criarPeriodoSazonalAction,
  removerPeriodoSazonalAction,
} from "@/app/actions/config";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonTabela } from "@/components/ui/Skeleton";
import { UserX, CalendarRange, Trash2, Plus, Loader2 } from "lucide-react";

export default function ConfiguracoesPage() {
  const [lista, setLista] = useState<ClienteExcluido[]>([]);
  const [nome, setNome] = useState("");
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  // true só até a PRIMEIRA resposta de cada lista — sem isso a tela mostrava
  // "nenhuma exclusão cadastrada" enquanto os dados ainda estavam a caminho.
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [carregandoPeriodos, setCarregandoPeriodos] = useState(true);

  // --- períodos sazonais (comparativo sazonal) ---
  const [periodos, setPeriodos] = useState<PeriodoSazonal[]>([]);
  const [nomePeriodo, setNomePeriodo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [erroPeriodo, setErroPeriodo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    carregar();
    carregarPeriodos();
  }, []);

  function carregarPeriodos() {
    fetchPeriodosSazonais()
      .then(setPeriodos)
      .catch((e) => setErroPeriodo(e.message))
      .finally(() => setCarregandoPeriodos(false));
  }

  function adicionarPeriodo() {
    if (!nomePeriodo.trim() || !dataInicio || !dataFim) return;
    setErroPeriodo(null);
    startTransition(async () => {
      try {
        await criarPeriodoSazonalAction(nomePeriodo.trim(), dataInicio, dataFim);
        setNomePeriodo("");
        setDataInicio("");
        setDataFim("");
        carregarPeriodos();
      } catch (e) {
        setErroPeriodo(e instanceof Error ? e.message : "Falha ao cadastrar período");
      }
    });
  }

  function removerPeriodo(id: number) {
    startTransition(async () => {
      try {
        await removerPeriodoSazonalAction(id);
        carregarPeriodos();
      } catch (e) {
        setErroPeriodo(e instanceof Error ? e.message : "Falha ao remover período");
      }
    });
  }

  useEffect(() => {
    carregar();
  }, []);

  function carregar() {
    fetchClientesExcluidos()
      .then(setLista)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregandoLista(false));
  }

  async function adicionar() {
    if (!nome.trim()) return;
    setSalvando(true);
    setErro(null);
    try {
      await adicionarClienteExcluido(nome.trim(), motivo.trim());
      setNome("");
      setMotivo("");
      carregar();
    } catch (e: any) {
      setErro(e.message || "Falha ao adicionar");
    } finally {
      setSalvando(false);
    }
  }

  async function remover(cliente: string) {
    try {
      await removerClienteExcluido(cliente);
      carregar();
    } catch (e: any) {
      setErro(e.message || "Falha ao remover");
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Configurações"
        subtitle="Regras auxiliares que ajustam como a carteira é calculada."
      />

      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink mb-1">
        <UserX size={15} className="text-frost" /> Nomes excluídos da carteira
      </h2>
      <p className="text-sm text-muted mb-6">
        Alguns nomes aparecem no relatório do ERP como se fossem clientes, mas na verdade são
        categorias contábeis internas (avaria, quebra de estoque, bonificação etc.). O sistema já
        filtra automaticamente os nomes mais comuns — use esta lista para excluir outros casos
        específicos da sua distribuidora, pra eles não entrarem nas decisões de crédito.
      </p>

      <div className="border border-line rounded-2xl bg-panel p-5 mb-6 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome exatamente como aparece no relatório"
            className="border border-line rounded-xl px-3 py-2 text-sm bg-panel text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/30 focus:border-frost transition-colors md:col-span-2"
          />
          <input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Motivo (opcional)"
            className="border border-line rounded-xl px-3 py-2 text-sm bg-panel text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/30 focus:border-frost transition-colors"
          />
        </div>
        <button
          onClick={adicionar}
          disabled={salvando || !nome.trim()}
          className="flex items-center gap-2 bg-frost text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft hover:bg-frostdark hover:shadow-glow active:scale-[0.98] disabled:opacity-40 transition-all"
        >
          {salvando ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {salvando ? "Salvando…" : "Excluir da carteira"}
        </button>
        {erro && <p className="text-vermelho text-sm mt-2">{erro}</p>}
      </div>

      {carregandoLista ? (
        <SkeletonTabela colunas={3} linhas={3} />
      ) : lista.length > 0 ? (
        <div className="border border-line rounded-2xl overflow-hidden bg-panel shadow-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] text-muted uppercase tracking-wide bg-panel2">
                <th className="px-4 py-2 font-semibold">Nome</th>
                <th className="px-4 py-2 font-semibold">Motivo</th>
                <th className="px-4 py-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0 hover:bg-panel2/70 transition-colors">
                  <td className="px-4 py-2 text-ink">{c.cliente}</td>
                  <td className="px-4 py-2 text-muted">{c.motivo || "—"}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => remover(c.cliente)}
                      className="inline-flex items-center gap-1 text-vermelho text-xs font-medium hover:underline"
                    >
                      <Trash2 size={12} /> remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted">
          Nenhuma exclusão manual cadastrada ainda (os nomes padrão de categorias contábeis já são
          filtrados automaticamente).
        </p>
      )}

      <div className="border-t border-line mt-10 pt-8">
        <h2 className="flex items-center gap-1.5 text-xl font-semibold text-ink tracking-tight mb-2">
          <CalendarRange size={18} className="text-frost" /> Períodos sazonais
        </h2>
        <p className="text-sm text-muted mb-6">
          Marque datas comemorativas ou picos de demanda. Atrasos de pagamento com vencimento
          dentro desses períodos são sinalizados separadamente nas análises de tendência, em vez
          de contarem contra o cliente do mesmo jeito que um atraso comum.
        </p>

        <div className="border border-line rounded-2xl bg-panel p-5 mb-6 shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <input
              value={nomePeriodo}
              onChange={(e) => setNomePeriodo(e.target.value)}
              placeholder="Nome (ex.: Natal 2026)"
              className="border border-line rounded-xl px-3 py-2 text-sm bg-panel text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/30 focus:border-frost transition-colors md:col-span-2"
            />
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="border border-line rounded-xl px-3 py-2 text-sm bg-panel text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/30 focus:border-frost transition-colors"
            />
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border border-line rounded-xl px-3 py-2 text-sm bg-panel text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/30 focus:border-frost transition-colors"
            />
          </div>
          <button
            onClick={adicionarPeriodo}
            disabled={isPending || !nomePeriodo.trim() || !dataInicio || !dataFim}
            className="flex items-center gap-2 bg-frost text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft hover:bg-frostdark hover:shadow-glow active:scale-[0.98] disabled:opacity-40 transition-all"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            {isPending ? "Salvando…" : "Cadastrar período"}
          </button>
          {erroPeriodo && <p className="text-vermelho text-sm mt-2">{erroPeriodo}</p>}
        </div>

        {carregandoPeriodos ? (
          <SkeletonTabela colunas={4} linhas={3} />
        ) : periodos.length > 0 ? (
          <div className="border border-line rounded-2xl overflow-hidden bg-panel shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] text-muted uppercase tracking-wide bg-panel2">
                  <th className="px-4 py-2 font-semibold">Nome</th>
                  <th className="px-4 py-2 font-semibold">Início</th>
                  <th className="px-4 py-2 font-semibold">Fim</th>
                  <th className="px-4 py-2 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {periodos.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0 hover:bg-panel2/70 transition-colors">
                    <td className="px-4 py-2 text-ink">{p.nome}</td>
                    <td className="px-4 py-2 text-muted">
                      {new Date(p.data_inicio).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-2 text-muted">
                      {new Date(p.data_fim).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => removerPeriodo(p.id)}
                        className="inline-flex items-center gap-1 text-vermelho text-xs font-medium hover:underline"
                      >
                        <Trash2 size={12} /> remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">Nenhum período sazonal cadastrado ainda.</p>
        )}
      </div>
    </div>
  );
}
