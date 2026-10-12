"use client";

import { useSidebar } from "@/components/layout/SidebarContext";

/** Área da página: ocupa todo o espaço que sobra ao lado do menu (recolhido ou não). */
export default function ConteudoPrincipal({ children }: { children: React.ReactNode }) {
  const { recolhida } = useSidebar();
  return (
    <main className={`transition-[padding] duration-200 ${recolhida ? "lg:pl-[72px]" : "lg:pl-64"}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
    </main>
  );
}
