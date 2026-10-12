import { ShieldCheck } from "lucide-react";
import LoginForm from "./login-form";

export const metadata = { title: "Entrar | Análise de Crédito" };

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  // só aceita caminho interno ("/algo"), nunca "//site.com" nem URL completa (open redirect)
  const next = searchParams.next;
  const destino = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-frost to-frostdark shadow-glow flex items-center justify-center">
            <ShieldCheck size={20} className="text-white" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-base font-semibold text-ink tracking-tight leading-tight">Carteira</p>
            <p className="text-xs text-muted leading-tight">análise de crédito</p>
          </div>
        </div>
        <div className="bg-panel border border-line rounded-2xl p-6">
          <h1 className="text-lg font-semibold text-ink mb-1">Entrar</h1>
          <p className="text-sm text-muted mb-5">Use o e-mail e a senha que você recebeu.</p>
          <LoginForm destino={destino} />
        </div>
      </div>
    </div>
  );
}
