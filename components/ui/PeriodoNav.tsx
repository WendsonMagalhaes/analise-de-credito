"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PeriodoFiltro from "@/components/ui/PeriodoFiltro";
import { lerPeriodo, type Periodo } from "@/lib/periodo";

/** Seletor de período que grava o escolhido na URL (?periodo=mes|6m). Usado em telas de servidor. */
export default function PeriodoNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const atual = lerPeriodo(params.get("periodo"));

  function trocar(p: Periodo) {
    const q = new URLSearchParams(params.toString());
    if (p === "tudo") q.delete("periodo");
    else q.set("periodo", p);
    const s = q.toString();
    router.push(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }

  return <PeriodoFiltro valor={atual} onChange={trocar} />;
}
