import LoadingSpinner from "@/components/ui/LoadingSpinner";

function Bloco({ className = "" }: { className?: string }) {
    return <div className={`animate-pulse rounded-xl bg-panel2 ${className}`} />;
}

/**
 * app/dashboard/loading.tsx — convenção do Next.js App Router: enquanto o
 * Server Component da página busca os dados (fetchDashboard, fetchPainelCredito
 * etc.), isso aparece automaticamente no lugar da tela em branco.
 */
export default function DashboardLoading() {
    return (
        <div className="flex flex-col gap-8" aria-busy="true">
            <LoadingSpinner rotulo="Carregando dashboard…" />

            {/* cabeçalho */}
            <div className="flex items-end justify-between gap-4 flex-wrap">
                <div className="space-y-2">
                    <Bloco className="h-7 w-40" />
                    <Bloco className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                    <Bloco className="h-9 w-28" />
                    <Bloco className="h-9 w-36" />
                </div>
            </div>

            {/* KPIs: Clientes / Em aberto hoje / Em aberto no mês / Vencidos / Recebido no mês / Score médio */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border border-line rounded-2xl bg-panel px-4 py-3.5 shadow-soft">
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <Bloco className="h-3 w-20" />
                            <Bloco className="h-7 w-7 rounded-lg" />
                        </div>
                        <Bloco className="h-6 w-24" />
                    </div>
                ))}
            </div>

            {/* vencidos por faixa + por carteira, e por vendedor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="border border-line rounded-2xl bg-panel px-4 py-4 shadow-soft space-y-3">
                        <Bloco className="h-3 w-48" />
                        {Array.from({ length: 4 }).map((_, j) => (
                            <Bloco key={j} className="h-5 w-full" />
                        ))}
                    </div>
                ))}
            </div>
            <div className="border border-line rounded-2xl bg-panel px-4 py-4 shadow-soft space-y-3">
                <Bloco className="h-3 w-44" />
                {Array.from({ length: 6 }).map((_, j) => (
                    <Bloco key={j} className="h-6 w-full" />
                ))}
            </div>

            {/* faixa de risco */}
            <div>
                <Bloco className="h-3 w-40 mb-2" />
                <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Bloco key={i} className="h-20" />
                    ))}
                </div>
            </div>

            {/* ações pendentes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Bloco key={i} className="h-20" />
                ))}
            </div>

            {/* concentração de risco + últimas decisões */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="border border-line rounded-2xl bg-panel px-4 py-4 shadow-soft space-y-3">
                        <Bloco className="h-3 w-48" />
                        {Array.from({ length: 4 }).map((_, j) => (
                            <Bloco key={j} className="h-5 w-full" />
                        ))}
                    </div>
                ))}
            </div>

            {/* aging + fluxo de caixa */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="border border-line rounded-2xl bg-panel px-4 py-4 shadow-soft space-y-3">
                        <Bloco className="h-3 w-56" />
                        <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 3 }).map((_, j) => (
                                <Bloco key={j} className="h-16" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}