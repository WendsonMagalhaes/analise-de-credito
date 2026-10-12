"use client";

import { useEffect } from "react";

import {
  TimerDisplay,
  TimerIcon,
  TimerRoot,
  useTimer,
} from "@/components/ui/timer";

/**
 * Indicador de carregamento: mostra o tempo decorrido com o componente Timer
 * (cult-ui). A contagem começa quando o spinner aparece.
 */
export default function LoadingSpinner({ rotulo = "Carregando…" }: { rotulo?: string }) {
  const { formattedTime, start } = useTimer({ format: "MM:SS" });

  useEffect(() => {
    start();
    // iniciar uma única vez, quando o spinner aparece
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="status"
      aria-label={rotulo}
      className="pointer-events-none fixed inset-x-0 bottom-0 top-14 z-20 flex items-center justify-center lg:left-64 lg:top-0"
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-panel px-6 py-4 shadow-soft">
        <TimerRoot variant="outline" size="lg">
          <TimerIcon loading={true} />
          <TimerDisplay time={formattedTime.display} />
        </TimerRoot>
        <span className="text-sm font-medium text-ink/80">{rotulo}</span>
      </div>
    </div>
  );
}
