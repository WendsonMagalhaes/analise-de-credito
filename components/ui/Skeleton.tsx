import LoadingSpinner from "./LoadingSpinner";

/**
 * Blocos de "carregando" reutilizáveis. Usam as mesmas cores/bordas dos
 * componentes reais (SectionCard, StatCard, TableShell) para a tela não "pular"
 * quando os dados chegam.
 */

export function Bloco({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-xl bg-panel2 ${className}`} />;
}

/** Envolve um skeleton para leitores de tela anunciarem "carregando". */
export function CarregandoRegiao({ children, rotulo = "Carregando…" }: { children: React.ReactNode; rotulo?: string }) {
  return (
    <div aria-busy="true">
      <LoadingSpinner rotulo={rotulo} />
      {children}
    </div>
  );
}

export function SkeletonCabecalho({ comAcoes = false }: { comAcoes?: boolean }) {
  return (
    <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
      <div className="space-y-2">
        <Bloco className="h-7 w-48" />
        <Bloco className="h-4 w-72 max-w-full" />
      </div>
      {comAcoes && (
        <div className="flex gap-2">
          <Bloco className="h-9 w-28" />
          <Bloco className="h-9 w-36" />
        </div>
      )}
    </div>
  );
}

export function SkeletonKpis({ quantidade = 3 }: { quantidade?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: quantidade }).map((_, i) => (
        <div key={i} className="border border-line rounded-2xl bg-panel px-4 py-3.5 shadow-soft">
          <Bloco className="h-3 w-20 mb-3" />
          <Bloco className="h-6 w-24" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonLinhasTabela({ colunas, linhas = 6 }: { colunas: number; linhas?: number }) {
  return (
    <>
      {Array.from({ length: linhas }).map((_, i) => (
        <tr key={i} className="border-b border-line last:border-0">
          {Array.from({ length: colunas }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <Bloco className={`h-4 ${j === 0 ? "w-40" : "w-16"}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Tabela inteira (cabeçalho + linhas) em modo carregando. */
export function SkeletonTabela({ colunas = 5, linhas = 8 }: { colunas?: number; linhas?: number }) {
  return (
    <div className="border border-line rounded-2xl bg-panel shadow-soft overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-panel2">
            {Array.from({ length: colunas }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Bloco className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <SkeletonLinhasTabela colunas={colunas} linhas={linhas} />
        </tbody>
      </table>
    </div>
  );
}

/** Cartão de seção (título + algumas linhas) em modo carregando. */
export function SkeletonSecao({ linhas = 3, className = "" }: { linhas?: number; className?: string }) {
  return (
    <div className={`border border-line rounded-2xl bg-panel px-4 py-4 shadow-soft space-y-3 ${className}`}>
      <Bloco className="h-3 w-44" />
      {Array.from({ length: linhas }).map((_, i) => (
        <Bloco key={i} className="h-5 w-full" />
      ))}
    </div>
  );
}

/** Textinho com spinner para atualizações que acontecem por cima de dados já exibidos. */
export function IndicadorAtualizando({ visivel }: { visivel: boolean }) {
  if (!visivel) return null;
  return (
    <span role="status" className="inline-flex items-center gap-1.5 text-xs text-muted">
      <span className="inline-block h-3 w-3 rounded-full border-2 border-frost/30 border-t-frost animate-spin" />
      Atualizando…
    </span>
  );
}

/* ---------- esqueletos de página inteira (usados nos loading.tsx e nas páginas client) ---------- */

export function PaginaCreditosSkeleton() {
  return (
    <CarregandoRegiao rotulo="Carregando painel de créditos…">
      <div className="flex flex-col gap-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Bloco className="h-6 w-28" />
            <Bloco className="h-4 w-96 max-w-full" />
          </div>
          <Bloco className="h-10 w-48" />
        </div>
        <SkeletonSecao linhas={3} />
        <SkeletonSecao linhas={3} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonSecao linhas={4} />
          <SkeletonSecao linhas={4} />
        </div>
      </div>
    </CarregandoRegiao>
  );
}

export function PaginaClientesSkeleton() {
  return (
    <CarregandoRegiao rotulo="Carregando carteira…">
      <SkeletonCabecalho comAcoes />
      <div className="grid grid-cols-3 gap-3 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Bloco key={i} className="h-[74px]" />
        ))}
      </div>
      <div className="flex gap-3 mb-4">
        <Bloco className="h-10 flex-1" />
        <Bloco className="h-10 w-64" />
      </div>
      <SkeletonTabela colunas={10} linhas={10} />
    </CarregandoRegiao>
  );
}

export function PaginaClienteDetalheSkeleton() {
  return (
    <CarregandoRegiao rotulo="Carregando cliente…">
      <Bloco className="h-4 w-40" />
      <div className="flex items-center justify-between mt-3 mb-6 gap-3">
        <Bloco className="h-8 w-72" />
        <Bloco className="h-8 w-32" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-line rounded-2xl bg-panel px-4 py-3.5 shadow-soft">
            <Bloco className="h-3 w-20 mb-3" />
            <Bloco className="h-6 w-28" />
          </div>
        ))}
      </div>
      <SkeletonSecao linhas={4} className="mb-4" />
      <SkeletonSecao linhas={3} className="mb-4" />
      <SkeletonTabela colunas={6} linhas={5} />
    </CarregandoRegiao>
  );
}

export function PaginaAlertasSkeleton() {
  return (
    <CarregandoRegiao rotulo="Carregando alertas…">
      <SkeletonCabecalho />
      <Bloco className="h-3 w-56 mb-4" />
      <SkeletonTabela colunas={5} linhas={6} />
    </CarregandoRegiao>
  );
}

export function PaginaConfiguracoesSkeleton() {
  return (
    <CarregandoRegiao rotulo="Carregando configurações…">
      <div className="max-w-2xl space-y-6">
        <SkeletonCabecalho />
        <SkeletonSecao linhas={2} />
        <SkeletonTabela colunas={3} linhas={3} />
      </div>
    </CarregandoRegiao>
  );
}
