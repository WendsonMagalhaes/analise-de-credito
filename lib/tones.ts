/**
 * Paleta semântica dos cards. As classes aparecem por extenso (em vez de
 * montadas com template string) para o Tailwind conseguir enxergá-las.
 *
 *  verde    saudável / recebido        amarelo  atenção
 *  vermelho risco / vencido            azul     informativo / a vencer
 *  roxo     crédito / limite           frost    marca (padrão do sistema)
 *  neutro   sem significado especial
 */
export type CardTone = "frost" | "verde" | "amarelo" | "vermelho" | "azul" | "roxo" | "neutro";

export const TONE_STYLES: Record<
  CardTone,
  { accent: string; text: string; chip: string; wash: string }
> = {
  frost: {
    accent: "border-l-frost",
    text: "text-frost",
    chip: "bg-frost/10 text-frost",
    wash: "bg-gradient-to-br from-frost/[0.06] to-transparent",
  },
  verde: {
    accent: "border-l-verde",
    text: "text-verde",
    chip: "bg-verdebg text-verde",
    wash: "bg-gradient-to-br from-verde/[0.07] to-transparent",
  },
  amarelo: {
    accent: "border-l-amarelo",
    text: "text-amarelo",
    chip: "bg-amarelobg text-amarelo",
    wash: "bg-gradient-to-br from-amarelo/[0.08] to-transparent",
  },
  vermelho: {
    accent: "border-l-vermelho",
    text: "text-vermelho",
    chip: "bg-vermelhobg text-vermelho",
    wash: "bg-gradient-to-br from-vermelho/[0.07] to-transparent",
  },
  azul: {
    accent: "border-l-azul",
    text: "text-azul",
    chip: "bg-azulbg text-azul",
    wash: "bg-gradient-to-br from-azul/[0.07] to-transparent",
  },
  roxo: {
    accent: "border-l-roxo",
    text: "text-roxo",
    chip: "bg-roxobg text-roxo",
    wash: "bg-gradient-to-br from-roxo/[0.07] to-transparent",
  },
  neutro: {
    accent: "border-l-line",
    text: "text-ink",
    chip: "bg-panel2 text-muted",
    wash: "",
  },
};
