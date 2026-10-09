/**
 * Indicador discreto de carregamento: anel pequeno girando + tempo decorrido
 * em milissegundos (ex.: 20202ms), centralizado na área de conteúdo.
 *
 * O contador é CSS puro (.contador-ms em globals.css), então conta desde o
 * primeiro paint, inclusive quando o loading.tsx é servido enquanto o Server
 * Component ainda espera o backend. Some junto com o skeleton quando os dados
 * chegam. Não bloqueia cliques.
 */
export default function LoadingSpinner({ rotulo = "Carregando…" }: { rotulo?: string }) {
  return (
    <div
      role="status"
      aria-label={rotulo}
      className="pointer-events-none fixed inset-x-0 bottom-0 top-14 z-20 flex items-center justify-center lg:left-64 lg:top-0"
    >
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-panel/90 px-5 py-4 shadow-soft backdrop-blur">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-line border-t-frost" />
        <span aria-hidden className="contador-ms inline-block min-w-[9ch] text-center text-sm font-medium tabular text-ink" />
        <span className="text-xs text-muted">{rotulo}</span>
      </div>
    </div>
  );
}
