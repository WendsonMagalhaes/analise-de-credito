"use client";

import { OPCOES_PERIODO, type Periodo } from "@/lib/periodo";

/**
 * Seletor de período (Mês atual / 6 meses / Tudo) no estilo do projeto:
 * item ativo na cor da marca, textos sem quebra de linha, sem efeito de hover colorido.
 */
export default function PeriodoFiltro({
  valor,
  onChange,
  className = "",
}: {
  valor: Periodo;
  onChange: (p: Periodo) => void;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Período"
      className={`inline-flex w-full sm:w-auto rounded-xl border border-line bg-panel p-1 ${className}`}
    >
      {OPCOES_PERIODO.map((o) => {
        const ativo = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={ativo}
            title={o.dica}
            onClick={() => onChange(o.valor)}
            className={`flex-1 sm:flex-none whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
              ativo ? "bg-frost text-white shadow-soft" : "text-muted hover:text-ink"
            }`}
          >
            {o.rotulo}
          </button>
        );
      })}
    </div>
  );
}
