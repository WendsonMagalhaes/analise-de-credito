import { redirect } from "next/navigation";
import { apiServer, usuarioLogado } from "@/lib/server-api";
import GestaoUsuarios, { type UsuarioLista } from "@/components/usuarios/GestaoUsuarios";

/** Gestão de usuários: só administradores. A API também confere; aqui é o portão da página. */
export default async function UsuariosPage() {
  const eu = await usuarioLogado();
  if (!eu || eu.papel !== "admin") redirect("/dashboard");

  const res = await apiServer("/api/usuarios", { cache: "no-store" });
  const lista: UsuarioLista[] = res.ok ? await res.json() : [];
  return <GestaoUsuarios inicial={lista} euId={eu.id} />;
}
