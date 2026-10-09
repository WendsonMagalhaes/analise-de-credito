// Declaração de tipo pra imports de CSS "puro" (globals.css), que o pacote
// `next` não declara — ele só declara tipo pra *.module.css (CSS Modules).
// Sem isso, com a flag noUncheckedSideEffectImports ligada, o TypeScript
// reclama que não sabe o que é "./globals.css" (erro TS2307/TS2882).
declare module "*.css";