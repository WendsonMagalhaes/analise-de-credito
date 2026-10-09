import { TONE_STYLES, type CardTone } from "@/lib/tones";

export type StatTone = "verde" | "vermelho" | "amarelo" | "azul" | "roxo" | "neutro";
export type StatIcon = React.ComponentType<{ size?: number | string; className?: string }>;

/**
 * Card de estatística padrão — usado no dashboard, na lista de clientes e
 * no detalhe do cliente, pra manter o mesmo formato de número + rótulo em
 * todo o sistema. `icon` aceita qualquer ícone do lucide-react.
 *
 * - `tone` colore o número e a faixa lateral (verde = bom, vermelho = risco...).
 * - `accent` colore só a faixa lateral e o ícone, sem mexer na cor do número
 *   (útil pra separar categorias: azul = informativo, roxo = crédito).
 */
export function StatCard({
  label,
  value,
  tone = "neutro",
  accent,
  destaque = false,
  hint,
  size = "md",
  href,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  tone?: StatTone;
  accent?: CardTone;
  destaque?: boolean;
  hint?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
  icon?: StatIcon;
}) {
  // sem tom nem accent: faixa na cor da marca, mais suave
  const corFaixa: CardTone = accent ?? (tone === "neutro" ? "frost" : tone);
  const estilo = TONE_STYLES[corFaixa];
  const faixaSuave = !accent && tone === "neutro";

  const corTexto = tone === "neutro" ? "text-ink" : TONE_STYLES[tone].text;
  const valueSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";

  const conteudo = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted uppercase tracking-wide pt-0.5">{label}</p>
        {Icon && (
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${estilo.chip}`}>
            <Icon size={14} />
          </span>
        )}
      </div>
      <p className={`${valueSize} font-semibold tabular mt-1.5 ${corTexto}`}>{value}</p>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </>
  );

  const classes = [
    "relative block bg-panel border border-line border-l-4 rounded-2xl px-4 py-3.5",
    faixaSuave ? "border-l-frost/40" : estilo.accent,
    destaque ? `${estilo.wash} shadow-card` : "shadow-soft",
    href ? "transition-all hover:-translate-y-0.5 hover:shadow-lift" : "",
  ].join(" ");

  if (href) {
    return (
      <a href={href} className={classes}>
        {conteudo}
      </a>
    );
  }
  return <div className={classes}>{conteudo}</div>;
}
