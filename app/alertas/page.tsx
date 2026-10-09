"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAlertas, formatBRL, type AlertasResponse } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { PaginaAlertasSkeleton } from "@/components/ui/Skeleton";
import { TableShell, theadRowClass, thClass, tdClass, trClass } from "@/components/ui/Table";
import { BellRing, TrendingUp, TrendingDown } from "lucide-react";

const FAIXA_STYLE: Record<string, string> = {
  verde: "bg-verdebg text-verde",
  amarelo: "bg-amarelobg text-amarelo",
  vermelho: "bg-vermelhobg text-vermelho",
};

export default function AlertasPage() {
  const [data, setData] = useState<AlertasResponse | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetchAlertas()
      .then(setData)
      .catch((e) => setErro(e.message));
  }, []);

  if (erro) {
    return (
      <div className="border border-vermelho/30 bg-vermelhobg text-vermelho rounded-xl px-4 py-3 text-sm">
        Não consegui buscar os alertas ({erro}).
      </div>
    );
  }

  if (!data) return <PaginaAlertasSkeleton />;

  return (
    <div>
      <PageHeader
        title="Alertas de mudança de faixa"
        subtitle="Clientes que subiram ou desceram de faixa de risco entre as duas últimas vezes que você importou relatórios — pra agir antes que um problema cresça."
      />

      {!data.disponivel ? (
        <p className="text-sm text-muted">{data.mensagem}</p>
      ) : (
        <>
          {data.data_atual && data.data_anterior && (
            <p className="text-xs text-muted uppercase tracking-wide mb-4">
              Comparando {new Date(data.data_anterior).toLocaleDateString("pt-BR")} →{" "}
              {new Date(data.data_atual).toLocaleDateString("pt-BR")}
            </p>
          )}

          {data.alertas.length === 0 ? (
            <div className="border border-dashed border-line rounded-2xl bg-panel px-4 py-10 text-center">
              <BellRing size={22} className="mx-auto text-muted mb-2" strokeWidth={1.8} />
              <p className="text-sm text-muted">
                Nenhum cliente mudou de faixa entre as duas últimas capturas.
              </p>
            </div>
          ) : (
            <TableShell>
              <thead>
                <tr className={theadRowClass}>
                  <th className={thClass}>Cliente</th>
                  <th className={thClass}>Antes</th>
                  <th className={thClass}>Agora</th>
                  <th className={thClass}>Direção</th>
                  <th className={thClass}>Em aberto</th>
                </tr>
              </thead>
              <tbody>
                {data.alertas.map((a) => (
                  <tr key={a.cliente} className={trClass}>
                    <td className={tdClass}>
                      <Link
                        href={`/clientes/${encodeURIComponent(a.cliente)}`}
                        className="text-ink font-medium hover:text-frost"
                      >
                        {a.cliente}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold tabular ${FAIXA_STYLE[a.faixa_anterior]}`}
                      >
                        {a.score_anterior}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold tabular ${FAIXA_STYLE[a.faixa_atual]}`}
                      >
                        {a.score_atual}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 font-medium flex items-center gap-1.5 ${
                        a.direcao === "piorou" ? "text-vermelho" : "text-verde"
                      }`}
                    >
                      {a.direcao === "piorou" ? (
                        <TrendingDown size={14} />
                      ) : (
                        <TrendingUp size={14} />
                      )}
                      {a.direcao === "piorou" ? "piorou" : "melhorou"}
                    </td>
                    <td className={`${tdClass} tabular`}>{formatBRL(a.valor_em_aberto)}</td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          )}
        </>
      )}
    </div>
  );
}
