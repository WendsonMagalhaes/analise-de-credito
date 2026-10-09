"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

/**
 * Switch de tema claro/escuro. A classe "dark" na <html> é a fonte da
 * verdade (ver o script inline em layout.tsx, que já aplica antes do
 * primeiro paint pra não piscar). Aqui só refletimos/alternamos esse
 * estado e persistimos a escolha do usuário.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function alternar() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("tema", next ? "escuro" : "claro");
  }

  if (!mounted) {
    return <div className={`w-[52px] h-[28px] ${className}`} />;
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label="Alternar tema"
      className={`relative flex items-center w-[52px] h-[28px] rounded-full p-[3px] border border-line bg-panel2 transition-colors shrink-0 ${className}`}
    >
      <div
        className={`flex items-center justify-center w-[20px] h-[20px] rounded-full bg-panel shadow-soft transition-transform duration-300 ${
          isDark ? "translate-x-[24px]" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <Moon size={12} className="text-frost" strokeWidth={2.4} />
        ) : (
          <Sun size={12} className="text-frost" strokeWidth={2.4} />
        )}
      </div>
    </button>
  );
}
