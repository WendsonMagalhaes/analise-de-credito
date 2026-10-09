/** Moldura padrão de tabela (borda, cantos, scroll horizontal em telas menores). */
export function TableShell({
  children,
  className = "",
  minWidth,
}: {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}) {
  return (
    <div className={`border border-line rounded-2xl bg-panel shadow-soft overflow-x-auto ${className}`}>
      <table className={`w-full text-sm ${minWidth ? `min-w-[${minWidth}]` : ""}`}>{children}</table>
    </div>
  );
}

export const theadRowClass = "border-b border-line text-left text-[11px] text-muted uppercase tracking-wide bg-gradient-to-b from-panel2 to-panel2/60";
export const thClass = "px-4 py-3 font-semibold text-left";
export const tdClass = "px-4 py-3 text-ink";
export const trClass = "border-b border-line last:border-0 hover:bg-frost/[0.05] transition-colors";

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-muted">
        {children}
      </td>
    </tr>
  );
}
