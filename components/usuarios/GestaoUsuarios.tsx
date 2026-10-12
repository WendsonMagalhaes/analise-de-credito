"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import Dica from "@/components/ui/Dica";
import { TableShell, theadRowClass, thClass, tdClass, trClass, EmptyRow } from "@/components/ui/Table";
import { UserPlus, Pencil, Power, X } from "lucide-react";

export type Papel = "admin" | "analista" | "leitura";
export type UsuarioLista = {
  id: number;
  email: string;
  nome: string;
  papel: Papel;
  ativo: boolean;
  criado_em: string | null;
  ultimo_login: string | null;
};
type Msg = { tipo: "ok" | "erro"; texto: string };

const PAPEL_ROTULO: Record<Papel, string> = {
  admin: "Administrador",
  analista: "Analista",
  leitura: "Somente leitura",
};

/** Cor por papel, pelas variáveis do tema (não depende de classes do Tailwind). */
const PAPEL_COR: Record<Papel, string> = {
  admin: "rgb(var(--color-roxo))",
  analista: "rgb(var(--color-azul))",
  leitura: "rgb(var(--color-muted))",
};

const campo =
  "w-full bg-panel2 border border-line rounded-xl px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-frost/40";
const botaoPrimario =
  "bg-frost text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-frostdark transition-colors disabled:opacity-60";
const botaoSecundario =
  "border border-line text-ink px-4 py-2 rounded-xl text-sm font-medium hover:bg-panel2 transition-colors";

async function mensagemErro(res: Response): Promise<string> {
  try {
    const d = await res.json();
    if (typeof d.detail === "string") return d.detail;
    if (Array.isArray(d.detail)) return d.detail.map((x: { msg: string }) => x.msg).join(" ");
  } catch {}
  return "Não foi possível concluir a ação.";
}

export default function GestaoUsuarios({ inicial, euId }: { inicial: UsuarioLista[]; euId: number }) {
  const [lista, setLista] = useState<UsuarioLista[]>(inicial);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [criando, setCriando] = useState(false);
  const [novo, setNovo] = useState({ email: "", nome: "", senha: "", papel: "analista" as Papel });
  const [editando, setEditando] = useState<UsuarioLista | null>(null);
  const [edicao, setEdicao] = useState({ nome: "", papel: "analista" as Papel, senha: "" });
  const [salvando, setSalvando] = useState(false);

  async function recarregar() {
    const r = await apiFetch("/api/usuarios", { cache: "no-store" });
    if (r.ok) setLista(await r.json());
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setMsg(null);
    const r = await apiFetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novo),
    });
    if (r.ok) {
      setMsg({ tipo: "ok", texto: `Usuário ${novo.email} criado.` });
      setNovo({ email: "", nome: "", senha: "", papel: "analista" });
      setCriando(false);
      await recarregar();
    } else {
      setMsg({ tipo: "erro", texto: await mensagemErro(r) });
    }
    setSalvando(false);
  }

  function abrirEdicao(u: UsuarioLista) {
    setEditando(u);
    setEdicao({ nome: u.nome, papel: u.papel, senha: "" });
    setMsg(null);
  }

  async function salvarEdicao(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setSalvando(true);
    setMsg(null);
    const corpo: Record<string, unknown> = { nome: edicao.nome, papel: edicao.papel };
    if (edicao.senha) corpo.senha = edicao.senha;
    const r = await apiFetch(`/api/usuarios/${editando.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    if (r.ok) {
      setMsg({ tipo: "ok", texto: "Alterações salvas." });
      setEditando(null);
      await recarregar();
    } else {
      setMsg({ tipo: "erro", texto: await mensagemErro(r) });
    }
    setSalvando(false);
  }

  async function alternarAtivo(u: UsuarioLista) {
    const acao = u.ativo ? "desativar" : "reativar";
    if (!confirm(`Quer ${acao} o acesso de ${u.nome}?`)) return;
    setMsg(null);
    const r = await apiFetch(`/api/usuarios/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !u.ativo }),
    });
    if (r.ok) {
      setMsg({ tipo: "ok", texto: `Acesso de ${u.nome} ${u.ativo ? "desativado" : "reativado"}.` });
      await recarregar();
    } else {
      setMsg({ tipo: "erro", texto: await mensagemErro(r) });
    }
  }

  return (
    <div>
      <PageHeader
        title="Usuários"
        subtitle={`${lista.length} usuário(s) · somente administradores`}
        actions={
          <button
            type="button"
            onClick={() => {
              setCriando((v) => !v);
              setEditando(null);
              setMsg(null);
            }}
            className={`flex items-center gap-1.5 ${botaoPrimario}`}
          >
            <UserPlus size={15} /> Novo usuário
          </button>
        }
      />

      {msg && (
        <div
          role="status"
          className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
            msg.tipo === "ok" ? "border-verde/40 text-verde" : "border-vermelho/40 text-vermelho"
          }`}
        >
          {msg.texto}
        </div>
      )}

      {criando && (
        <form onSubmit={criar} className="mb-6 rounded-2xl border border-line bg-panel p-5 grid gap-4 md:grid-cols-2">
          <h2 className="md:col-span-2 text-sm font-bold uppercase tracking-wide text-ink">Novo usuário</h2>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Nome</span>
            <input required minLength={2} maxLength={120} value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} className={campo} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">E-mail</span>
            <input required type="email" maxLength={254} value={novo.email} onChange={(e) => setNovo({ ...novo, email: e.target.value })} className={campo} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Senha inicial</span>
            <input required type="password" autoComplete="new-password" maxLength={128} value={novo.senha} onChange={(e) => setNovo({ ...novo, senha: e.target.value })} className={campo} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Papel</span>
            <select value={novo.papel} onChange={(e) => setNovo({ ...novo, papel: e.target.value as Papel })} className={campo}>
              <option value="analista">Analista</option>
              <option value="leitura">Somente leitura</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setCriando(false)} className={botaoSecundario}>Cancelar</button>
            <button type="submit" disabled={salvando} className={botaoPrimario}>{salvando ? "Criando…" : "Criar usuário"}</button>
          </div>
        </form>
      )}

      {editando && (
        <form onSubmit={salvarEdicao} className="mb-6 rounded-2xl border border-line bg-panel p-5 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-ink">Editar · {editando.email}</h2>
            <button type="button" onClick={() => setEditando(null)} aria-label="Fechar" className="text-muted hover:text-ink">
              <X size={16} />
            </button>
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Nome</span>
            <input required minLength={2} maxLength={120} value={edicao.nome} onChange={(e) => setEdicao({ ...edicao, nome: e.target.value })} className={campo} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Papel</span>
            <select
              value={edicao.papel}
              disabled={editando.id === euId}
              onChange={(e) => setEdicao({ ...edicao, papel: e.target.value as Papel })}
              className={`${campo} disabled:opacity-60`}
            >
              <option value="analista">Analista</option>
              <option value="leitura">Somente leitura</option>
              <option value="admin">Administrador</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-xs font-medium text-muted">Redefinir senha (deixe em branco para manter)</span>
            <input type="password" autoComplete="new-password" maxLength={128} value={edicao.senha} onChange={(e) => setEdicao({ ...edicao, senha: e.target.value })} className={campo} />
            <span className="text-xs text-muted">Ao redefinir, o usuário é desconectado e precisa entrar de novo.</span>
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setEditando(null)} className={botaoSecundario}>Cancelar</button>
            <button type="submit" disabled={salvando} className={botaoPrimario}>{salvando ? "Salvando…" : "Salvar"}</button>
          </div>
        </form>
      )}

      <TableShell>
        <thead>
          <tr className={theadRowClass}>
            <th className={thClass}>Nome</th>
            <th className={thClass}>E-mail</th>
            <th className={thClass}>Papel</th>
            <th className={thClass}>Status</th>
            <th className={thClass}>Último acesso</th>
            <th className={`${thClass} text-right`}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {lista.length === 0 && <EmptyRow colSpan={6}>Nenhum usuário cadastrado.</EmptyRow>}
          {lista.map((u) => {
            const voce = u.id === euId;
            return (
              <tr key={u.id} className={trClass}>
                <td className={`${tdClass} font-medium`}>
                  {u.nome} {voce && <span className="text-xs text-muted">(você)</span>}
                </td>
                <td className={tdClass}>{u.email}</td>
                <td className={tdClass}>
                  <span className="font-semibold" style={{ color: PAPEL_COR[u.papel] }}>{PAPEL_ROTULO[u.papel]}</span>
                </td>
                <td className={tdClass}>
                  <span className="font-semibold" style={{ color: u.ativo ? "rgb(var(--color-brand))" : "rgb(var(--color-vermelho))" }}>
                    {u.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className={`${tdClass} text-muted`}>
                  {u.ultimo_login ? new Date(u.ultimo_login).toLocaleString("pt-BR") : "Nunca"}
                </td>
                <td className={`${tdClass} text-right`}>
                  <div className="flex items-center justify-end gap-3">
                    <Dica texto="Editar">
                      <button type="button" aria-label={`Editar ${u.nome}`} onClick={() => abrirEdicao(u)} className="text-muted hover:text-frost">
                        <Pencil size={16} />
                      </button>
                    </Dica>
                    {!voce && (
                      <Dica texto={u.ativo ? "Desativar acesso" : "Reativar acesso"}>
                        <button
                          type="button"
                          aria-label={u.ativo ? `Desativar ${u.nome}` : `Reativar ${u.nome}`}
                          onClick={() => alternarAtivo(u)}
                          className={u.ativo ? "text-muted hover:text-vermelho" : "text-muted hover:text-verde"}
                        >
                          <Power size={16} />
                        </button>
                      </Dica>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableShell>
    </div>
  );
}
