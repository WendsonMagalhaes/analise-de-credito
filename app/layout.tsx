import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter é baixada no build e servida pelo próprio site (sem depender do Google Fonts no navegador).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});
import Sidebar from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import ConteudoPrincipal from "@/components/layout/ConteudoPrincipal";
import { usuarioLogado } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Carteira | Análise de Crédito",
  description: "Painel de análise de crédito de clientes",
};

// Aplica o tema salvo (ou a preferência do sistema) na tag <html> antes do
// primeiro paint, pra não piscar claro->escuro ao carregar a página.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var salvo = window.localStorage.getItem("tema");
    var escuro = salvo ? salvo === "escuro" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", escuro);
  } catch (e) {}
  document.documentElement.classList.add("theme-ready");
})();
`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const usuario = await usuarioLogado();
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} font-sans bg-base text-ink min-h-screen antialiased`}>
        <SidebarProvider>
          <Sidebar papel={usuario?.papel ?? null} />
          <ConteudoPrincipal>{children}</ConteudoPrincipal>
        </SidebarProvider>
      </body>
    </html>
  );
}
