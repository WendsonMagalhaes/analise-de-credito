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
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  UserCog,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { logoutAction } from "@/app/actions/auth";
import { useSidebar } from "./SidebarContext";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/alertas", label: "Alertas", icon: BellRing },
  { href: "/creditos", label: "Créditos", icon: Wallet },
  { href: "/upload", label: "Atualizar relatórios", icon: UploadCloud },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

const LINK_USUARIOS = { href: "/usuarios", label: "Usuários", icon: UserCog };
const LINK_MINHA_CONTA = { href: "/minha-conta", label: "Minha conta", icon: UserCircle };

function Brand({ compacto = false }: { compacto?: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 ${compacto ? "justify-center" : "px-2"}`}>
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-frost to-frostdark shadow-glow flex items-center justify-center shrink-0">
        <ShieldCheck size={18} className="text-white" strokeWidth={2.2} />
      </div>
      {!compacto && (
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink tracking-tight leading-tight truncate">Carteira</p>
          <p className="text-[11px] text-muted leading-tight truncate">análise de crédito</p>
        </div>
      )}
    </div>
  );
}

function SairBotao({ compacto = false }: { compacto?: boolean }) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        title="Sair"
        aria-label="Sair"
        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-muted hover:bg-panel2 hover:text-ink transition-colors ${
          compacto ? "justify-center w-full" : ""
        }`}
      >
        <LogOut size={17} strokeWidth={2.2} />
        {!compacto && <span>Sair</span>}
      </button>
    </form>
  );
}

/** Rodapé do menu: Sair e tema lado a lado (no recolhido, um embaixo do outro). */
function Rodape({ compacto = false }: { compacto?: boolean }) {
  if (compacto) {
    return (
      <div className="flex flex-col items-center gap-2 pt-4 border-t border-line">
        <SairBotao compacto />
        <ThemeToggle />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-2 pt-4 border-t border-line">
      <SairBotao />
      <ThemeToggle />
    </div>
  );
}

function NavLinks({
  pathname,
  onNavigate,
  compacto = false,
  links = LINKS,
}: {
  pathname: string | null;
  onNavigate?: () => void;
  compacto?: boolean;
  links?: typeof LINKS;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => {
        const ativo = pathname === l.href || (l.href === "/clientes" && pathname?.startsWith("/clientes"));
        const Icon = l.icon;
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            title={compacto ? l.label : undefined}
            aria-label={compacto ? l.label : undefined}
            className={`group flex items-center rounded-xl py-2.5 text-sm transition-colors ${
              compacto ? "justify-center" : "gap-3 px-3"
            } ${
              ativo
                ? "bg-frost/10 text-frost font-medium shadow-[inset_3px_0_0_rgb(var(--color-brand))]"
                : "text-muted hover:bg-panel2 hover:text-ink"
            }`}
          >
            <Icon size={17} strokeWidth={2.2} className={ativo ? "text-frost" : "text-muted group-hover:text-ink"} />
            {!compacto && <span className="truncate">{l.label}</span>}
            {!compacto && ativo && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-frost shrink-0" />}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar({ papel = null }: { papel?: string | null }) {
  const pathname = usePathname();
  const links = [...LINKS, ...(papel === "admin" ? [LINK_USUARIOS] : []), LINK_MINHA_CONTA];
  const [aberto, setAberto] = useState(false);
  const { recolhida, alternar } = useSidebar();

  // a tela de login não tem menu
  if (pathname === "/login") return null;

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
            <NavLinks pathname={pathname} onNavigate={() => setAberto(false)} links={links} />
            <div className="mt-auto">
              <Rodape />
            </div>
          </div>
        </div>
      )}

      {/* --- sidebar fixa desktop, recolhível --- */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 border-r border-line bg-panel py-5 gap-6 z-30 transition-[width] duration-200 ${
          recolhida ? "w-[72px] px-2.5" : "w-64 px-4"
        }`}
      >
        <div className={`flex items-center ${recolhida ? "flex-col gap-3" : "justify-between"}`}>
          <Brand compacto={recolhida} />
          <button
            onClick={alternar}
            aria-label={recolhida ? "Expandir menu" : "Recolher menu"}
            title={recolhida ? "Expandir menu" : "Recolher menu"}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:bg-panel2 hover:text-ink transition-colors shrink-0"
          >
            {recolhida ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {!recolhida && (
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">Navegação</p>
          )}
          <NavLinks pathname={pathname} compacto={recolhida} links={links} />
        </div>
        <Rodape compacto={recolhida} />
      </aside>
    </>
  );
}
