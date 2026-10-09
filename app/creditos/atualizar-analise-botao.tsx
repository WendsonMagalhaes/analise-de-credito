"use client";

import { useState, useTransition } from "react";
import { atualizarAnaliseCreditoAction } from "@/app/actions/creditos";
import { RefreshCw, Loader2 } from "lucide-react";

export default function AtualizarAnaliseBotao() {
  const [isPending, startTransition] = useTransition();
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function atualizar() {
    setErro(null);
    setMensagem(null);
    startTransition(async () => {
      try {
        const r = await atualizarAnaliseCreditoAction();
        setMensagem(
          `${r.clientes_recalculados} cliente(s) recalculado(s) · ${r.novos_alertas_preditivos} alerta(s) novo(s)`
        );
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao atualizar.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={atualizar}
        disabled={isPending}
        className="flex items-center gap-2 bg-frost text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft hover:bg-frostdark hover:shadow-glow active:scale-[0.98] disabled:opacity-40 transition-all"
      >
        {isPending ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
        {isPending ? "Atualizando…" : "Atualizar análise agora"}
      </button>
      {mensagem && <span className="text-xs text-muted">{mensagem}</span>}
      {erro && <span className="text-xs text-vermelho">{erro}</span>}
    </div>
  );
}
