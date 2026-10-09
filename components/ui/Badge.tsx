import { capitalizar } from "@/lib/format";

export type Tone = "verde" | "amarelo" | "vermelho" | "azul" | "roxo" | "neutro" | "frost";

const TONE_CLASS: Record<Tone, string> = {
  verde: "bg-verdebg text-verde ring-1 ring-inset ring-verde/20",
  amarelo: "bg-amarelobg text-amarelo ring-1 ring-inset ring-amarelo/25",
  vermelho: "bg-vermelhobg text-vermelho ring-1 ring-inset ring-vermelho/20",
  azul: "bg-azulbg text-azul ring-1 ring-inset ring-azul/20",
  roxo: "bg-roxobg text-roxo ring-1 ring-inset ring-roxo/20",
  neutro: "bg-panel2 text-muted ring-1 ring-inset ring-line",
  frost: "bg-frost/10 text-frost ring-1 ring-inset ring-frost/20",
};

/** Selo pequeno e colorido, padrão pro sistema todo (faixa de risco, status, aging, etc). */
export function Badge({
  tone = "neutro",
  children,
  className = "",
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

const FAIXA_TONE: Record<string, Tone> = { verde: "verde", amarelo: "amarelo", vermelho: "vermelho" };

export function FaixaBadge({
  faixa,
  score,
  mostrarRotulo = true,
}: {
  faixa: string;
  score?: number;
  /** false = mostra só o número (usado nas linhas de tabela, onde já existe uma coluna "Score"). */
  mostrarRotulo?: boolean;
}) {
  return (
    <Badge tone={FAIXA_TONE[faixa] || "neutro"}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {score != null ? (mostrarRotulo ? `${score}` : score) : capitalizar(faixa)}
    </Badge>
  );
}