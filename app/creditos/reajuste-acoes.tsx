"use client";

import { useState, useTransition } from "react";
import { aprovarReajusteAction, rejeitarReajusteAction } from "@/app/actions/reajustes";
import { Check, X } from "lucide-react";

export default function ReajusteAcoes({ reajusteId }: { reajusteId: number }) {
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function aprovar() {
    setErro(null);
    startTransition(async () => {
      try {
        await aprovarReajusteAction(reajusteId, "analista");
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao aprovar.");
      }
    });
  }

  function rejeitar() {
    setErro(null);
    startTransition(async () => {
      try {
        await rejeitarReajusteAction(reajusteId, "analista");
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao rejeitar.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          onClick={aprovar}
          disabled={isPending}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-verde text-white text-xs font-medium shadow-soft hover:shadow-glow disabled:opacity-50 transition-all"
        >
          <Check size={12} /> Aprovar
        </button>
        <button
          onClick={rejeitar}
          disabled={isPending}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-line text-ink text-xs font-medium hover:bg-panel2 disabled:opacity-50 transition-colors"
        >
          <X size={12} /> Rejeitar
        </button>
      </div>
      {erro && <span className="text-xs text-vermelho">{erro}</span>}
    </div>
  );
}
