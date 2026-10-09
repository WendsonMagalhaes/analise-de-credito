"use client";

import { useState, useTransition } from "react";
import { resolverGatilhoReanaliseAction } from "@/app/actions/reanalise";
import { CheckCircle2 } from "lucide-react";

export default function ResolverGatilhoBotao({ gatilhoId }: { gatilhoId: number }) {
  const [isPending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function resolver() {
    setErro(null);
    startTransition(async () => {
      try {
        await resolverGatilhoReanaliseAction(gatilhoId);
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Erro ao resolver.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={resolver}
        disabled={isPending}
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-line text-ink text-xs font-medium hover:bg-panel2 disabled:opacity-50 transition-colors"
      >
        <CheckCircle2 size={12} /> Marcar como resolvido
      </button>
      {erro && <span className="text-xs text-vermelho">{erro}</span>}
    </div>
  );
}
