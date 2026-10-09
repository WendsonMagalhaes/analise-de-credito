"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BellRing,
  Wallet,
  UploadCloud,
  Settings,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/alertas", label: "Alertas", icon: BellRing },
  { href: "/creditos", label: "Créditos", icon: Wallet },
  { href: "/upload", label: "Atualizar relatórios", icon: UploadCloud },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-frost to-frostdark shadow-glow flex items-center justify-center shrink-0">
        <ShieldCheck size={18} className="text-white" strokeWidth={2.2} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink tracking-tight leading-tight truncate">Carteira</p>
        <p className="text-[11px] text-muted leading-tight truncate">análise de crédito</p>
      </div>
    </div>
  );
}

function NavLinks({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((l) => {
        const ativo = pathname === l.href || (l.href === "/clientes" && pathname?.startsWith("/clientes"));
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              ativo
                ? "bg-frost/10 text-frost font-medium shadow-[inset_3px_0_0_rgb(var(--color-brand))]"
                : "text-muted hover:bg-panel2 hover:text-ink"
            }`}
          >
            <Icon
              size={17}
              strokeWidth={2.2}
              className={ativo ? "text-frost" : "text-muted group-hover:text-ink"}
            />
            <span className="truncate">{l.label}</span>
            {ativo && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-frost shrink-0" />}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);

  return (
    <>
      {/* --- topbar mobile --- */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-3 px-4 h-14 border-b border-line bg-panel/90 backdrop-blur">
        <button
          onClick={() => setAberto(true)}
          aria-label="Abrir menu"
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-line text-ink hover:bg-panel2 transition-colors"
        >
          <Menu size={18} />
        </button>
        <Brand />
        <ThemeToggle />
      </header>

      {/* --- drawer mobile --- */}
      {aberto && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAberto(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-panel border-r border-line p-4 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <Brand />
              <button
                onClick={() => setAberto(false)}
                aria-label="Fechar menu"
                className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:bg-panel2"
              >
                <X size={16} />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setAberto(false)} />
            <div className="mt-auto flex items-center justify-between px-2 pt-4 border-t border-line">
              <span className="text-xs text-muted">Tema</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}

      {/* --- sidebar fixa desktop --- */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 border-r border-line bg-panel px-4 py-5 gap-6 z-30">
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">Navegação</p>
          <NavLinks pathname={pathname} />
        </div>
        <div className="flex items-center justify-between px-2 pt-4 border-t border-line">
          <span className="text-xs text-muted">Tema</span>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
