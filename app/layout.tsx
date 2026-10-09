import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning className="font-sans bg-base text-ink min-h-screen antialiased">
        <Sidebar />
        <main className="lg:pl-64">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
