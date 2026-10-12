"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type SidebarCtx = { recolhida: boolean; alternar: () => void };

const Contexto = createContext<SidebarCtx>({ recolhida: false, alternar: () => {} });
const CHAVE = "sidebar-recolhida";

/** Guarda se o menu lateral está recolhido, e lembra a escolha no navegador. */
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [recolhida, setRecolhida] = useState(false);

  // lê a preferência só depois de montar, para o servidor e o navegador baterem
  useEffect(() => {
    try {
      setRecolhida(window.localStorage.getItem(CHAVE) === "1");
    } catch {}
  }, []);

  function alternar() {
    const nova = !recolhida;
    setRecolhida(nova);
    try {
      window.localStorage.setItem(CHAVE, nova ? "1" : "0");
    } catch {}
  }

  return <Contexto.Provider value={{ recolhida, alternar }}>{children}</Contexto.Provider>;
}

export function useSidebar() {
  return useContext(Contexto);
}
