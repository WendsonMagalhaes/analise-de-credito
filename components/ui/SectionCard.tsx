import { TONE_STYLES, type CardTone } from "@/lib/tones";

/**
 * Cartão com título + conteúdo — o container padrão pra qualquer bloco de informação.
 * Sem `tone` fica neutro; com `tone` ganha a faixa colorida na lateral esquerda
 * (use pelo significado: vermelho = risco, azul = informativo, roxo = crédito...).
 */
export function SectionCard({
  title,
  actions,
  children,
  className = "",
  tone,
}: {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  tone?: CardTone;
}) {
  const faixa = tone ? `border-l-4 ${TONE_STYLES[tone].accent}` : "";
  return (
    <div className={`border border-line ${faixa} rounded-2xl bg-panel px-5 py-4 shadow-soft ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-3.5 gap-3">
          {title && (
            <p
              className={`text-[11px] uppercase tracking-widest font-semibold ${
                tone ? TONE_STYLES[tone].text : "text-muted"
              }`}
            >
              {title}
            </p>
          )}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
