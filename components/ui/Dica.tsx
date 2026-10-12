"use client";

/**
 * Balão de texto que aparece ao passar o mouse (ou focar com o teclado) sobre um ícone.
 * Usado para dar nome a ícones que, sozinhos, não dizem nada.
 */
export default function Dica({ texto, children }: { texto: string; children: React.ReactNode }) {
  return (
    <span tabIndex={0} aria-label={texto} className="group relative inline-flex items-center outline-none">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line bg-panel px-2.5 py-1.5 text-xs font-medium text-ink shadow-soft opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
      >
        {texto}
      </span>
    </span>
  );
}
