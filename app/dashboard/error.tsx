"use client";

import { useEffect } from "react";
import { RefreshCw, WifiOff } from "lucide-react";

/**
 * app/dashboard/error.tsx — convenção do Next.js App Router: se o Server
 * Component da página (fetchDashboard, fetchPainelCredito etc.) lançar um
 * erro, isso aparece automaticamente em vez de deixar a página presa na
 * tela de loading.tsx pra sempre.
 */
export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="text-center py-24 border border-dashed border-vermelho/40 rounded-2xl bg-vermelhobg">
            <div className="w-14 h-14 rounded-2xl bg-vermelho/10 text-vermelho flex items-center justify-center mx-auto mb-4">
                <WifiOff size={24} strokeWidth={2} />
            </div>
            <p className="text-ink text-lg font-medium mb-2">Não foi possível carregar o dashboard</p>
            <p className="text-muted text-sm mb-6 max-w-md mx-auto">
                {error.message || "O servidor não respondeu. Verifique se o backend está no ar."}
            </p>
            <button
                onClick={reset}
                className="inline-flex items-center gap-2 bg-frost text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-soft hover:bg-frostdark hover:shadow-glow active:scale-[0.98] transition-all"
            >
                <RefreshCw size={14} /> Tentar novamente
            </button>
        </div>
    );
}