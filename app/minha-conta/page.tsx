"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { logoutAction } from "@/app/actions/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Eye, EyeOff } from "lucide-react";

type Eu = { id: number; email: string; nome: string; papel: "admin" | "analista" | "leitura" };
type Msg = { tipo: "ok" | "erro"; texto: string };

const PAPEL_ROTULO = { admin: "Administrador", analista: "Analista", leitura: "Somente leitura" };

const campo =
  "w-full bg-panel2 border border-line rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/40";
const botaoPrimario =
  "bg-frost text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-frostdark transition-colors disabled:opacity-60";

async function mensagemErro(res: Response): Promise<string> {
  try {
    const d = await res.json();
    if (typeof d.detail === "string") return d.detail;
    if (Array.isArray(d.detail)) return d.detail.map((x: { msg: string }) => x.msg).join(" ");
  } catch {}
  return "Não foi possível concluir a ação.";
}

export default function MinhaContaPage() {
  const [eu, setEu] = useState<Eu | null>(null);
  const [nome, setNome] = useState("");
  const [msgPerfil, setMsgPerfil] = useState<Msg | null>(null);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirma, setConfirma] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [msgSenha, setMsgSenha] = useState<Msg | null>(null);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  useEffect(() => {
    apiFetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Eu | null) => {
        if (d) {
          setEu(d);
          setNome(d.nome);
        }
      });
  }, []);

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setSalvandoPerfil(true);
    setMsgPerfil(null);
    const r = await apiFetch("/api/auth/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });
    if (r.ok) {
      setEu(await r.json());
      setMsgPerfil({ tipo: "ok", texto: "Nome atualizado." });
    } else {
      setMsgPerfil({ tipo: "erro", texto: await mensagemErro(r) });
    }
    setSalvandoPerfil(false);
  }

  async function trocarSenha(e: React.FormEvent) {
    e.preventDefault();
    setMsgSenha(null);
    if (nova !== confirma) {
      setMsgSenha({ tipo: "erro", texto: "A confirmação não é igual à nova senha." });
      return;
    }
    setSalvandoSenha(true);
    const r = await apiFetch("/api/auth/trocar-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha_atual: atual, senha_nova: nova }),
    });
    if (r.ok) {
      setMsgSenha({ tipo: "ok", texto: "Senha alterada. Você será desconectado para entrar com a nova senha." });
      setTimeout(() => logoutAction(), 2000);
    } else {
      setMsgSenha({ tipo: "erro", texto: await mensagemErro(r) });
      setSalvandoSenha(false);
    }
  }

  return (
    <div>
      <PageHeader title="Minha conta" subtitle={eu ? eu.email : "carregando…"} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="rounded-2xl border border-line bg-panel p-5">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink">Meus dados</h2>
          <form onSubmit={salvarPerfil} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">Nome</span>
              <input required minLength={2} maxLength={120} value={nome} onChange={(e) => setNome(e.target.value)} className={campo} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">E-mail</span>
              <input value={eu?.email ?? ""} readOnly className={`${campo} opacity-70`} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">Papel</span>
              <input value={eu ? PAPEL_ROTULO[eu.papel] : ""} readOnly className={`${campo} opacity-70`} />
            </label>
            {msgPerfil && (
              <p role="status" className={`text-sm ${msgPerfil.tipo === "ok" ? "text-verde" : "text-vermelho"}`}>
                {msgPerfil.texto}
              </p>
            )}
            <div className="flex justify-end">
              <button type="submit" disabled={salvandoPerfil || !eu} className={botaoPrimario}>
                {salvandoPerfil ? "Salvando…" : "Salvar nome"}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-line bg-panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Trocar senha</h2>
            <button
              type="button"
              onClick={() => setMostrar((v) => !v)}
              aria-pressed={mostrar}
              aria-label={mostrar ? "Ocultar senhas" : "Mostrar senhas"}
              className="text-muted hover:text-ink"
            >
              {mostrar ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <form onSubmit={trocarSenha} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">Senha atual</span>
              <input type={mostrar ? "text" : "password"} required autoComplete="current-password" maxLength={128} value={atual} onChange={(e) => setAtual(e.target.value)} className={campo} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">Nova senha</span>
              <input type={mostrar ? "text" : "password"} required autoComplete="new-password" maxLength={128} value={nova} onChange={(e) => setNova(e.target.value)} className={campo} />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted">Confirmar nova senha</span>
              <input type={mostrar ? "text" : "password"} required autoComplete="new-password" maxLength={128} value={confirma} onChange={(e) => setConfirma(e.target.value)} className={campo} />
            </label>
            {msgSenha && (
              <p role="status" className={`text-sm ${msgSenha.tipo === "ok" ? "text-verde" : "text-vermelho"}`}>
                {msgSenha.texto}
              </p>
            )}
            <div className="flex justify-end">
              <button type="submit" disabled={salvandoSenha} className={botaoPrimario}>
                {salvandoSenha ? "Alterando…" : "Alterar senha"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
