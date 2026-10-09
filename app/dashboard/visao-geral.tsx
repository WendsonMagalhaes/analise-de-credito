import Link from "next/link";
import { formatBRL, type VisaoGeral } from "@/lib/api";
import { SectionCard } from "@/components/ui/SectionCard";
import { Badge } from "@/components/ui/Badge";
import { TableShell, theadRowClass, thClass, tdClass, trClass, EmptyRow } from "@/components/ui/Table";
import { AlertTriangle, Briefcase, Landmark } from "lucide-react";
import { formatDias, formatPct, primeiraMaiuscula } from "@/lib/format";

/** Tom do selo conforme o % do valor em aberto que já venceu. */
function tomInadimplencia(pct: number) {
  return pct >= 40 ? "vermelho" : pct >= 20 ? "amarelo" : "verde";
}

function Erro({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}

export function VencidosPorFaixa({ visao }: { visao: VisaoGeral | null }) {
  const v = visao?.vencidos;
  const maior = Math.max(0, ...(v?.faixas.map((f) => f.valor) ?? [0]));
  return (
    <SectionCard
      tone="vermelho"
      title={
        <span className="flex items-center gap-1.5">
          <AlertTriangle size={13} /> Vencidos por tempo de atraso
        </span>
      }
    >
      {!v ? (
        <Erro>Não foi possível carregar os vencidos agora.</Erro>
      ) : v.qtd_titulos === 0 ? (
        <Erro>Nenhum título vencido na última foto importada. 🎉</Erro>
      ) : (
        <>
          <div className="space-y-2.5">
            {v.faixas.map((f) => (
              <div key={f.faixa} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 text-muted text-xs">{primeiraMaiuscula(f.faixa)}</span>
                <div className="flex-1 bg-base rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-vermelho"
                    style={{ width: `${maior > 0 ? (f.valor / maior) * 100 : 0}%` }}
                  />
                </div>
                <span className="tabular text-ink w-28 text-right text-xs shrink-0">{formatBRL(f.valor)}</span>
                <span className="tabular text-muted w-16 text-right text-xs shrink-0">{f.qtd_titulos} tít.</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-3 pt-2 border-t border-line">
            {v.qtd_titulos} título(s) de {v.qtd_clientes} cliente(s) · {formatPct(v.pct_do_aberto)} de tudo que está em aberto
            {v.maior_atraso_dias != null && ` · maior atraso: ${v.maior_atraso_dias} dias`}
          </p>
        </>
      )}
    </SectionCard>
  );
}

export function PorCarteira({ visao }: { visao: VisaoGeral | null }) {
  return (
    <SectionCard
      tone="azul"
      title={
        <span className="flex items-center gap-1.5">
          <Landmark size={13} /> Em aberto por carteira (plano de conta)
        </span>
      }
    >
      {!visao ? (
        <Erro>Não foi possível carregar as carteiras agora.</Erro>
      ) : visao.por_carteira.length === 0 ? (
        <Erro>Sem títulos em aberto na última foto importada.</Erro>
      ) : (
        <>
          {!visao.carteira_informada && (
            <p className="text-xs text-amarelo bg-amarelobg rounded-xl px-3 py-2 mb-3">
              A coluna “Plano de Conta” ainda não foi gravada para estes títulos. Reenvie o relatório de títulos em aberto em{" "}
              <Link href="/upload" className="underline font-medium">
                Atualizar relatórios
              </Link>{" "}
              para preencher (não duplica nada).
            </p>
          )}
          <div className="space-y-3">
            {visao.por_carteira.map((c) => (
              <div key={c.carteira} className="text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ink font-medium truncate" title={c.carteira}>
                    {c.carteira}
                  </span>
                  <span className="tabular text-ink text-xs shrink-0">
                    {formatBRL(c.valor_aberto)} <span className="text-muted">({formatPct(c.pct_do_aberto)})</span>
                  </span>
                </div>
                <div className="bg-base rounded-full h-2 overflow-hidden my-1">
                  <div className="h-2 rounded-full bg-frost" style={{ width: `${Math.min(100, c.pct_do_aberto)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted">
                  <span>
                    {c.qtd_clientes} cliente(s) · {c.qtd_titulos} título(s)
                  </span>
                  <span className={c.valor_vencido > 0 ? "text-vermelho" : ""}>
                    vencido: {formatBRL(c.valor_vencido)} ({formatPct(c.pct_vencido)})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </SectionCard>
  );
}

export function PorVendedor({ visao }: { visao: VisaoGeral | null }) {
  const lista = visao?.por_vendedor ?? [];
  return (
    <SectionCard
      tone="roxo"
      title={
        <span className="flex items-center gap-1.5">
          <Briefcase size={13} /> Carteira por vendedor
        </span>
      }
      actions={
        visao && visao.vendedores_total > lista.length ? (
          <span className="text-xs text-muted">
            top {lista.length} de {visao.vendedores_total} por valor em aberto
          </span>
        ) : undefined
      }
    >
      {!visao ? (
        <Erro>Não foi possível carregar os vendedores agora.</Erro>
      ) : (
        <TableShell className="border-0 shadow-none rounded-none">
          <thead>
            <tr className={theadRowClass}>
              <th className={thClass}>Vendedor</th>
              <th className={`${thClass} text-right`}>Clientes</th>
              <th className={`${thClass} text-right`}>Em aberto</th>
              <th className={`${thClass} text-right`}>% da carteira</th>
              <th className={`${thClass} text-right`}>Vencido</th>
              <th className={`${thClass} text-right`}>% vencido</th>
              <th className={`${thClass} text-right`}>Recebido no mês</th>
              <th className={`${thClass} text-right`}>Atraso médio (90d)</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && <EmptyRow colSpan={8}>Sem títulos em aberto na última foto importada.</EmptyRow>}
            {lista.map((v) => (
              <tr key={v.vendedor} className={trClass}>
                <td className={`${tdClass} font-medium whitespace-nowrap`}>{v.vendedor}</td>
                <td className={`${tdClass} tabular text-right`}>{v.qtd_clientes}</td>
                <td className={`${tdClass} tabular text-right`}>{formatBRL(v.valor_aberto)}</td>
                <td className={`${tdClass} tabular text-right text-muted`}>{formatPct(v.pct_do_aberto)}</td>
                <td className={`${tdClass} tabular text-right ${v.valor_vencido > 0 ? "text-vermelho" : "text-muted"}`}>
                  {formatBRL(v.valor_vencido)}
                </td>
                <td className={`${tdClass} text-right`}>
                  <Badge tone={tomInadimplencia(v.pct_vencido)}>{formatPct(v.pct_vencido)}</Badge>
                </td>
                <td className={`${tdClass} tabular text-right`}>{formatBRL(v.recebido_mes)}</td>
                <td className={`${tdClass} tabular text-right text-muted`}>
                  {formatDias(v.atraso_medio_90d)}
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </SectionCard>
  );
}
