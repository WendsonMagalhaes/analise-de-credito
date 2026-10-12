"use client";

import { useState, useTransition } from "react";
import { simularWhatIfAction } from "@/app/actions/whatif";
import { formatBRL, type WhatIfResultado } from "@/lib/api";
import { FlaskConical, Loader2 } from "lucide-react";
import { formatNumero, formatPct } from "@/lib/format";

export default function WhatIfSimulador({ cliente }: { cliente: string }) {
  const [valor, setValor] = useState("");
  const [resultado, setResultado] = useState<WhatIfResultado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function simular() {
    const valorNumerico = Number(valor);
    if (!valorNumerico || valorNumerico <= 0) return;
    setErro(null);
    setResultado(null);
    startTransition(async () => {
      try {
        const r = await simularWhatIfAction(cliente, valorNumerico);
        setResultado(r);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao simular.");
      }
    });
  }

  return (
    <div className="mt-8 border-t border-line pt-8">
      <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink mb-1">
        <FlaskConical size={15} className="text-frost" /> Simular novo pedido (what-if)
      </h2>
      <p className="text-xs text-muted mb-3">
        Não grava nada — só estima o impacto de um pedido novo antes de liberar de verdade.
      </p>
      <div className="flex gap-3 items-end mb-3">
        <div>
          <label className="block text-xs text-muted mb-1">Valor do pedido (R$)</label>
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            type="number"
            className="border border-line rounded-xl px-3 py-2 text-sm bg-panel text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/30 focus:border-frost transition-colors w-48"
          />
        </div>
        <button
          onClick={simular}
          disabled={isPending || !valor}
          className="flex items-center gap-2 bg-frost text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft hover:bg-frostdark hover:shadow-glow active:scale-[0.98] disabled:opacity-40 transition-all"
        >
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {isPending ? "Simulando…" : "Simular"}
        </button>
      </div>
      {erro && <p className="text-vermelho text-sm">{erro}</p>}
      {resultado && (
        <div className="border border-frost/25 border-l-4 border-l-roxo rounded-2xl bg-panel p-4 grid grid-cols-3 gap-3 text-sm shadow-soft">
          <div>
            <p className="text-xs text-muted mb-1">Novo saldo em aberto</p>
            <p className="text-ink font-medium">{formatBRL(resultado.novo_saldo_em_aberto)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Nova utilização (c/ tolerância)</p>
            <p
              className={`font-medium ${resultado.ultrapassa_limite_com_tolerancia ? "text-vermelho" : "text-ink"}`}
            >
              {formatPct(resultado.novo_pct_utilizacao)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Impacto estimado no score</p>
            <p className="text-ink font-medium">
              {formatNumero(resultado.impacto_estimado_score, 0)}
            </p>
          </div>
          {resultado.observacao && (
            <p className="col-span-3 text-xs text-muted">{resultado.observacao}</p>
          )}
        </div>
      )}
    </div>
  );
}
